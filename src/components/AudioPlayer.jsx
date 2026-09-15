import React, { useState, useRef, useEffect } from 'react';

const formatTime = (time) => {
  if (isNaN(time)) return "00:00";
  const m = Math.floor(time / 60).toString().padStart(2, '0');
  const s = Math.floor(time % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const SPEEDS = [1, 1.5, 2, 0.5];

export default function AudioPlayer({ audioBlob, mimeType }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [audioBlob]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = SPEEDS[speedIndex];
    }
  }, [speedIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Playback failed", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const changeSpeed = () => {
    setSpeedIndex((prev) => (prev + 1) % SPEEDS.length);
  };

  return (
    <div className="bg-white/60 dark:bg-black/60 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center space-x-3">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          type={mimeType}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
      )}
      
      <button 
        onClick={togglePlay}
        className="w-10 h-10 flex-shrink-0 bg-blue-500 text-white rounded-full flex items-center justify-center active:scale-95"
      >
        {isPlaying ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        ) : (
          <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>

      <div className="flex-1 flex flex-col justify-center">
        <input 
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-medium">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <button 
        onClick={changeSpeed}
        className="text-xs font-semibold bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-lg min-w-[36px] text-center"
      >
        {SPEEDS[speedIndex]}x
      </button>
    </div>
  );
}
