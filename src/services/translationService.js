/**
 * Servicio de traducción con múltiples proveedores (cadena de respaldo)
 */

// Caché en memoria simple
const translationCache = new Map();

export const getSupportedLanguages = () => {
  return [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'Inglés' },
    { code: 'pt', name: 'Portugués' }
  ];
};

/**
 * Función auxiliar para fetch con timeout
 */
const fetchWithTimeout = async (url, options = {}, timeoutMs = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

/**
 * Proveedor 0: Groq LLM (El más inteligente, requiere API Key)
 */
const translateGroqLlama = async (text, source, target) => {
  const apiKey = localStorage.getItem('groqApiKey');
  if (!apiKey) throw new Error('No Groq API Key');

  const langMap = { es: 'Español', en: 'Inglés', pt: 'Portugués' };
  const targetLangName = langMap[target] || target;
  const sourceLangName = langMap[source] || source;

  const response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text from ${sourceLangName} to ${targetLangName}. Preserve the exact tone, meaning, and context. Do NOT add any extra text, explanations, or notes. ONLY return the translated text.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3
    })
  });

  if (!response.ok) throw new Error(`Groq LLM error: ${response.status}`);
  
  const data = await response.json();
  return data.choices[0].message.content.trim();
};

/**
 * Proveedor 1: MyMemory API (Primario Gratis)
 */
const translateMyMemory = async (text, source, target) => {
  const encodedText = encodeURIComponent(text);
  const langpair = `${source}|${target}`;
  const email = 'voiceclass@app.com';
  const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${langpair}&de=${email}`;
  
  const response = await fetchWithTimeout(url);
  if (!response.ok) throw new Error(`MyMemory HTTP error: ${response.status}`);
  
  const data = await response.json();
  if (data.responseStatus !== 200) {
    throw new Error(`MyMemory API error: ${data.responseStatus}`);
  }
  
  return data.responseData.translatedText;
};

/**
 * Proveedor 2: Lingva Translate (Respaldo 1)
 */
const translateLingva = async (text, source, target) => {
  const encodedText = encodeURIComponent(text);
  const url = `https://lingva.ml/api/v1/${source}/${target}/${encodedText}`;
  
  const response = await fetchWithTimeout(url);
  if (!response.ok) throw new Error(`Lingva HTTP error: ${response.status}`);
  
  const data = await response.json();
  if (!data.translation) throw new Error('Lingva missing translation');
  
  return data.translation;
};

/**
 * Proveedor 3: LibreTranslate (Respaldo 2)
 */
const translateLibreTranslate = async (text, source, target, customUrl = 'https://libretranslate.de') => {
  const url = `${customUrl}/translate`;
  
  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      q: text,
      source: source,
      target: target,
      format: 'text'
    })
  });
  
  if (!response.ok) throw new Error(`LibreTranslate HTTP error: ${response.status}`);
  
  const data = await response.json();
  if (!data.translatedText) throw new Error('LibreTranslate missing translatedText');
  
  return data.translatedText;
};

/**
 * Traduce un texto usando una cadena de proveedores
 */
export const translate = async (text, sourceLang, targetLang, customLibreTranslateUrl) => {
  if (!text || text.trim() === '') {
    return { translatedText: '', provider: 'none' };
  }
  
  if (sourceLang === targetLang) {
    return { translatedText: text, provider: 'none' };
  }

  // Comprobar caché
  const cacheKey = `${text}|${sourceLang}|${targetLang}`;
  if (translationCache.has(cacheKey)) {
    return { translatedText: translationCache.get(cacheKey), provider: 'cache' };
  }

  const errors = [];

  // Intento 0: Groq Llama 3 (El más inteligente)
  if (localStorage.getItem('groqApiKey')) {
    try {
      const translatedText = await translateGroqLlama(text, sourceLang, targetLang);
      translationCache.set(cacheKey, translatedText);
      return { translatedText, provider: 'Groq-Llama3' };
    } catch (err) {
      errors.push(`Groq-Llama3: ${err.message}`);
    }
  }

  // Intento 1: MyMemory
  try {
    const translatedText = await translateMyMemory(text, sourceLang, targetLang);
    translationCache.set(cacheKey, translatedText);
    return { translatedText, provider: 'MyMemory' };
  } catch (err) {
    errors.push(`MyMemory: ${err.message}`);
  }

  // Intento 2: Lingva
  try {
    const translatedText = await translateLingva(text, sourceLang, targetLang);
    translationCache.set(cacheKey, translatedText);
    return { translatedText, provider: 'Lingva' };
  } catch (err) {
    errors.push(`Lingva: ${err.message}`);
  }

  // Intento 3: LibreTranslate
  try {
    const translatedText = await translateLibreTranslate(text, sourceLang, targetLang, customLibreTranslateUrl);
    translationCache.set(cacheKey, translatedText);
    return { translatedText, provider: 'LibreTranslate' };
  } catch (err) {
    errors.push(`LibreTranslate: ${err.message}`);
  }

  // Si llegamos aquí, todos fallaron
  throw new Error(`Traducción fallida en todos los proveedores. Errores: ${errors.join(', ')}`);
};
