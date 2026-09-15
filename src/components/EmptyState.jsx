import React from 'react';

export default function EmptyState({ icon, title, subtitle, actionText, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[300px]">
      <div className="w-20 h-20 bg-gray-100 dark:bg-[#2C2C2E] rounded-full flex items-center justify-center text-4xl mb-4 text-gray-400">
        {icon || '📭'}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      {subtitle && (
        <p className="text-[15px] text-gray-500 dark:text-gray-400 mb-6 max-w-[250px]">
          {subtitle}
        </p>
      )}
      {actionText && onAction && (
        <button 
          onClick={onAction}
          className="bg-blue-500 text-white font-semibold py-2.5 px-6 rounded-full active:opacity-70 transition-opacity"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
