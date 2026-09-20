import React from 'react';
import { useSelector } from 'react-redux';
import { formatTemperature } from '../utils/unitConversion';
import { getWeatherCondition } from '../utils/weatherCodes';
import { MapPin } from 'lucide-react';

export default function WeatherCard() {
  const { currentWeather, locationDetails, coordinates } = useSelector((state) => state.weather);
  const unitSystem = useSelector((state) => state.preferences.unitSystem);

  if (!currentWeather) return null;

  const { condition, image, theme, badge } = getWeatherCondition(
    currentWeather.weather_code,
    currentWeather.is_day ?? 1
  );

  const formattedTemp = formatTemperature(currentWeather.temperature_2m, unitSystem);
  
  // Format location string
  const locationTitle = [locationDetails.city, locationDetails.region]
    .filter(Boolean)
    .join(', ') || 'Current Location';

  const countryText = locationDetails.country || '';

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${theme} bg-slate-800/80 backdrop-blur-xl border p-6 md:p-8 shadow-2xl transition-all duration-300`}
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

      {/* Location header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-medium text-sm">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>Device Location</span>
            {coordinates && (
              <span className="text-xs text-slate-400 font-mono bg-slate-900/60 px-2 py-0.5 rounded-full border border-slate-700/50">
                {coordinates.latitude.toFixed(4)}°, {coordinates.longitude.toFixed(4)}°
              </span>
            )}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-1">
            {locationTitle}
            {countryText && <span className="text-slate-400 font-normal text-lg ml-2">({countryText})</span>}
          </h2>
        </div>

        {/* Condition Badge */}
        <div className="self-start sm:self-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/10 text-white border border-white/15 backdrop-blur-sm">
            {badge}
          </span>
        </div>
      </div>

      {/* Main weather visual display */}
      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 py-2">
        {/* Left: Weather Condition Image */}
        <div className="flex flex-col items-center justify-center text-center p-4 bg-slate-900/40 rounded-2xl border border-white/5">
          <div className="relative w-36 h-36 md:w-44 md:h-44 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
            <img
              src={image}
              alt={condition}
              className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
              loading="eager"
            />
          </div>
          <p className="mt-3 text-lg md:text-xl font-semibold text-slate-100 tracking-wide">
            {condition}
          </p>
        </div>

        {/* Right: Big Temperature Display */}
        <div className="flex flex-col items-center md:items-start justify-center p-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Current Temperature
          </span>
          <div className="flex items-baseline">
            <span className="text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter">
              {formattedTemp}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
            <div className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700/60">
              <span className="text-slate-400">Timezone:</span>{' '}
              <span className="font-medium text-white">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700/60">
              <span className="text-slate-400">Daylight:</span>{' '}
              <span className="font-medium text-amber-300">
                {currentWeather.is_day ? 'Daytime' : 'Nighttime'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
