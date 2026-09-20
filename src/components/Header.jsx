import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWeatherData, requestUserLocation } from '../store/weatherSlice';
import UnitToggle from './UnitToggle';
import { RefreshCw, Radio, Clock } from 'lucide-react';

export default function Header() {
  const dispatch = useDispatch();
  const { status, coordinates, lastUpdated, secondsUntilNextUpdate } = useSelector(
    (state) => state.weather
  );

  const isLoading = status === 'loading';

  const handleManualRefresh = () => {
    if (coordinates) {
      dispatch(fetchWeatherData(coordinates));
    } else {
      dispatch(requestUserLocation());
    }
  };

  const formatCountdown = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatLastUpdatedTime = (isoString) => {
    if (!isoString) return '--';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
      {/* Brand & Status */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30">
          <Radio className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Atmosphere
            </h1>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Current conditions powered by Open-Meteo
          </p>
        </div>
      </div>

      {/* Controls & Timers */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Unit Toggle */}
        <UnitToggle />

        {/* Auto-update timer & Last Updated Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>Update in <strong className="text-white font-mono">{formatCountdown(secondsUntilNextUpdate)}</strong></span>
          {lastUpdated && (
            <>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Updated: <span className="text-slate-300 font-mono">{formatLastUpdatedTime(lastUpdated)}</span></span>
            </>
          )}
        </div>

        {/* Manual Refresh Button */}
        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={isLoading}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-sm active:scale-95 ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          title="Refresh current weather data now"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Updating...' : 'Refresh'}</span>
        </button>
      </div>
    </header>
  );
}
