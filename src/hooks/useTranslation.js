import { useState, useCallback } from 'react';
import { translate as translateService } from '../services/translationService';

/**
 * Hook simple para utilizar el servicio de traducción
 */
const useTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(null);

  const translate = useCallback(async (text, sourceLang, targetLang, customUrl) => {
    if (!text || text.trim() === '') {
      setTranslatedText('');
      setProvider(null);
      return '';
    }

    setIsTranslating(true);
    setError(null);
    
    try {
      const result = await translateService(text, sourceLang, targetLang, customUrl);
      setTranslatedText(result.translatedText);
      setProvider(result.provider);
      return result.translatedText;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al traducir';
      setError(errorMessage);
      setProvider(null);
      return null;
    } finally {
      setIsTranslating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsTranslating(false);
    setTranslatedText('');
    setError(null);
    setProvider(null);
  }, []);

  return {
    translate,
    isTranslating,
    translatedText,
    error,
    provider,
    reset
  };
};

export default useTranslation;
