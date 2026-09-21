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
import TrendPlot from './TrendPlot';
import { Droplet, Wind, Gauge, Cloud, Compass } from 'lucide-react';

export default function WeatherMetrics() {
  const { currentWeather, pastTrends } = useSelector((state) => state.weather);
  const unitSystem = useSelector((state) => state.preferences.unitSystem);

  if (!currentWeather) return null;

  const dewpointStr = formatDewpoint(currentWeather.dew_point_2m, unitSystem);
  const windSpeedStr = formatWindSpeed(currentWeather.wind_speed_10m, unitSystem);
  const windDirStr = formatWindDirection(currentWeather.wind_direction_10m);
  const pressureStr = formatPressure(currentWeather.surface_pressure, unitSystem);
  const cloudCoverStr = formatCloudCover(currentWeather.cloud_cover);
  const cloudPercent = Math.min(100, Math.max(0, currentWeather.cloud_cover ?? 0));

  const times = pastTrends?.time || [];

  // 1. Dewpoint 48h trend
  const dewUnit = unitSystem === 'imperial' ? '°F' : '°C';
  const dewValues = pastTrends?.dew_point_2m?.map((c) =>
    unitSystem === 'imperial' ? (c * 9) / 5 + 32 : c
  ) || [];

  // 2. Wind Speed 48h trend
  const windSpeedUnit = unitSystem === 'imperial' ? 'mph' : 'km/h';
  const windSpeedValues = pastTrends?.wind_speed_10m?.map((k) =>
    unitSystem === 'imperial' ? k * 0.621371 : k
  ) || [];

  // 3. Wind Direction 48h trend
  const windDirValues = pastTrends?.wind_direction_10m || [];

  // 4. Surface Pressure 48h trend
  const pressureUnit = unitSystem === 'imperial' ? 'inHg' : 'hPa';
  const pressureValues = pastTrends?.surface_pressure?.map((p) =>
    unitSystem === 'imperial' ? p * 0.02953 : p
  ) || [];

  // 5. Cloud Cover 48h trend
  const cloudValues = pastTrends?.cloud_cover || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
      {/* 1. Dewpoint Card */}
      <div className="flex flex-col justify-between p-5 rounded-2xl bg-slate-800/70 border border-slate-700/60 backdrop-blur-md hover:border-slate-600 transition-colors shadow-lg">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Dewpoint
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Droplet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {dewpointStr}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Condensation threshold
            </p>
          </div>
        </div>

        {/* 48h Dewpoint Trend */}
        {times.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-700/60">
            <TrendPlot
              times={times}
              values={dewValues}
              unit={dewUnit}
              color="#14b8a6"
              label="Dewpoint Trend"
              height={75}
            />
          </div>
        )}
      </div>

      {/* 2. Wind Speed Card */}
      <div className="flex flex-col justify-between p-5 rounded-2xl bg-slate-800/70 border border-slate-700/60 backdrop-blur-md hover:border-slate-600 transition-colors shadow-lg">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Wind Speed
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Wind className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {windSpeedStr}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Measured at 10m height
            </p>
          </div>
        </div>

        {/* 48h Wind Speed Trend */}
        {times.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-700/60">
            <TrendPlot
              times={times}
              values={windSpeedValues}
              unit={windSpeedUnit}
              color="#0284c7"
              label="Wind Speed Trend"
              height={75}
            />
          </div>
        )}
      </div>

      {/* 3. Wind Direction Card with Compass */}
      <div className="flex flex-col justify-between p-5 rounded-2xl bg-slate-800/70 border border-slate-700/60 backdrop-blur-md hover:border-slate-600 transition-colors shadow-lg">
        <div>
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
              <p className="text-xs text-slate-400 mt-0.5">
                Current wind heading
              </p>
            </div>
            <WindCompass degrees={currentWeather.wind_direction_10m} size={54} />
          </div>
        </div>

        {/* 48h Wind Direction Trend */}
        {times.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-700/60">
            <TrendPlot
              times={times}
              values={windDirValues}
              unit="°"
              isDirection={true}
              color="#8b5cf6"
              label="Direction Trend"
              height={75}
            />
          </div>
        )}
      </div>

      {/* 4. Surface Pressure Card */}
      <div className="flex flex-col justify-between p-5 rounded-2xl bg-slate-800/70 border border-slate-700/60 backdrop-blur-md hover:border-slate-600 transition-colors shadow-lg">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Surface Pressure
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Gauge className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {pressureStr}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Barometric air pressure
            </p>
          </div>
        </div>

        {/* 48h Surface Pressure Trend */}
        {times.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-700/60">
            <TrendPlot
              times={times}
              values={pressureValues}
              unit={pressureUnit}
              color="#a855f7"
              label="Pressure Trend (Barograph)"
              height={75}
            />
          </div>
        )}
      </div>

      {/* 5. Cloud Cover Card */}
      <div className="flex flex-col justify-between p-5 rounded-2xl bg-slate-800/70 border border-slate-700/60 backdrop-blur-md hover:border-slate-600 transition-colors shadow-lg md:col-span-2 lg:col-span-2">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cloud Cover
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Cloud className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
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
            <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-600/40">
              <div
                className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${cloudPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 48h Cloud Cover Trend */}
        {times.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-700/60">
            <TrendPlot
              times={times}
              values={cloudValues}
              unit="%"
              color="#38bdf8"
              label="Cloud Cover Trend"
              height={75}
            />
          </div>
        )}
      </div>
    </div>
  );
}
