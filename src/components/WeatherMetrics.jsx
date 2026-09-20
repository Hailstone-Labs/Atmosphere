import React from 'react';
import { useSelector } from 'react-redux';
import {
  formatDewpoint,
  formatWindSpeed,
  formatPressure,
  formatCloudCover,
  formatWindDirection,
} from '../utils/unitConversion';
import WindCompass from './WindCompass';
import { Droplet, Wind, Gauge, Cloud, Compass } from 'lucide-react';

export default function WeatherMetrics() {
  const { currentWeather } = useSelector((state) => state.weather);
  const unitSystem = useSelector((state) => state.preferences.unitSystem);

  if (!currentWeather) return null;

  const dewpointStr = formatDewpoint(currentWeather.dew_point_2m, unitSystem);
  const windSpeedStr = formatWindSpeed(currentWeather.wind_speed_10m, unitSystem);
  const windDirStr = formatWindDirection(currentWeather.wind_direction_10m);
  const pressureStr = formatPressure(currentWeather.surface_pressure, unitSystem);
  const cloudCoverStr = formatCloudCover(currentWeather.cloud_cover);
  const cloudPercent = Math.min(100, Math.max(0, currentWeather.cloud_cover ?? 0));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {/* 1. Dewpoint Card */}
      <div className="flex flex-col justify-between p-5 rounded-2xl bg-slate-800/70 border border-slate-700/60 backdrop-blur-md hover:border-slate-600 transition-colors shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Dewpoint
          </span>
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Droplet className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {dewpointStr}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Atmospheric moisture condensation point
          </p>
        </div>
      </div>

      {/* 2. Wind Speed Card */}
      <div className="flex flex-col justify-between p-5 rounded-2xl bg-slate-800/70 border border-slate-700/60 backdrop-blur-md hover:border-slate-600 transition-colors shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Wind Speed
          </span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Wind className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {windSpeedStr}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Measured at 10 meters above ground
          </p>
        </div>
      </div>

      {/* 3. Wind Direction Card with Compass */}
      <div className="flex flex-col justify-between p-5 rounded-2xl bg-slate-800/70 border border-slate-700/60 backdrop-blur-md hover:border-slate-600 transition-colors shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Wind Direction
          </span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Compass className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {windDirStr}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Heading of blowing wind
            </p>
          </div>
          <WindCompass degrees={currentWeather.wind_direction_10m} size={58} />
        </div>
      </div>

      {/* 4. Surface Pressure Card */}
      <div className="flex flex-col justify-between p-5 rounded-2xl bg-slate-800/70 border border-slate-700/60 backdrop-blur-md hover:border-slate-600 transition-colors shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Surface Pressure
          </span>
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Gauge className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {pressureStr}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Barometric air pressure at ground level
          </p>
        </div>
      </div>

      {/* 5. Cloud Cover Card */}
      <div className="flex flex-col justify-between p-5 rounded-2xl bg-slate-800/70 border border-slate-700/60 backdrop-blur-md hover:border-slate-600 transition-colors shadow-lg sm:col-span-2 lg:col-span-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Cloud Cover
          </span>
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Cloud className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {cloudCoverStr}
            </span>
            <span className="text-xs font-medium text-slate-400">
              {cloudPercent < 20
                ? 'Clear sky'
                : cloudPercent < 50
                ? 'Scattered clouds'
                : cloudPercent < 80
                ? 'Broken clouds'
                : 'Completely overcast'}
            </span>
          </div>

          {/* Graphical progress bar for cloud cover */}
          <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden p-0.5 border border-slate-600/40">
            <div
              className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${cloudPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
