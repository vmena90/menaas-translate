import React, { useState } from 'react';

export default function TranscriptView({ transcription, translation }) {
  const [view, setView] = useState('Original'); // 'Original' | 'Traducción'

  const handleCopy = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      alert('Texto copiado al portapapeles');
    } catch (err) {
      console.error('Error al copiar: ', err);
    }
  };

  const currentText = view === 'Original' ? transcription : translation;
  const hasText = currentText && currentText.trim().length > 0;

  return (
    <div className="flex flex-col gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      {/* Control Segmentado iOS */}
      <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
        {['Original', 'Traducción'].map((tab) => (
          <button
            key={tab}
            onClick={() => setView(tab)}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
              view === tab
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Área de contenido */}
      <div className="relative min-h-[100px] text-base leading-relaxed text-gray-700 dark:text-gray-300">
        {hasText ? (
          <p className="whitespace-pre-wrap pb-8">{currentText}</p>
        ) : (
          <div className="flex items-center justify-center h-full pt-6 text-gray-400 dark:text-gray-500 italic">
            No hay {view.toLowerCase()} disponible.
          </div>
        )}
        
        {hasText && (
          <button
            onClick={() => handleCopy(currentText)}
            className="absolute bottom-0 right-0 p-2 text-gray-400 hover:text-blue-500 transition-colors bg-white dark:bg-gray-800 rounded-tl-lg shadow-sm"
            aria-label="Copiar texto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
