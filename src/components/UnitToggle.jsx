import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUnitSystem } from '../store/preferencesSlice';

export default function UnitToggle() {
  const dispatch = useDispatch();
  const unitSystem = useSelector((state) => state.preferences.unitSystem);

  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700/60 shadow-inner">
      <button
        type="button"
        onClick={() => dispatch(setUnitSystem('metric'))}
        className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
          unitSystem === 'metric'
            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
        }`}
        title="Metric units (°C, km/h, hPa)"
      >
        <span>Metric</span>
        <span className="text-xs opacity-75">(°C)</span>
      </button>

      <button
        type="button"
        onClick={() => dispatch(setUnitSystem('imperial'))}
        className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
          unitSystem === 'imperial'
            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
        }`}
        title="Imperial units (°F, mph, inHg)"
      >
        <span>Imperial</span>
        <span className="text-xs opacity-75">(°F)</span>
      </button>
    </div>
  );
}
