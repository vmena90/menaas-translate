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
 * Proveedor 0: API Proxy Seguro (Groq LLM)
 */
const translateGroqLlama = async (text, source, target) => {
  const response = await fetchWithTimeout('/api/ai-proxy?action=translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      source,
      target
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

  // Intento 0: API Proxy Seguro (Llama 3)
  try {
    const translatedText = await translateGroqLlama(text, sourceLang, targetLang);
    translationCache.set(cacheKey, translatedText);
    return { translatedText, provider: 'Groq-Llama3-Proxy' };
  } catch (err) {
    errors.push(`Groq-Llama3-Proxy: ${err.message}`);
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
