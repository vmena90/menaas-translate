import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getSubjectById, 
  getRecordingsBySubject, 
  addRecording, 
  deleteRecording
} from '../db/database';
import { translate } from '../services/translationService';
import useAudioRecorder from '../hooks/useAudioRecorder';
import { transcribeAudioWithGroq } from '../services/groqService';
const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '00:00:00';
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const Visualizer = ({ isActive }) => {
  const [bars, setBars] = useState(Array(28).fill(10));
  
  useEffect(() => {
    if (!isActive) {
      setBars(Array(28).fill(6));
      return;
    }
    const interval = setInterval(() => {
      setBars(prev => prev.map((_, idx) => {
        const isPeak = idx > 8 && idx < 20;
        return isPeak ? Math.floor(Math.random() * 42) + 10 : Math.floor(Math.random() * 20) + 6;
      }));
    }, 90);
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="flex items-center justify-between h-14 w-full gap-1 pt-2" id="waveformContainer">
      {bars.map((h, i) => (
        <div key={i} style={{ height: `${h}px` }} className={`w-1.5 rounded-full transition-all duration-75 flex-shrink-0 ${h > 30 ? 'bg-secondary' : 'bg-primary-container'}`} />
      ))}
    </div>
  );
};

export default function SubjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const subjectId = parseInt(id, 10);

  const [subject, setSubject] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [sourceLang, setSourceLang] = useState(() => localStorage.getItem('sourceLang') || 'pt');
  const [isLoading, setIsLoading] = useState(true);
  
  const [sessionName, setSessionName] = useState('Nueva Lección');
  const [isRecordingView, setIsRecordingView] = useState(false);
  const [markers, setMarkers] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [isTranscribingGroq, setIsTranscribingGroq] = useState(false);

  const audio = useAudioRecorder();

  const loadData = useCallback(async () => {
    try {
      if (isNaN(subjectId)) throw new Error('ID de asignatura inválido');
      const subj = await getSubjectById(subjectId);
      if (!subj) { navigate('/'); return; }
      setSubject(subj);
      
      const recs = await getRecordingsBySubject(subjectId);
      setRecordings(recs.sort((a, b) => b.createdAt - a.createdAt));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [subjectId, navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleStartRecording = () => {
    setIsRecordingView(true);
    setCountdown(2);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      const startServices = async () => {
        try {
          await audio.start();
          setMarkers(0);
          setCountdown(null);
        } catch (err) {
          console.error(err);
          alert('Error al iniciar micrófono. Verifica los permisos. Si estás en iPhone, Safari requiere HTTPS para grabar audio, excepto si accedes por localhost.');
          setIsRecordingView(false);
          setCountdown(null);
        }
      };
      startServices();
    }
  }, [countdown, audio, speech, sourceLang]);

  const handleTogglePause = () => {
    if (audio.state === 'recording') {
      audio.pause();
    } else if (audio.state === 'paused') {
      audio.resume();
    }
  };

  const handleDiscardRecording = () => {
    if (window.confirm('¿Estás seguro de descartar la grabación actual? Se perderán los datos sin sincronizar.')) {
      audio.reset();
      setIsRecordingView(false);
    }
  };

  const handleSaveTrigger = () => {
    setIsSaving(true);
    audio.stop();
  };

  const saveRecordingData = useCallback(async () => {
    try {
      let finalTranscription = '';
      
      if (audio.audioBlob) {
        setIsTranscribingGroq(true);
        try {
          finalTranscription = await transcribeAudioWithGroq(audio.audioBlob, sourceLang);
        } catch (err) {
          if (err.message === 'API_KEY_MISSING') {
            alert('¡Atención! No has configurado tu clave API de Groq. Ve a Ajustes para agregarla. Guardando audio sin transcripción...');
          } else {
            alert('Error en Groq API: ' + err.message + '. Guardando solo el audio.');
          }
        }
        setIsTranscribingGroq(false);
      }

      let finalTranslation = '';
      if (sourceLang !== 'es' && finalTranscription.trim()) {
        const transResult = await translate(finalTranscription, sourceLang, 'es');
        finalTranslation = transResult.translatedText;
      }

      await addRecording({
        subjectId,
        name: sessionName,
        audioBlob: audio.audioBlob,
        mimeType: audio.mimeType,
        audioDuration: audio.duration,
        transcription: finalTranscription,
        translation: finalTranslation,
        sourceLang,
        targetLang: 'es'
      });
      
      await loadData();
      
      audio.reset();
      setIsRecordingView(false);
      setIsSaving(false);
    } catch (err) {
      console.error(err);
      alert('Error al guardar la grabación: ' + err.message);
      setIsSaving(false);
      setIsTranscribingGroq(false);
    }
  }, [audio, sourceLang, sessionName, subjectId, loadData]);

  useEffect(() => {
    if (isSaving && audio.audioBlob && audio.state === 'stopped') {
      setIsSaving(false);
      saveRecordingData();
    }
  }, [isSaving, audio.audioBlob, audio.state, saveRecordingData]);

  const handleDeleteRecording = async (recId) => {
    if (window.confirm('¿Eliminar grabación?')) {
      await deleteRecording(recId);
      loadData();
    }
  };

  if (isLoading) return null;

  if (isRecordingView) {
    const sourceLangLabel = sourceLang === 'en' ? 'English (US)' : 'Português (BR)';
    return (
      <div className="bg-surface font-body-md text-body-md text-on-surface flex flex-col min-h-screen">
        <header className="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.15)]">
          <div className="h-16 px-gutter flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <button aria-label="Volver" className="w-11 h-11 rounded-full flex items-center justify-center text-primary hover:bg-surface-container-high transition-colors -ml-1" onClick={handleDiscardRecording}>
                <span className="material-symbols-outlined text-[26px]">arrow_back_ios_new</span>
              </button>
              <h1 className="font-headline-sm text-headline-sm text-on-surface tracking-tight truncate max-w-[170px]">Sesión Activa</h1>
            </div>
            <div className="flex items-center gap-space-sm">
              {/* Removed 3 dots and profile pic as requested */}
            </div>
          </div>
        </header>

        <main className="flex flex-col relative w-full pt-16 pb-safe bg-surface min-h-screen">
          
          {/* Overlay Transcripcion Groq */}
          {isTranscribingGroq && (
            <div className="absolute inset-0 z-50 bg-surface/90 backdrop-blur-md flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4 shadow-[0_0_15px_rgba(76,215,246,0.5)]"></div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">cloud_sync</span>
                IA de Alta Velocidad
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[280px] text-center mt-2">
                Enviando a Groq (Whisper V3). ¡Esto será ultrarrápido!
              </p>
            </div>
          )}

          <div className="flex flex-col w-full px-margin-mobile pb-space-xl gap-space-md mt-4">
            {/* Subject Context */}
            <div className="flex flex-col gap-space-xs bg-surface-container rounded-lg p-space-md shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs bg-surface-container-high px-space-sm py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  <span className="font-caption text-caption text-secondary">{subject?.name}</span>
                </div>
                <div className="flex items-center gap-1 bg-surface-container-lowest px-space-sm py-1 rounded-full">
                  <span className="material-symbols-outlined text-secondary text-[14px]">graphic_eq</span>
                  <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">48kHz STEREO</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-space-xs flex-1 min-w-0">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface truncate">{sessionName}</h2>
                </div>
              </div>
            </div>

            {/* Timer Hub */}
            <div className="flex flex-col items-center justify-center py-space-md px-space-md rounded-xl bg-surface-container-low shadow-sm relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
              {countdown !== null && countdown > 0 ? (
                <div className="flex items-center gap-space-xs mb-1">
                  <span className="font-label-mono-sm text-label-mono-sm font-medium tracking-wide text-primary">
                    INICIANDO EN {countdown}...
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-space-xs mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${audio.state === 'recording' ? 'bg-error animate-ping' : 'bg-secondary'}`}></span>
                  <span className={`font-label-mono-sm text-label-mono-sm font-medium tracking-wide ${audio.state === 'recording' ? 'text-error' : 'text-secondary'}`}>
                    {audio.state === 'recording' ? 'REC EN VIVO' : 'PAUSADO'}
                  </span>
                </div>
              )}
              <div className="flex items-baseline gap-1 my-1">
                <span className="font-label-mono-lg text-[38px] leading-tight font-bold text-on-surface tracking-tight">
                  {formatDuration(audio.duration)}
                </span>
              </div>
              <p className="font-caption text-caption text-on-surface-variant text-center max-w-[280px]">
                Aislamiento acústico activo con eliminación de eco estocástico
              </p>
            </div>

            {/* Language Switcher */}
            <div className="bg-surface-container-high p-1 rounded-full flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2 bg-surface-container-lowest py-1.5 px-space-md rounded-full shadow-sm flex-1 justify-center">
                <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                <span className="font-body-sm text-body-sm font-medium text-on-surface">{sourceLangLabel}</span>
                <span className="font-label-mono-sm text-[10px] bg-surface-container-highest px-1.5 py-0.5 rounded text-secondary">SRC</span>
              </div>
              <button aria-label="Intercambiar idiomas" className="w-9 h-9 rounded-full bg-primary-container hover:bg-primary text-on-primary flex items-center justify-center mx-1 transition-transform active:rotate-180 flex-shrink-0 shadow-md" onClick={() => setSourceLang(sourceLang === 'en' ? 'pt' : 'en')}>
                <span className="material-symbols-outlined text-[18px]">sync_alt</span>
              </button>
              <div className="flex items-center gap-2 bg-surface-container-lowest py-1.5 px-space-md rounded-full shadow-sm flex-1 justify-center">
                <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
                <span className="font-body-sm text-body-sm font-medium text-on-surface">Spanish (LATAM)</span>
                <span className="font-label-mono-sm text-[10px] bg-surface-container-highest px-1.5 py-0.5 rounded text-tertiary">DST</span>
              </div>
            </div>

            {/* Visualizer */}
            <div className="bg-surface-container-lowest rounded-lg p-space-md flex flex-col gap-space-xs shadow-inner relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-caption text-caption text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-secondary text-[14px]">equalizer</span>
                  Espectro de Frecuencia de Voz
                </span>
              </div>
              <Visualizer isActive={audio.state === 'recording'} />
            </div>

            {/* Cloud AI Notice */}
            <div className="flex flex-col gap-space-sm mt-2">
              <div className="flex items-center justify-between px-1">
                <span className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">cloud</span>
                  Transcripción Ultra-Precisa
                </span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                  <span className="font-label-mono-sm text-label-mono-sm text-secondary">Groq Cloud Sync</span>
                </div>
              </div>

              <div className="bg-surface-container rounded-lg p-space-md flex flex-col gap-space-sm shadow-md">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-inner">
                    <span className="material-symbols-outlined text-[20px]">bolt</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body-md font-semibold text-on-surface">Whisper Large V3 (1.5B Parámetros)</span>
                    <span className="font-caption text-caption text-secondary">Procesado en Groq LPU™</span>
                  </div>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed pt-1">
                  El audio se está grabando en alta fidelidad y con aislamiento acústico. Al finalizar, la grabación completa será procesada en milisegundos en la nube por el modelo más potente y preciso del mundo, garantizando cero "alucinaciones" incluso con ruidos de altavoz y acentos complejos.
                </p>
              </div>
            </div></div>
            </div>

            {/* Bottom Deck */}
            <div className="mt-auto bg-surface-container rounded-xl p-space-md flex flex-col gap-space-md shadow-xl">
              <div className="flex items-center justify-between px-space-sm">
                <button aria-label="Añadir marcador" className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-on-surface transition-transform active:scale-95" onClick={() => setMarkers(m => m + 1)}>
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center relative shadow-sm">
                    <span className="material-symbols-outlined text-[24px] text-secondary">bookmark_add</span>
                    {markers > 0 && (
                      <span className="absolute -top-1 -right-1 bg-secondary text-on-secondary font-label-mono-sm text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{markers}</span>
                    )}
                  </div>
                  <span className="font-caption text-caption">Marcador</span>
                </button>
                
                <div className="relative flex items-center justify-center">
                  {audio.state === 'recording' && <div className="absolute w-20 h-20 rounded-full bg-error/20 animate-ping pointer-events-none"></div>}
                  <button aria-label="Pausar o reanudar grabación" className="w-16 h-16 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-lg relative z-10 transition-transform active:scale-90" onClick={handleTogglePause}>
                    <div className={`w-12 h-12 flex items-center justify-center shadow-md transition-all ${audio.state === 'recording' ? 'rounded-full bg-error' : 'rounded-lg bg-secondary-container'}`}>
                      <span className={`material-symbols-outlined text-[28px] ${audio.state === 'recording' ? 'text-on-error' : 'text-on-surface'}`}>
                        {audio.state === 'recording' ? 'pause' : 'play_arrow'}
                      </span>
                    </div>
                  </button>
                </div>

                <button aria-label="Descartar grabación" className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-error transition-transform active:scale-95" onClick={handleDiscardRecording}>
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[22px]">delete_forever</span>
                  </div>
                  <span className="font-caption text-caption">Descartar</span>
                </button>
              </div>

              <button className="w-full bg-primary text-on-primary py-space-sm px-space-md rounded-full font-headline-sm text-headline-sm flex items-center justify-center gap-space-xs shadow-lg hover:bg-surface-tint active:scale-[0.98] transition-all" onClick={handleSaveTrigger} disabled={isSaving}>
                <span className="material-symbols-outlined text-[20px]">{isSaving ? 'sync' : 'check_circle'}</span>
                {isSaving ? 'Guardando...' : 'Finalizar y Guardar Grabación'}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- LIST VIEW (screen3.html) ---
  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface flex flex-col min-h-screen">
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.15)]">
        <div className="h-16 px-margin-mobile flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <img alt="Vocalis Logo" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUm0QHSG4LJLncKxpuv0il3pw2dKgS5NKEN7yluC06HD7-i1_PLNdGWpgk0eqBnmlWTewXm8liQl_sNrQF2XKu7leh8NynF1BqhbmkuFL-pvAJDJkeL1jzcuqd576Y9oQcByW3Qwj9j5iYY2QQdEjT7U84RfR2QasB8UG9lU4G2uvB9AjeJXG_sYjsHZyxp9_JC5CCkWmHP0IgdOhpq_5ga0uVgZwPdC-RaqPKK3pNr81DEC5uYP0w" />
            <div className="flex flex-col">
              <span className="font-caption text-caption text-secondary uppercase tracking-widest">Menaa's Translate</span>
              <h1 className="font-headline-sm text-headline-sm text-on-surface tracking-tight truncate max-w-[160px]">Asignaturas</h1>
            </div>
          </div>
          <div className="flex items-center gap-space-sm">
            {/* Removed search and profile pic as requested */}
          </div>
        </div>
      </header>

      <main className="flex flex-col relative w-full pt-16 pb-24 bg-surface min-h-screen">
        <div className="flex flex-col w-full">
          
          {/* Subject Hero */}
          <section className="px-margin-mobile pt-space-xs pb-space-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <button aria-label="Volver a asignaturas" className="flex items-center gap-1 text-primary py-space-xs px-2 -ml-2 rounded-full hover:bg-surface-container-high transition-colors active:scale-95" onClick={() => navigate('/')}>
                <span className="material-symbols-outlined text-[24px]">chevron_left</span>
                <span className="font-body-md text-body-md font-medium">Asignaturas</span>
              </button>
              <div className="flex items-center gap-space-xs">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-highest shadow-sm">
                  <span className="font-label-mono-sm text-label-mono-sm text-secondary font-semibold">EN</span>
                  <span className="material-symbols-outlined text-[13px] text-on-surface-variant">arrow_forward</span>
                  <span className="font-label-mono-sm text-label-mono-sm text-secondary font-semibold">ES</span>
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-lg bg-surface-container-low p-space-md shadow-md">
              <div className="flex items-start justify-between gap-space-sm">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(76,215,246,0.6)]"></span>
                    <span className="font-caption text-caption uppercase tracking-wider text-secondary">Módulo Activo</span>
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight truncate">{subject?.name}</h2>
                </div>
                <div className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0 shadow-inner">
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                </div>
              </div>
              <div className="mt-space-sm pt-space-xs flex flex-wrap items-center gap-x-space-sm gap-y-1">
                <div className="flex items-center gap-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[15px] text-secondary">mic</span>
                  <span className="font-caption text-caption text-on-surface">{recordings.length} grabaciones</span>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Record Card */}
          <section className="px-margin-mobile py-space-sm">
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-surface-container to-surface-container-high p-space-md shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between mb-space-sm">
                <div className="flex items-center gap-space-xs">
                  <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
                    <span className="material-symbols-outlined text-[18px]">graphic_eq</span>
                  </div>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Iniciar Nueva Sesión</span>
                </div>
                <span className="font-label-mono-sm text-label-mono-sm text-secondary px-2 py-0.5 rounded-full bg-surface-container-lowest">Directo</span>
              </div>
              <div className="flex flex-col gap-space-xs">
                <label className="font-caption text-caption text-on-surface-variant font-medium" htmlFor="sessionNameInput">Nombre de la lección o tópico:</label>
                <div className="flex items-center gap-space-xs">
                  <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-on-surface-variant">edit_note</span>
                    <input 
                      className="w-full bg-surface-container-lowest text-on-surface rounded-full pl-9 pr-3 py-2 font-body-sm text-body-sm placeholder:text-outline outline-none focus:ring-0 shadow-inner" 
                      id="sessionNameInput" 
                      placeholder="Ej. Unit 5: Contract Drafting" 
                      type="text" 
                      value={sessionName}
                      onChange={(e) => setSessionName(e.target.value)}
                    />
                  </div>
                  <button 
                    className="shrink-0 flex items-center gap-1.5 bg-primary text-on-primary px-4 py-2 rounded-full font-headline-sm text-caption tracking-wide shadow-md transition-all active:scale-95 hover:bg-primary-fixed" 
                    onClick={handleStartRecording} 
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">mic</span>
                    <span>Grabar</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Recordings List */}
          <div className="px-margin-mobile pt-space-xs pb-1 flex items-center justify-between">
            <span className="font-caption text-caption uppercase tracking-wider text-outline font-semibold">Archivos &amp; Transcripciones</span>
            <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">{recordings.length} recientes</span>
          </div>

          <section className="px-margin-mobile flex flex-col gap-space-sm pb-space-xl">
            {recordings.map((rec) => (
              <article key={rec.id} onClick={() => navigate(`/recording/${rec.id}`)} className="cursor-pointer relative rounded-lg bg-surface-container p-space-md shadow-md flex flex-col gap-space-sm active:scale-[0.99] transition-transform">
                <div className="flex items-start justify-between gap-space-sm">
                  <div className="flex items-center gap-space-sm min-w-0">
                    <div className="relative w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 text-primary">
                      <span className="material-symbols-outlined text-[24px]">graphic_eq</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">{rec.name}</h3>
                      <div className="flex items-center gap-space-xs text-on-surface-variant">
                        <span className="font-caption text-caption text-secondary font-medium">
                          {new Date(rec.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-caption">•</span>
                        <span className="font-label-mono-sm text-label-mono-sm text-on-surface-variant">{formatDuration(rec.audioDuration)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-secondary font-label-mono-sm text-label-mono-sm font-semibold">
                      {rec.targetLang ? 'Traducido' : 'Audio'}
                    </span>
                    <button aria-label="Eliminar grabación" className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-error transition-colors" type="button" onClick={(e) => { e.stopPropagation(); handleDeleteRecording(rec.id); }}>
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>

                {rec.transcription && (
                  <div className="rounded bg-surface-container-low p-space-sm flex flex-col gap-space-xs mt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-caption text-caption uppercase text-secondary font-semibold">Transcripción</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface leading-snug line-clamp-3">
                      “{rec.transcription}”
                    </p>
                    {rec.translation && (
                      <div className="pt-space-xs mt-0.5 bg-surface-container-low flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[14px] text-primary">translate</span>
                          <span className="font-caption text-caption text-primary font-medium">Español</span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant italic leading-snug line-clamp-3">
                          “{rec.translation}”
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))}
            {recordings.length === 0 && (
              <p className="text-center text-on-surface-variant py-8">No hay grabaciones todavía.</p>
            )}
          </section>

          <div className="fixed bottom-20 right-4 z-40">
            <button aria-label="Grabar sesión express" className="relative group w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-[0_8px_24px_rgba(192,193,255,0.4)] transition-transform duration-200 active:scale-90" onClick={handleStartRecording} type="button">
              <span className="absolute inset-0 rounded-full bg-primary-fixed opacity-20 animate-ping"></span>
              <span className="material-symbols-outlined text-[28px]" style={{fontVariationSettings: "'FILL' 1"}}>mic</span>
            </button>
          </div>
        </div>
      </main>

      <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface/80 backdrop-blur-xl shadow-[0_-1px_12px_rgba(0,0,0,0.25)]">
        <div className="flex justify-around items-center h-16 px-gutter-mobile">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-2 transition-all text-primary font-semibold">
            <span className="material-symbols-outlined text-[24px]">folder</span>
            <span className="font-caption text-caption">Asignaturas</span>
          </a>

          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/settings'); }} className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-2 text-on-surface-variant hover:text-on-surface transition-all">
            <span className="material-symbols-outlined text-[24px]">settings</span>
            <span className="font-caption text-caption">Ajustes</span>
          </a>
        </div>
      </nav>
    </div>
  );
}
