import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook para reconocimiento de voz usando Web Speech API
 */
const useSpeechRecognition = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);

  // Mapeo de códigos de idioma a BCP47
  const langMap = {
    'es': 'es-ES',
    'en': 'en-US',
    'pt': 'pt-BR'
  };

  useEffect(() => {
    // Comprobar soporte
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const initRecognition = (lang) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = langMap[lang] || 'es-ES'; // Por defecto español

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let currentTranscript = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentTranscript += event.results[i][0].transcript + ' ';
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      setTranscript(prev => prev + currentTranscript);
      setInterimTranscript(currentInterim);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setError(event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        shouldListenRef.current = false;
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Workaround para iOS / reconexión automática si debería seguir escuchando
      if (shouldListenRef.current) {
        try {
          recognitionRef.current?.start();
        } catch (e) {
          console.error('Error restarting recognition', e);
          shouldListenRef.current = false;
        }
      }
    };

    return recognition;
  };

  const start = useCallback((lang = 'es') => {
    if (!isSupported) {
      setError('not-supported');
      return;
    }
    
    setError(null);
    shouldListenRef.current = true;
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    recognitionRef.current = initRecognition(lang);
    
    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.error('Failed to start recognition', e);
      setError('start-failed');
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    shouldListenRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    reset
  };
};

export default useSpeechRecognition;
