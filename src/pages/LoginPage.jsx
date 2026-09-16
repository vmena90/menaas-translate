import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const users = {
      'menayera': '2452004',
      'jgonzalez': '0672002'
    };

    if (users[username] && users[username] === password) {
      localStorage.setItem('currentUser', username);
      navigate('/', { replace: true });
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface flex flex-col min-h-[100dvh] relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="flex-1 flex flex-col items-center justify-center px-margin-mobile z-10 relative">
        <div className="flex flex-col items-center gap-space-sm mb-space-xl animate-fade-in-up">
          <div className="w-20 h-20 bg-surface-container-high rounded-3xl shadow-xl flex items-center justify-center p-3">
            <img 
              alt="Vocalis Logo" 
              className="w-full h-full object-contain" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUm0QHSG4LJLncKxpuv0il3pw2dKgS5NKEN7yluC06HD7-i1_PLNdGWpgk0eqBnmlWTewXm8liQl_sNrQF2XKu7leh8NynF1BqhbmkuFL-pvAJDJkeL1jzcuqd576Y9oQcByW3Qwj9j5iYY2QQdEjT7U84RfR2QasB8UG9lU4G2uvB9AjeJXG_sYjsHZyxp9_JC5CCkWmHP0IgdOhpq_5ga0uVgZwPdC-RaqPKK3pNr81DEC5uYP0w" 
            />
          </div>
          <div className="flex flex-col items-center">
            <span className="font-caption text-caption text-secondary uppercase tracking-widest font-semibold">Menaa's Translate</span>
            <h1 className="font-display-sm text-display-sm text-on-surface tracking-tight mt-1">Iniciar Sesión</h1>
          </div>
        </div>

        <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-space-md">
          {error && (
            <div className="bg-error-container text-on-error-container p-3 rounded-lg font-body-sm text-center shadow-inner animate-shake">
              {error}
            </div>
          )}

          <div className="bg-surface-container rounded-2xl p-space-md flex flex-col gap-space-sm shadow-lg backdrop-blur-md border border-surface-container-highest">
            
            <div className="flex flex-col gap-1">
              <label className="font-label-mono-sm text-label-mono-sm text-on-surface-variant ml-1">USUARIO</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant">person</span>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  className="w-full bg-surface-container-lowest text-on-surface rounded-xl pl-10 pr-4 py-3 font-body-md outline-none focus:ring-2 focus:ring-primary shadow-inner transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-2">
              <label className="font-label-mono-sm text-label-mono-sm text-on-surface-variant ml-1">CONTRASEÑA</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant">lock</span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-container-lowest text-on-surface rounded-xl pl-10 pr-4 py-3 font-body-md outline-none focus:ring-2 focus:ring-primary shadow-inner transition-all"
                  required
                />
              </div>
            </div>

          </div>

          <button 
            type="submit"
            className="mt-2 w-full bg-primary text-on-primary py-4 rounded-full font-headline-sm text-headline-sm shadow-[0_8px_20px_rgba(76,215,246,0.3)] hover:bg-primary-fixed active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>Ingresar al Sistema</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </form>

        <p className="mt-8 font-caption text-caption text-on-surface-variant flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">lock</span>
          Acceso Restringido - Alpha Build
        </p>
      </div>
    </div>
  );
}
