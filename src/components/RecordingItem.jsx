import React, { useState } from 'react';
import AudioPlayer from './AudioPlayer';

export default function RecordingItem({ recording, onDelete, onRename }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('transcription');
  const [showMenu, setShowMenu] = useState(false);

  const toggleExpand = () => {
    if (!showMenu) setExpanded(!expanded);
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleRename = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onRename(recording);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(recording);
  };

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl mb-3 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer active:bg-gray-50 dark:active:bg-[#2C2C2E]"
        onClick={toggleExpand}
      >
        <div className="flex items-center space-x-3 flex-1 overflow-hidden">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-[15px] text-gray-900 dark:text-white truncate">{recording.name}</h4>
            <div className="flex items-center text-xs text-gray-500 space-x-2 mt-0.5">
              <span>{new Intl.DateTimeFormat('es-ES', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(recording.date))}</span>
              <span>•</span>
              <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{recording.durationStr || '00:00'}</span>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={toggleMenu}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#2C2C2E] rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-10 py-1">
              <button onClick={handleRename} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Renombrar</button>
              <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
              <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700">Eliminar</button>
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 animate-fade-in border-t border-gray-50 dark:border-gray-800 pt-3">
          <AudioPlayer audioBlob={recording.audioBlob} mimeType={recording.mimeType} />
          
          <div className="mt-4">
            <div className="flex bg-gray-100 dark:bg-[#2C2C2E] p-1 rounded-lg mb-3">
              <button 
                onClick={() => setActiveTab('transcription')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === 'transcription' ? 'bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}
              >
                Transcripción
              </button>
              <button 
                onClick={() => setActiveTab('translation')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === 'translation' ? 'bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}
              >
                Traducción (ES)
              </button>
            </div>
            
            <div className="bg-gray-50 dark:bg-black/20 p-3 rounded-xl max-h-48 overflow-y-auto text-sm text-gray-700 dark:text-gray-300">
              {activeTab === 'transcription' ? (
                recording.transcription || <span className="italic text-gray-400">Sin transcripción disponible.</span>
              ) : (
                recording.translation || <span className="italic text-gray-400">Sin traducción disponible.</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
