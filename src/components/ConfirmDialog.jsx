import React from 'react';
import { createPortal } from 'react-dom';

export default function ConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar', 
  onConfirm, 
  onCancel, 
  isDestructive = false 
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in px-4">
      <div className="bg-white/90 dark:bg-[#252525]/90 backdrop-blur-xl w-full max-w-[300px] rounded-[14px] overflow-hidden animate-scale-in text-center flex flex-col shadow-xl">
        <div className="px-4 pt-5 pb-4">
          <h3 className="font-semibold text-[17px] leading-tight text-black dark:text-white mb-1">{title}</h3>
          <p className="text-[13px] leading-snug text-gray-600 dark:text-gray-300">{message}</p>
        </div>
        
        <div className="flex border-t border-gray-300/50 dark:border-gray-700/50 h-11">
          <button 
            onClick={onCancel}
            className="flex-1 font-normal text-[17px] text-blue-500 active:bg-gray-200/50 dark:active:bg-gray-700/50 transition-colors border-r border-gray-300/50 dark:border-gray-700/50"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 font-semibold text-[17px] active:bg-gray-200/50 dark:active:bg-gray-700/50 transition-colors ${isDestructive ? 'text-red-500' : 'text-blue-500'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
