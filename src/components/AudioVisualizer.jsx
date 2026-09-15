import React from 'react';

export default function AudioVisualizer({ audioLevel = 0, isActive = false }) {
  const bars = Array.from({ length: 30 });
  
  return (
    <div className="flex items-center justify-center space-x-[2px] h-[60px] w-full">
      {bars.map((_, i) => {
        const baseOffset = Math.sin((i / 30) * Math.PI) * 0.5 + 0.5;
        const randomFactor = isActive ? (Math.random() * 0.4 + 0.6) : 0;
        const normalizedLevel = isActive ? Math.max(0.1, audioLevel * baseOffset * randomFactor) : 0.1;
        const heightPercent = normalizedLevel * 100;
        
        const isHigh = heightPercent > 60;

        return (
          <div 
            key={i} 
            className={`w-[3px] rounded-full transition-all duration-75 ${
              isActive && isHigh ? 'bg-purple-500' : 'bg-blue-500'
            }`}
            style={{ 
              height: `${Math.max(10, Math.min(100, heightPercent))}%`,
              opacity: isActive ? 1 : 0.3
            }}
          />
        );
      })}
    </div>
  );
}
