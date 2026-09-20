import React from 'react';
import { getCompassDirection } from '../utils/unitConversion';

export default function WindCompass({ degrees, size = 64 }) {
  const cardinal = getCompassDirection(degrees);
  const normalizedDegrees = degrees !== null && degrees !== undefined ? Math.round(((degrees % 360) + 360) % 360) : 0;

  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        className="relative flex items-center justify-center rounded-full bg-slate-900/80 border border-slate-700 shadow-inner"
        style={{ width: size, height: size }}
      >
        {/* Compass Cardinal Points */}
        <span className="absolute top-1 text-[9px] font-bold text-red-400">N</span>
        <span className="absolute right-1 text-[9px] font-bold text-slate-400">E</span>
        <span className="absolute bottom-1 text-[9px] font-bold text-slate-400">S</span>
        <span className="absolute left-1 text-[9px] font-bold text-slate-400">W</span>

        {/* Center pivot point */}
        <div className="absolute w-2 h-2 rounded-full bg-blue-400 z-10 shadow" />

        {/* Rotating Wind Needle */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out"
          style={{ transform: `rotate(${normalizedDegrees}deg)` }}
          aria-label={`Wind direction ${normalizedDegrees} degrees`}
        >
          {/* Arrow pointing to where wind is blowing */}
          <div className="relative w-1 h-full flex flex-col items-center justify-between">
            {/* Pointer head */}
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[14px] border-b-cyan-400 filter drop-shadow(0 0 3px rgba(34,211,238,0.8))" />
            {/* Pointer tail */}
            <div className="w-1 h-3 bg-slate-500 rounded-b" />
          </div>
        </div>
      </div>
      <div className="mt-1 text-xs font-semibold text-slate-300">
        {cardinal} · {normalizedDegrees}°
      </div>
    </div>
  );
}
