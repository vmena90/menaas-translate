import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Layout({ children, title, showBack, rightAction }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-black text-black dark:text-white pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      {/* Navigation Bar */}
      <div className="flex-none h-14 flex items-center justify-between px-4 sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-gray-800">
        <div className="w-16 flex items-center">
          {showBack && (
            <button onClick={() => navigate(-1)} className="text-blue-500 hover:text-blue-600 active:opacity-70 flex items-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
              <span className="text-base">Atrás</span>
            </button>
          )}
        </div>
        <div className="flex-1 text-center font-semibold text-[17px] truncate px-2">{title}</div>
        <div className="w-16 flex items-center justify-end">
          {rightAction}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full pb-16 relative">
        {children}
      </main>

      {/* Tab Bar */}
      <div className="fixed bottom-0 w-full h-16 bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 flex justify-around items-center pb-[env(safe-area-inset-bottom)] z-50">
        <button 
          onClick={() => navigate('/')} 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/' ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3l9 8h-3v10h-5v-6h-2v6H6V11H3l9-8z"/></svg>
          <span className="text-[10px] font-medium">Asignaturas</span>
        </button>
        <button 
          onClick={() => navigate('/settings')} 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/settings' ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <span className="text-[10px] font-medium">Ajustes</span>
        </button>
      </div>
    </div>
  );
}
