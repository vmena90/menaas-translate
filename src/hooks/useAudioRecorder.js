import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Hook personalizado para grabar audio usando MediaRecorder y Web Audio API
 */
const useAudioRecorder = () => {
  const [state, setState] = useState('idle'); // 'idle', 'recording', 'paused', 'stopped'
  const [audioBlob, setAudioBlob] = useState(null);
  const [mimeType, setMimeType] = useState(null);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState(null);
  const [permissionState, setPermissionState] = useState('prompt'); // 'prompt', 'granted', 'denied'

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // Web Audio API refs para el nivel de audio
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        if (track.enabled) track.enabled = false;
      });
      streamRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }

    mediaRecorderRef.current = null;
    streamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
  }, []);

  const getBestMimeType = () => {
    const types = [
      'audio/mp4', // Prioridad para iOS
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp3',
      'audio/aac'
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return ''; // Por defecto, dejar que el navegador elija
  };

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Detener el stream después de pedir permiso
      setPermissionState('granted');
      return true;
    } catch (err) {
      setPermissionState('denied');
      setError(err instanceof Error ? err.message : 'Permiso denegado para acceder al micrófono');
      return false;
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const updateAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    
    const average = sum / bufferLength;
    // Normalizar a un valor entre 0 y 1
    const level = Math.min(average / 128, 1);
    setAudioLevel(level);
    
    if (state === 'recording') {
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  };

  const start = async () => {
    try {
      setError(null);
      setDuration(0);
      setAudioBlob(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;

      const bestMimeType = getBestMimeType();
      setMimeType(bestMimeType);

      const options = bestMimeType ? { mimeType: bestMimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const type = mediaRecorder.mimeType || 'audio/webm'; // Fallback
        const blob = new Blob(chunksRef.current, { type });
        setAudioBlob(blob);
        setState('stopped');
      };

      mediaRecorder.start(1000); // Obtener chunks cada 1000ms

      // Configurar Web Audio API para el nivel de volumen
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      setState('recording');
      startTimer();
      updateAudioLevel();

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al iniciar la grabación';
      setError(errorMsg);
      setState('idle');
      throw new Error(errorMsg);
    }
  };

  const pause = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setState('paused');
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const resume = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setState('recording');
      startTimer();
      updateAudioLevel();
    }
  };

  const stop = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          track.enabled = false;
        });
        streamRef.current = null;
      }
      setAudioLevel(0);
    }
  };

  const reset = () => {
    cleanup();
    setState('idle');
    setAudioBlob(null);
    setDuration(0);
    setAudioLevel(0);
    setError(null);
    chunksRef.current = [];
  };

  return {
    state,
    audioBlob,
    mimeType,
    duration,
    audioLevel,
    error,
    permissionState,
    start,
    pause,
    resume,
    stop,
    reset,
    requestPermission
  };
};

export default useAudioRecorder;
