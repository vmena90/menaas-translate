import React from 'react';

export default function SubjectCard({ subject, recordingCount, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left relative bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 shadow-sm active:scale-95 transition-transform duration-150 overflow-hidden"
    >
      <div 
        className="absolute top-0 left-0 w-2 h-full" 
        style={{ backgroundColor: subject.color || '#3b82f6' }}
      />
      <div className="pl-4 flex items-center justify-between">
        <div>
          <div className="text-3xl mb-2">{subject.icon || '📚'}</div>
          <h3 className="font-bold text-[17px] text-gray-900 dark:text-white line-clamp-1">{subject.name}</h3>
        </div>
        <div className="flex flex-col items-end">
          <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-semibold px-2 py-1 rounded-full">
            {recordingCount || 0} grabaciones
          </span>
        </div>
      </div>
    </button>
  );
}
