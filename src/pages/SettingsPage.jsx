import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import { clearAllData } from '../db/database';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [groqApiKey, setGroqApiKey] = useState(() => localStorage.getItem('groqApiKey') || '');
  const [sourceLang, setSourceLang] = useState(() => localStorage.getItem('sourceLang') || 'pt');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');
  const [customTranslateUrl, setCustomTranslateUrl] = useState(() => localStorage.getItem('customTranslateUrl') || '');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Apply theme on change
  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = document.documentElement;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Save settings on change
  useEffect(() => {
    localStorage.setItem('sourceLang', sourceLang);
  }, [sourceLang]);

  useEffect(() => {
    localStorage.setItem('customTranslateUrl', customTranslateUrl);
  }, [customTranslateUrl]);

  const handleClearData = async () => {
    try {
      await clearAllData();
      setIsConfirmOpen(false);
      alert('Todos los datos han sido borrados con éxito.');
    } catch (error) {
      console.error('Error al borrar datos:', error);
      alert('Error al borrar los datos.');
    }
  };

  const handleExport = () => {
    alert('Función de exportación próximamente.');
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface font-body-md text-body-md text-on-surface">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.15)]">
        <div className="h-16 px-margin-mobile flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="flex flex-col">
              <span className="font-caption text-caption text-secondary uppercase tracking-widest">Menaa's Translate</span>
              <h1 className="font-headline-sm text-headline-sm text-on-surface tracking-tight truncate max-w-[160px]">Ajustes</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full pt-20 pb-24 bg-surface px-margin-mobile gap-space-lg">
        
        {/* Idiomas Section */}
        <section className="flex flex-col gap-space-sm">
          <h2 className="font-headline-sm text-headline-sm text-on-surface px-space-xs">
            Idiomas
          </h2>
          <div className="bg-surface-container rounded-lg overflow-hidden divide-y divide-surface-container-high shadow-md">
            <div className="flex items-center justify-between p-space-md">
              <span className="font-body-lg text-body-lg text-on-surface">Idioma de origen</span>
              <select 
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="bg-transparent text-primary font-body-lg text-body-lg focus:outline-none text-right appearance-none cursor-pointer"
              >
                <option value="pt" className="text-on-surface bg-surface-container">Portugués</option>
                <option value="en" className="text-on-surface bg-surface-container">Inglés</option>
                <option value="es" className="text-on-surface bg-surface-container">Español</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-space-md opacity-50">
              <span className="font-body-lg text-body-lg text-on-surface">Idioma de destino</span>
              <span className="text-primary font-body-lg text-body-lg">Español</span>
            </div>
          </div>
        </section>

        {/* Appearance Settings */}
        <section className="bg-surface-container rounded-xl shadow-sm overflow-hidden mb-4">
          <div className="flex items-center gap-space-sm px-space-md py-space-sm bg-surface-container-high/50 border-b border-surface-container-highest">
            <span className="material-symbols-outlined text-secondary text-[20px]">palette</span>
            <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Apariencia</h2>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between p-space-md">
              <div className="flex flex-col">
                <span className="font-body-lg text-body-lg text-on-surface">Modo Oscuro</span>
                <span className="font-caption text-caption text-on-surface-variant">Ajusta el tema visual</span>
              </div>
              <div className="w-12 h-6 bg-primary rounded-full relative shadow-inner cursor-pointer" onClick={() => alert('Próximamente disponible')}>
                <div className="absolute right-1 top-1 w-4 h-4 bg-on-primary rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>
        </section>

        {/* API Settings */}
        <section className="bg-surface-container rounded-xl shadow-sm overflow-hidden mb-4">
          <div className="flex items-center gap-space-sm px-space-md py-space-sm bg-surface-container-high/50 border-b border-surface-container-highest">
            <span className="material-symbols-outlined text-primary text-[20px]">key</span>
            <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Claves de API (IA)</h2>
          </div>
          <div className="flex flex-col p-space-md gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-body-md text-body-md font-semibold text-on-surface">Groq API Key</label>
              <span className="font-caption text-caption text-on-surface-variant">Necesaria para usar la transcripción ultrarrápida Whisper V3.</span>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant text-[20px]">password</span>
              <input 
                type="password" 
                placeholder="gsk_..."
                value={groqApiKey}
                onChange={(e) => {
                  setGroqApiKey(e.target.value);
                  localStorage.setItem('groqApiKey', e.target.value);
                }}
                className="w-full bg-surface-container-lowest text-on-surface border border-outline-variant focus:border-primary rounded-lg pl-10 pr-3 py-2.5 font-body-md text-body-md shadow-inner transition-colors"
              />
            </div>
            <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-primary font-body-sm text-body-sm hover:underline flex items-center gap-1">
              Obtener una clave gratuita de Groq
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </a>
          </div>
        </section>

        {/* Datos Section */}
        <section className="flex flex-col gap-space-sm">
          <h2 className="font-headline-sm text-headline-sm text-on-surface px-space-xs">
            Datos
          </h2>
          <div className="bg-surface-container rounded-lg overflow-hidden divide-y divide-surface-container-high shadow-md">
            <button 
              onClick={handleExport}
              className="w-full text-left p-space-md font-body-lg text-body-lg text-primary active:bg-surface-container-high transition-colors"
            >
              Exportar datos
            </button>
            <button 
              onClick={() => setIsConfirmOpen(true)}
              className="w-full text-left p-space-md font-body-lg text-body-lg text-error active:bg-surface-container-high transition-colors"
            >
              Borrar todos los datos
            </button>
            <div className="border-t border-surface-container-highest"></div>
            <button 
              onClick={() => {
                localStorage.removeItem('currentUser');
                navigate('/login', { replace: true });
              }}
              className="w-full text-left p-space-md font-body-lg text-body-lg text-secondary active:bg-surface-container-high transition-colors flex items-center justify-between"
            >
              <span>Cerrar Sesión ({localStorage.getItem('currentUser')})</span>
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </section>



      </main>

      {/* Tab Bar Borrowed from screen1.html */}
      <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface/80 backdrop-blur-xl shadow-[0_-1px_12px_rgba(0,0,0,0.25)]">
        <div className="flex justify-around items-center h-16 px-gutter-mobile">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-2 transition-all text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined text-[24px]">folder</span>
            <span className="font-caption text-caption">Asignaturas</span>
          </a>

          <a href="#" onClick={(e) => e.preventDefault()} className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-2 text-primary transition-all font-semibold">
            <span className="material-symbols-outlined text-[24px]">settings</span>
            <span className="font-caption text-caption">Ajustes</span>
          </a>
        </div>
      </nav>

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="¿Borrar todos los datos?"
        message="Esta acción no se puede deshacer. Se eliminarán todas las asignaturas y grabaciones guardadas."
        confirmText="Borrar"
        cancelText="Cancelar"
        onConfirm={handleClearData}
        onCancel={() => setIsConfirmOpen(false)}
        isDestructive={true}
      />
    </div>
  );
}

