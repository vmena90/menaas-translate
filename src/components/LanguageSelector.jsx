import React from 'react';

const LANGUAGES = [
  { code: 'pt', name: 'Portugués', flag: '🇧🇷' },
  { code: 'en', name: 'Inglés', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];

export default function LanguageSelector({ value, onChange, label, excludeLang }) {
  const options = LANGUAGES.filter(l => l.code !== excludeLang);
  const selectedIndex = options.findIndex(l => l.code === value);

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-500 mb-2">{label}</label>}
      <div className="relative flex bg-gray-200 dark:bg-[#2C2C2E] rounded-[9px] p-0.5 h-8 w-full">
        <div 
          className="absolute top-0.5 bottom-0.5 bg-white dark:bg-[#48484A] rounded-[7px] shadow-sm transition-transform duration-200 ease-in-out"
          style={{ 
            width: `calc(${100 / options.length}% - 4px)`, 
            transform: `translateX(calc(${selectedIndex * 100}% + ${selectedIndex * 2}px))` 
          }}
        />
        {options.map((lang, index) => (
          <button
            key={lang.code}
            onClick={() => onChange(lang.code)}
            className={`relative z-10 flex-1 flex items-center justify-center text-[13px] font-medium transition-colors duration-200 ${
              value === lang.code ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <span className="mr-1.5">{lang.flag}</span>
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
}
