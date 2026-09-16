export const config = {
  runtime: 'edge', // Usar Edge Network para streaming directo y baja latencia
};

// In-memory rate limiting (por instancia Edge)
const rateLimit = new Map();
const LIMIT = 20; // max peticiones
const WINDOW_MS = 60000; // 1 minuto

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action'); // 'transcribe' o 'translate'
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    // Rate Limiting Básico
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const userLimit = rateLimit.get(ip) || { count: 0, startTime: now };
    
    if (now - userLimit.startTime > WINDOW_MS) {
      userLimit.count = 1;
      userLimit.startTime = now;
    } else {
      userLimit.count++;
      if (userLimit.count > LIMIT) {
        return new Response('Too Many Requests', { status: 429 });
      }
    }
    rateLimit.set(ip, userLimit);

    if (!GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: 'Server misconfiguration: No API Key' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // --- RUTA 1: TRANSCRIPCIÓN (Audio) ---
    if (action === 'transcribe') {
      const contentType = req.headers.get('content-type');
      if (!contentType || !contentType.includes('multipart/form-data')) {
        return new Response('Bad Request', { status: 400 });
      }

      const groqReq = new Request('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': contentType
        },
        body: req.body,
        duplex: 'half'
      });

      const groqRes = await fetch(groqReq);
      const data = await groqRes.json();
      
      return new Response(JSON.stringify(data), {
        status: groqRes.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // --- RUTA 2: TRADUCCIÓN (LLM) ---
    if (action === 'translate') {
      const body = await req.json();
      const { text, source, target } = body;

      if (!text || typeof text !== 'string' || text.length > 5000) {
        return new Response('Payload too large or invalid', { status: 400 });
      }

      const groqReq = new Request('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: `You are a professional translator. Translate the following text from ${source} to ${target}. Preserve the exact tone, meaning, and context. Do NOT add any extra text, explanations, or notes. ONLY return the translated text.`
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.3
        })
      });

      const groqRes = await fetch(groqReq);
      const data = await groqRes.json();
      
      return new Response(JSON.stringify(data), {
        status: groqRes.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    return new Response('Invalid action', { status: 400 });

  } catch (error) {
    console.error('Edge Proxy Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
