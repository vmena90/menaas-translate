import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const COLORS = [
  '#007AFF', // blue
  '#34C759', // green
  '#FF3B30', // red
  '#FF9500', // orange
  '#AF52DE', // purple
  '#FF2D55', // pink
  '#5AC8FA', // teal
  '#5856D6'  // indigo
];

const ICONS = ['📚', '🔬', '🧮', '💻', '🎨', '🌍', '📐', '🎵', '💼', '🏥'];

export default function SubjectModal({ isOpen, onClose, onSave, editSubject }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0]);

  useEffect(() => {
    if (isOpen) {
      if (editSubject) {
        setName(editSubject.name || '');
        setColor(editSubject.color || COLORS[0]);
        setIcon(editSubject.icon || ICONS[0]);
      } else {
        setName('');
        setColor(COLORS[0]);
        setIcon(ICONS[0]);
      }
    }
  }, [isOpen, editSubject]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), color, icon });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-surface-container w-full sm:w-[400px] sm:rounded-2xl rounded-t-[2rem] pb-[env(safe-area-inset-bottom)] transform animate-slide-up transition-transform border border-surface-container-highest shadow-2xl"
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-outline-variant rounded-full" />
        </div>
        
        <div className="px-6 py-4">
          <h2 className="font-headline-md text-headline-md text-center mb-6 text-on-surface">
            {editSubject ? 'Editar Asignatura' : 'Nueva Asignatura'}
          </h2>
          
          <div className="mb-6">
            <input
              type="text"
              placeholder="Nombre de la asignatura"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-low text-on-surface placeholder:text-outline font-body-lg text-body-lg p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary border border-surface-container-highest"
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label className="block font-caption text-caption text-secondary uppercase tracking-wider mb-3">Color</label>
            <div className="flex justify-between">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-offset-surface-container ring-on-surface scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="block font-caption text-caption text-secondary uppercase tracking-wider mb-3">Icono</label>
            <div className="flex flex-wrap gap-2 justify-between">
              {ICONS.map(i => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`text-2xl w-10 h-10 rounded-full flex items-center justify-center transition-colors ${icon === i ? 'bg-surface-container-highest shadow-inner' : 'bg-transparent hover:bg-surface-container-high'}`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 mt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 bg-surface-container-high text-on-surface rounded-full font-body-md font-semibold active:scale-95 transition-transform"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="flex-1 py-3.5 bg-primary text-on-primary rounded-full font-body-md font-semibold disabled:opacity-50 active:scale-95 transition-transform shadow-lg shadow-primary/20"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
