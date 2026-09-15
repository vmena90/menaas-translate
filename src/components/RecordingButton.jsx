import React from 'react';

export default function RecordingButton({ state = 'idle', onStart, onPause, onResume, onStop }) {
  const isRecording = state === 'recording';
  const isPaused = state === 'paused';
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center h-32 w-32">
        {isRecording && (
          <>
            <div className="absolute w-24 h-24 bg-red-500/20 rounded-full animate-ping" />
            <div className="absolute w-28 h-28 bg-red-500/10 rounded-full animate-pulse" />
          </>
        )}
        
        <button
          onClick={state === 'idle' ? onStart : (isRecording ? onPause : onResume)}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
            isPaused ? 'bg-blue-500' : 'bg-red-500'
          } ${isRecording ? 'scale-110 shadow-red-500/50' : ''}`}
        >
          {state === 'idle' && (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
          )}
          {isRecording && (
            <div className="w-6 h-6 bg-white rounded-sm animate-pulse" />
          )}
          {isPaused && (
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          )}
        </button>
      </div>

      {(isRecording || isPaused) && (
        <div className="flex items-center space-x-6 mt-2 opacity-100 transition-opacity duration-300">
          {isRecording && (
            <button onClick={onPause} className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm active:scale-95">
               <svg className="w-5 h-5 text-gray-800 dark:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>
          )}
          {isPaused && (
            <button onClick={onResume} className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm active:scale-95">
               <svg className="w-6 h-6 text-gray-800 dark:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </button>
          )}
          <button onClick={onStop} className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm active:scale-95">
            <div className="w-4 h-4 bg-gray-800 dark:bg-white rounded-sm" />
          </button>
        </div>
      )}
    </div>
  );
}
