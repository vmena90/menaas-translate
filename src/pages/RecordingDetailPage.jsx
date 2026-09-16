import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecordingById, getSubjectById } from '../db/database';

function RecordingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recording, setRecording] = useState(null);
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados del reproductor
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeedIdx, setPlaybackSpeedIdx] = useState(0);
  const speeds = ['1.0x', '1.25x', '1.5x', '2.0x'];
  const [isMuted, setIsMuted] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentTimeCode, setCurrentTimeCode] = useState('00:00');
  const audioRef = useRef(null);
  
  // Estado de la pestaña
  const [activeTab, setActiveTab] = useState('dual');

  // Estado del toast
  const [toast, setToast] = useState({ show: false, message: '' });
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const rec = await getRecordingById(Number(id));
        if (rec) {
          setRecording(rec);
          if (rec.subjectId) {
            const sub = await getSubjectById(rec.subjectId);
            setSubject(sub);
          }
        }
      } catch (error) {
        console.error('Error al cargar la grabación:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 2200);
  };

  useEffect(() => {
    if (recording?.audioBlob) {
      const url = URL.createObjectURL(recording.audioBlob);
      const audioEl = new Audio(url);
      audioRef.current = audioEl;

      const handleTimeUpdate = () => {
        const t = Math.floor(audioEl.currentTime);
        const m = Math.floor(t / 60).toString().padStart(2, '0');
        const s = (t % 60).toString().padStart(2, '0');
        setCurrentTimeCode(`${m}:${s}`);
      };

      audioEl.addEventListener('timeupdate', handleTimeUpdate);
      audioEl.addEventListener('ended', () => setIsPlaying(false));

      return () => {
        audioEl.removeEventListener('timeupdate', handleTimeUpdate);
        audioEl.pause();
        audioEl.src = '';
        URL.revokeObjectURL(url);
      };
    }
  }, [recording]);

  const togglePlayState = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      showToast('Reproducción pausada');
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      showToast('Reproducción reanudada');
    }
  };

  const cycleSpeed = () => {
    const nextIdx = (playbackSpeedIdx + 1) % speeds.length;
    setPlaybackSpeedIdx(nextIdx);
    if (audioRef.current) {
      audioRef.current.playbackRate = parseFloat(speeds[nextIdx]);
    }
    showToast(`Velocidad ajustada: ${speeds[nextIdx]}`);
  };

  const skipTime = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
    showToast(`${seconds > 0 ? '+' : ''}${seconds}s desplazados`);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
    showToast(!isMuted ? 'Audio silenciado' : 'Volumen restaurado');
  };

  const toggleFav = () => {
    setIsFavorited(!isFavorited);
    showToast(!isFavorited ? 'Guardado en favoritos' : 'Eliminado de favoritos');
  };

  const playSegment = (timecode) => {
    setCurrentTimeCode(timecode);
    setIsPlaying(true);
    showToast(`Saltando a ${timecode}`);
  };

  const copySnippet = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    }
    showToast('Copiado al portapapeles');
  };

  const speakSnippet = (phrase) => {
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(phrase);
      utter.rate = 1.0;
      window.speechSynthesis.speak(utter);
    }
    showToast('Reproduciendo audio TTS');
  };

  const triggerDownload = (type) => {
    showToast(`Generando archivo ${type}...`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Valores a mostrar (por defecto o los reales de la base de datos)
  const recordingName = recording?.name || 'Unit 4: Corporate Negotiations';
  const subjectName = subject?.name || 'Inglés Profesional II';
  const displayDate = recording?.date ? new Date(recording.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '18 Oct 2024';
  const displayDuration = recording?.audioDuration ? Math.round(recording.audioDuration) + 's' : '34:15';

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface flex flex-col min-h-screen overflow-x-hidden">
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.15)]">
        <div className="h-16 px-gutter flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <button 
              aria-label="Volver" 
              className="w-11 h-11 rounded-full flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors -ml-1" 
              onClick={() => navigate(-1)}
            >
              <span className="material-symbols-outlined text-[26px]">arrow_back_ios_new</span>
            </button>
            <img 
              alt="Menaa's Translate Logo" 
              className="h-8 w-auto object-contain" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUm0QHSG4LJLncKxpuv0il3pw2dKgS5NKEN7yluC06HD7-i1_PLNdGWpgk0eqBnmlWTewXm8liQl_sNrQF2XKu7leh8NynF1BqhbmkuFL-pvAJDJkeL1jzcuqd576Y9oQcByW3Qwj9j5iYY2QQdEjT7U84RfR2QasB8UG9lU4G2uvB9AjeJXG_sYjsHZyxp9_JC5CCkWmHP0IgdOhpq_5ga0uVgZwPdC-RaqPKK3pNr81DEC5uYP0w"
            />
            <h1 className="font-headline-sm text-headline-sm text-on-surface tracking-tight truncate max-w-[170px]">
              Detalle De Grabación
            </h1>
          </div>
          <div className="flex items-center gap-space-sm">
            <button aria-label="Más opciones" className="w-11 h-11 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[22px]">more_vert</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex flex-col relative w-full pt-16 pb-safe bg-surface min-h-screen">
        <div className="flex flex-col w-full pb-10">
          
          {/* Dynamic Ambient Glow Backing */}
          <div className="fixed top-20 -left-16 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
          <div className="fixed top-96 -right-16 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
          
          {/* Session Meta Card */}
          <section className="px-margin-mobile pt-space-md">
            <div className="bg-surface-container/85 backdrop-blur-xl rounded-lg p-margin shadow-md flex flex-col gap-space-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="bg-surface-container-highest/80 text-secondary font-caption text-caption px-space-sm py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                  {subjectName}
                </span>
                <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">event</span>
                  {displayDate}
                </span>
              </div>
              <div className="flex items-start justify-between gap-space-sm">
                <div className="flex flex-col">
                  <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">{recordingName}</h2>
                  <div className="flex items-center gap-space-sm mt-1">
                    <span className="font-label-mono-sm text-label-mono-sm text-primary flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      {displayDuration}
                    </span>
                    <span className="text-outline-variant text-[12px]">•</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[15px]">translate</span>
                      {recording?.sourceLang || 'EN'} → {recording?.targetLang || 'ES'}
                    </span>
                  </div>
                </div>
                <button 
                  aria-label="Favorito" 
                  className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors"
                  onClick={toggleFav}
                >
                  <span 
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {isFavorited ? 'bookmark' : 'bookmark_border'}
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* Interactive Studio Audio Deck */}
          <section className="px-margin-mobile pt-space-md">
            <div className="bg-surface-container/90 backdrop-blur-2xl rounded-lg p-margin shadow-lg flex flex-col gap-space-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className={`w-2 h-2 rounded-full bg-secondary-fixed ${isPlaying ? 'animate-ping' : ''}`}></span>
                  <span className="font-label-mono-sm text-label-mono-sm text-secondary-fixed tracking-wide uppercase font-semibold">
                    {isPlaying ? 'Live Playback' : 'Paused'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-label-mono-lg text-label-mono-lg text-primary font-bold">{currentTimeCode}</span>
                  <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">/ {displayDuration}</span>
                </div>
              </div>

              {/* Tactile Waveform Scrubber (Static mock) */}
              <div className="relative w-full h-24 bg-surface-container-lowest/80 rounded flex items-center px-space-sm cursor-pointer select-none overflow-hidden">
                <div className="absolute top-1.5 left-2 right-2 flex justify-between pointer-events-none">
                  <span className="font-label-mono-sm text-[10px] text-outline-variant">00:00</span>
                  <span className="font-label-mono-sm text-[10px] text-outline-variant">08:00</span>
                  <span className="font-label-mono-sm text-[10px] text-outline-variant">16:00</span>
                  <span className="font-label-mono-sm text-[10px] text-outline-variant">24:00</span>
                  <span className="font-label-mono-sm text-[10px] text-outline-variant">34:15</span>
                </div>
                <div className="w-full flex items-center justify-between gap-[2px] h-14 pt-2">
                  <div className="w-[3px] h-3 bg-secondary rounded-full"></div>
                  <div className="w-[3px] h-5 bg-secondary rounded-full"></div>
                  <div className="w-[3px] h-8 bg-secondary rounded-full"></div>
                  <div className="w-[3px] h-4 bg-secondary rounded-full"></div>
                  <div className="w-[3px] h-9 bg-primary rounded-full"></div>
                  <div className="w-[3px] h-12 bg-primary rounded-full"></div>
                  <div className="w-[3px] h-7 bg-primary rounded-full"></div>
                  <div className="w-[3px] h-11 bg-primary rounded-full"></div>
                  <div className="w-[3px] h-6 bg-secondary rounded-full"></div>
                  <div className="w-[3px] h-10 bg-secondary rounded-full"></div>
                  <div className="w-[3px] h-14 bg-primary rounded-full"></div>
                  
                  {/* Cursor */}
                  <div className="relative flex flex-col items-center">
                    <div className="w-1.5 h-16 bg-on-surface rounded-full shadow-[0_0_12px_rgba(218,226,253,0.8)] z-10 animate-pulse"></div>
                    <span className="absolute -bottom-4 bg-primary text-on-primary font-label-mono-sm text-[9px] px-1 rounded">08:24</span>
                  </div>

                  <div className="w-[3px] h-10 bg-outline-variant/40 rounded-full"></div>
                  <div className="w-[3px] h-6 bg-outline-variant/40 rounded-full"></div>
                  <div className="w-[3px] h-13 bg-outline-variant/40 rounded-full"></div>
                  <div className="w-[3px] h-7 bg-outline-variant/40 rounded-full"></div>
                  <div className="w-[3px] h-11 bg-outline-variant/40 rounded-full"></div>
                  <div className="w-[3px] h-4 bg-outline-variant/40 rounded-full"></div>
                  <div className="w-[3px] h-8 bg-outline-variant/40 rounded-full"></div>
                  <div className="w-[3px] h-12 bg-outline-variant/40 rounded-full"></div>
                  <div className="w-[3px] h-5 bg-outline-variant/40 rounded-full"></div>
                </div>
              </div>

              {/* Progress */}
              <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-secondary to-primary h-full rounded-full" style={{ width: '24.5%' }}></div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between pt-space-xs">
                <button 
                  className="h-9 px-space-sm bg-surface-container-high rounded-full flex items-center justify-center font-label-mono-sm text-label-mono-sm text-on-surface hover:bg-surface-bright transition-colors active:scale-95" 
                  onClick={cycleSpeed} 
                  title="Velocidad de reproducción"
                >
                  <span className="text-primary font-bold">{speeds[playbackSpeedIdx]}</span>
                </button>
                <div className="flex items-center gap-space-md">
                  <button 
                    aria-label="Retroceder 15 segundos" 
                    className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:text-primary transition-all active:scale-90" 
                    onClick={() => skipTime(-15)}
                  >
                    <span className="material-symbols-outlined text-[22px]">replay_10</span>
                  </button>
                  <button 
                    aria-label="Reproducir o Pausar" 
                    className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shadow-lg hover:scale-105 active:scale-95 transition-all" 
                    onClick={togglePlayState}
                  >
                    <span className="material-symbols-outlined text-[34px]" style={{ fontVariationSettings: isPlaying ? "'FILL' 0" : "'FILL' 1" }}>
                      {isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </button>
                  <button 
                    aria-label="Adelantar 15 segundos" 
                    className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:text-primary transition-all active:scale-90" 
                    onClick={() => skipTime(15)}
                  >
                    <span className="material-symbols-outlined text-[22px]">forward_10</span>
                  </button>
                </div>
                <button 
                  aria-label="Silenciar o reactivar" 
                  className="h-9 w-9 bg-surface-container-high rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors active:scale-95" 
                  onClick={toggleMute}
                >
                  <span className="material-symbols-outlined text-[19px]">
                    {isMuted ? 'volume_off' : 'volume_up'}
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* Segmented View Tabs */}
          <section className="px-margin-mobile pt-space-md">
            <div className="bg-surface-container-lowest/90 p-1 rounded-full flex items-center overflow-x-auto gap-1 shadow-inner">
              {[
                { id: 'dual', label: 'Vista Dual' },
                { id: 'transcript', label: 'Solo Transcripción' },
                { id: 'translation', label: 'Solo Traducción' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  className={`flex-1 py-1.5 px-space-sm rounded-full font-caption text-caption text-center whitespace-nowrap transition-all ${
                    activeTab === tab.id 
                      ? 'bg-primary text-on-primary font-semibold' 
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </section>

          {/* Real Transcription & Translation */}
          <section className="px-margin-mobile pt-space-md flex flex-col gap-space-md pb-space-2xl">
            {(activeTab === 'dual' || activeTab === 'transcript') && recording?.transcription && (
              <div className="bg-surface-container-low rounded-lg p-margin flex flex-col gap-space-sm shadow-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-label-mono-sm text-[10px] bg-surface-variant px-1 rounded text-on-surface-variant font-semibold">{recording.sourceLang?.toUpperCase()}</span>
                  <span className="font-caption text-[11px] text-outline">Transcripción Original</span>
                </div>
                <p className="font-body-lg text-body-lg text-on-surface leading-relaxed whitespace-pre-wrap">
                  {recording.transcription}
                </p>
              </div>
            )}
            
            {(activeTab === 'dual' || activeTab === 'translation') && recording?.translation && (
              <div className="bg-surface-container-low rounded-lg p-margin flex flex-col gap-space-sm shadow-sm">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-label-mono-sm text-[10px] bg-secondary-container px-1 rounded text-on-secondary-container font-semibold">{recording.targetLang?.toUpperCase()}</span>
                  <span className="font-caption text-[11px] text-secondary">Traducción Neural</span>
                </div>
                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                  {recording.translation}
                </p>
              </div>
            )}
            
            {!recording?.transcription && !recording?.translation && (
              <p className="text-center text-outline-variant font-body-sm py-4">No hay transcripción disponible para esta grabación.</p>
            )}
          </section>

          {/* Actions & Export */}
          <section className="px-margin-mobile pt-space-lg">
            <div className="bg-surface-container-highest/95 backdrop-blur-2xl rounded-lg p-margin shadow-xl flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption uppercase text-on-surface-variant tracking-wider font-semibold">Acciones y Exportación</span>
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
              </div>
              <div className="grid grid-cols-1 gap-space-xs">
                <button 
                  className="w-full h-12 bg-primary text-on-primary rounded-full flex items-center justify-center gap-space-sm hover:brightness-110 active:scale-[0.98] transition-all font-body-md text-body-md font-semibold shadow-md" 
                  onClick={() => showToast('Iniciando síntesis de voz continua')}
                >
                  <span className="material-symbols-outlined text-[20px]">record_voice_over</span>
                  Reproducir con TTS (Voz IA)
                </button>
                <button 
                  className="w-full h-11 bg-surface-container-high text-on-surface hover:bg-surface-bright rounded-full flex items-center justify-center gap-space-sm active:scale-[0.98] transition-all font-body-sm text-body-sm" 
                  onClick={() => copySnippet('Texto bilingüe completo')}
                >
                  <span className="material-symbols-outlined text-[19px] text-secondary">copy_all</span>
                  Copiar texto bilingüe
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button 
                  className="h-10 bg-surface-container rounded flex items-center justify-center gap-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors" 
                  onClick={() => triggerDownload('m4a')}
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">audio_file</span>
                  <span className="font-label-mono-sm text-label-mono-sm">Audio (.m4a)</span>
                </button>
                <button 
                  className="h-10 bg-surface-container rounded flex items-center justify-center gap-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors" 
                  onClick={() => triggerDownload('txt-pdf')}
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary">description</span>
                  <span className="font-label-mono-sm text-label-mono-sm">Notas (.txt / .pdf)</span>
                </button>
              </div>
            </div>
          </section>

          {/* Toast Notification */}
          <div 
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-margin py-space-xs rounded-full font-body-sm text-body-sm shadow-2xl flex items-center gap-2 transition-all duration-300 z-50 ${
              toast.show ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] text-inverse-primary">check_circle</span>
            <span>{toast.message}</span>
          </div>

        </div>
      </main>
    </div>
  );
}

export default RecordingDetailPage;
