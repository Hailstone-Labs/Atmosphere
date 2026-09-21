import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  getLatestGFSRunMetadata,
  getCapeDescription,
  getCinDescription,
  formatQpe,
} from '../utils/gfsHelper';
import {
  formatTemperature,
  formatDewpoint,
  formatWindSpeed,
  formatPressure,
  formatCloudCover,
  formatWindDirection,
} from '../utils/unitConversion';
import { getWeatherCondition } from '../utils/weatherCodes';
import {
  Cpu,
  Layers,
  Zap,
  ShieldAlert,
  CloudRain,
  TrendingUp,
  Info,
} from 'lucide-react';

export default function GFSModelSection() {
  const { gfsData, currentWeather, coordinates } = useSelector((state) => state.weather);
  const unitSystem = useSelector((state) => state.preferences.unitSystem);
  const [activeTab, setActiveTab] = useState('temp_dew'); // 'temp_dew' | 'wind' | 'pressure' | 'clouds' | 'qpe' | 'convective'
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!gfsData || !gfsData.hourly || !gfsData.current) {
    return null;
  }

  const runMeta = getLatestGFSRunMetadata();
  const gfsCurrent = gfsData.current;
  const gfsHourly = gfsData.hourly;

  const capeInfo = getCapeDescription(gfsCurrent.cape);
  const cinInfo = getCinDescription(gfsCurrent.convective_inhibition);

  // Filter GFS forecast starting from current hour up to 48 hours
  const currentIso = gfsCurrent.time;
  const times = gfsHourly.time || [];
  const futureIndices = [];
  for (let i = 0; i < times.length; i++) {
    if (!currentIso || times[i] >= currentIso) {
      futureIndices.push(i);
    }
  }
  const forecastIndices = futureIndices.slice(0, 48); // next 48 hours for detail

  // Helper conversions
  const convTemp = (c) => (unitSystem === 'imperial' ? (c * 9) / 5 + 32 : c);
  const convWind = (k) => (unitSystem === 'imperial' ? k * 0.621371 : k);
  const convPressure = (p) => (unitSystem === 'imperial' ? p * 0.02953 : p);
  const convPrecip = (m) => (unitSystem === 'imperial' ? m * 0.03937 : m);

  const tempUnit = unitSystem === 'imperial' ? '°F' : '°C';
  const windUnit = unitSystem === 'imperial' ? 'mph' : 'km/h';
  const pressUnit = unitSystem === 'imperial' ? 'inHg' : 'hPa';
  const precipUnit = unitSystem === 'imperial' ? 'in' : 'mm';

  // Compare GFS Current vs Observed Current
  const obsTemp = currentWeather?.temperature_2m;
  const gfsTemp = gfsCurrent?.temperature_2m;
  const tempDiff =
    obsTemp !== undefined && gfsTemp !== undefined
      ? convTemp(gfsTemp) - convTemp(obsTemp)
      : null;

  // QPE 48-Hour Accumulation calculation
  let accumulatedQpe = 0;
  forecastIndices.forEach((i) => {
    accumulatedQpe += gfsHourly.precipitation?.[i] || 0;
  });

  // Forecast meteogram chart calculations
  const chartHeight = 115;
  const chartWidth = 560;
  const paddingX = 14;
  const paddingTop = 14;
  const paddingBottom = 22;
  const drawWidth = chartWidth - paddingX * 2;
  const drawHeight = chartHeight - paddingTop - paddingBottom;

  let chartSeries = [];
  let chartUnit = tempUnit;
  let chartLabel = 'Temperature & Dewpoint';

  if (activeTab === 'temp_dew') {
    chartLabel = `GFS Temperature (${tempUnit}) & Dewpoint (${tempUnit})`;
    const tVals = forecastIndices.map((i) => convTemp(gfsHourly.temperature_2m[i]));
    const dVals = forecastIndices.map((i) => convTemp(gfsHourly.dew_point_2m[i]));
    const all = [...tVals, ...dVals];
    const min = Math.min(...all);
    const max = Math.max(...all);
    const rng = max - min || 1;

    chartSeries = [
      {
        name: 'Temperature',
        color: '#f59e0b',
        points: forecastIndices.map((idx, i) => ({
          x: paddingX + (i / (forecastIndices.length - 1)) * drawWidth,
          y: paddingTop + (1 - (convTemp(gfsHourly.temperature_2m[idx]) - min) / rng) * drawHeight,
          val: convTemp(gfsHourly.temperature_2m[idx]),
          time: times[idx],
        })),
      },
      {
        name: 'Dewpoint',
        color: '#14b8a6',
        points: forecastIndices.map((idx, i) => ({
          x: paddingX + (i / (forecastIndices.length - 1)) * drawWidth,
          y: paddingTop + (1 - (convTemp(gfsHourly.dew_point_2m[idx]) - min) / rng) * drawHeight,
          val: convTemp(gfsHourly.dew_point_2m[idx]),
          time: times[idx],
        })),
      },
    ];
    chartUnit = tempUnit;
  } else if (activeTab === 'wind') {
    chartLabel = `GFS Surface Wind Speed (${windUnit})`;
    const vals = forecastIndices.map((i) => convWind(gfsHourly.wind_speed_10m[i]));
    const min = 0;
    const max = Math.max(...vals, 10);
    const rng = max - min || 1;

    chartSeries = [
      {
        name: 'Wind Speed',
        color: '#0284c7',
        points: forecastIndices.map((idx, i) => ({
          x: paddingX + (i / (forecastIndices.length - 1)) * drawWidth,
          y: paddingTop + (1 - (convWind(gfsHourly.wind_speed_10m[idx]) - min) / rng) * drawHeight,
          val: convWind(gfsHourly.wind_speed_10m[idx]),
          dir: gfsHourly.wind_direction_10m[idx],
          time: times[idx],
        })),
      },
    ];
    chartUnit = windUnit;
  } else if (activeTab === 'pressure') {
    chartLabel = `GFS Surface Pressure (${pressUnit})`;
    const vals = forecastIndices.map((i) => convPressure(gfsHourly.surface_pressure[i]));
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const rng = max - min || 1;

    chartSeries = [
      {
        name: 'Pressure',
        color: '#a855f7',
        points: forecastIndices.map((idx, i) => ({
          x: paddingX + (i / (forecastIndices.length - 1)) * drawWidth,
          y: paddingTop + (1 - (convPressure(gfsHourly.surface_pressure[idx]) - min) / rng) * drawHeight,
          val: convPressure(gfsHourly.surface_pressure[idx]),
          time: times[idx],
        })),
      },
    ];
    chartUnit = pressUnit;
  } else if (activeTab === 'clouds') {
    chartLabel = 'GFS Total Cloud Cover (%)';
    const rng = 100;

    chartSeries = [
      {
        name: 'Cloud Cover',
        color: '#38bdf8',
        points: forecastIndices.map((idx, i) => ({
          x: paddingX + (i / (forecastIndices.length - 1)) * drawWidth,
          y: paddingTop + (1 - (gfsHourly.cloud_cover[idx] || 0) / rng) * drawHeight,
          val: gfsHourly.cloud_cover[idx] || 0,
          time: times[idx],
        })),
      },
    ];
    chartUnit = '%';
  } else if (activeTab === 'qpe') {
    chartLabel = `GFS Quantitative Precipitation Estimator (QPE) · Hourly Rate & Cumulative Total (${precipUnit})`;
    let runningTotal = 0;
    const hourlyVals = forecastIndices.map((i) => convPrecip(gfsHourly.precipitation?.[i] || 0));
    const cumulativeVals = hourlyVals.map((v) => {
      runningTotal += v;
      return runningTotal;
    });
    const max = Math.max(runningTotal, ...hourlyVals, unitSystem === 'imperial' ? 0.2 : 5);
    const rng = max || 1;

    chartSeries = [
      {
        name: 'Hourly QPE',
        color: '#38bdf8',
        points: forecastIndices.map((idx, i) => ({
          x: paddingX + (i / (forecastIndices.length - 1)) * drawWidth,
          y: paddingTop + (1 - hourlyVals[i] / rng) * drawHeight,
          val: hourlyVals[i],
          time: times[idx],
        })),
      },
      {
        name: 'Cumulative QPE',
        color: '#06b6d4',
        points: forecastIndices.map((idx, i) => ({
          x: paddingX + (i / (forecastIndices.length - 1)) * drawWidth,
          y: paddingTop + (1 - cumulativeVals[i] / rng) * drawHeight,
          val: cumulativeVals[i],
          time: times[idx],
        })),
      },
    ];
    chartUnit = precipUnit;
  } else if (activeTab === 'convective') {
    chartLabel = 'GFS Convective Indices: CAPE (Positive Energy) & CIN (Capping Inhibition) [J/kg]';
    const capeVals = forecastIndices.map((i) => Math.max(0, gfsHourly.cape?.[i] || 0));
    const cinVals = forecastIndices.map((i) => Math.abs(gfsHourly.convective_inhibition?.[i] || 0));
    const max = Math.max(...capeVals, ...cinVals, 400);
    const rng = max || 1;

    chartSeries = [
      {
        name: 'CAPE (Instability)',
        color: '#f43f5e',
        points: forecastIndices.map((idx, i) => ({
          x: paddingX + (i / (forecastIndices.length - 1)) * drawWidth,
          y: paddingTop + (1 - capeVals[i] / rng) * drawHeight,
          val: capeVals[i],
          time: times[idx],
        })),
      },
      {
        name: 'CIN (Inhibition)',
        color: '#a855f7',
        points: forecastIndices.map((idx, i) => ({
          x: paddingX + (i / (forecastIndices.length - 1)) * drawWidth,
          y: paddingTop + (1 - cinVals[i] / rng) * drawHeight,
          val: cinVals[i],
          time: times[idx],
        })),
      },
    ];
    chartUnit = 'J/kg';
  }

  // Build SVG path helper
  const buildSvgPath = (pts) => {
    if (!pts || pts.length === 0) return '';
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const formatHourLabel = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return d.toLocaleTimeString([], { hour: 'numeric' });
  };

  const formatFullDate = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    return `${d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} · ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  };

  return (
    <section className="mt-12 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-6 md:p-8 shadow-2xl">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mt-1 shadow-inner">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                NOAA GFS Model Output
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                Operational Run: {runMeta.cycle}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-2">
              <span>{runMeta.modelName}</span>
              <span>•</span>
              <span>Grid: {runMeta.resolution}</span>
              <span>•</span>
              <span className="text-slate-300">Run Cycle: {runMeta.cycleTime}</span>
            </p>
          </div>
        </div>

        {/* Coords & Elevation */}
        <div className="flex items-center gap-2 self-start lg:self-center text-xs text-slate-400 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/60 font-mono">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>
            Model Point: {coordinates?.latitude.toFixed(2)}°N, {coordinates?.longitude.toFixed(2)}°E
          </span>
          {gfsData.elevation !== undefined && (
            <span>(Elev: {Math.round(gfsData.elevation)}m)</span>
          )}
        </div>
      </div>

      {/* GFS Model Surface Diagnostics Grid (Expanded with CIN and QPE) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3.5 my-6">
        {/* 1. GFS Temperature */}
        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
            GFS 2m Temp
          </span>
          <div className="mt-1">
            <span className="text-xl font-bold text-white block">
              {formatTemperature(gfsCurrent.temperature_2m, unitSystem)}
            </span>
            {tempDiff !== null && (
              <span
                className={`text-[10px] font-mono mt-0.5 block ${
                  Math.abs(tempDiff) < 1
                    ? 'text-emerald-400'
                    : tempDiff > 0
                    ? 'text-amber-400'
                    : 'text-sky-400'
                }`}
              >
                {tempDiff > 0 ? `+${tempDiff.toFixed(1)}` : tempDiff.toFixed(1)} {tempUnit} vs obs
              </span>
            )}
          </div>
        </div>

        {/* 2. GFS Dewpoint */}
        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
            GFS Dewpoint
          </span>
          <div className="mt-1">
            <span className="text-xl font-bold text-white block">
              {formatDewpoint(gfsCurrent.dew_point_2m, unitSystem)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Model moisture</span>
          </div>
        </div>

        {/* 3. GFS Wind */}
        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
            GFS Wind 10m
          </span>
          <div className="mt-1">
            <span className="text-xl font-bold text-white block">
              {formatWindSpeed(gfsCurrent.wind_speed_10m, unitSystem)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              {formatWindDirection(gfsCurrent.wind_direction_10m)}
            </span>
          </div>
        </div>

        {/* 4. GFS Pressure */}
        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
            GFS Pressure
          </span>
          <div className="mt-1">
            <span className="text-xl font-bold text-white block">
              {formatPressure(gfsCurrent.surface_pressure, unitSystem)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">MSLP ground model</span>
          </div>
        </div>

        {/* 5. GFS Cloud Cover */}
        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
            GFS Cloud Cover
          </span>
          <div className="mt-1">
            <span className="text-xl font-bold text-white block">
              {formatCloudCover(gfsCurrent.cloud_cover)}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Total column cloud</span>
          </div>
        </div>

        {/* 6. GFS CAPE (Convective Available Potential Energy) */}
        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>CAPE Index</span>
          </span>
          <div className="mt-1">
            <span className="text-xl font-bold text-white block">
              {Math.round(gfsCurrent.cape || 0)} <span className="text-xs font-normal text-slate-400">J/kg</span>
            </span>
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border inline-block mt-0.5 ${capeInfo.color}`}>
              {capeInfo.label}
            </span>
          </div>
        </div>

        {/* 7. GFS CIN (Convective Inhibition Index) */}
        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-purple-400" />
            <span>CIN (Inhibition)</span>
          </span>
          <div className="mt-1">
            <span className="text-xl font-bold text-white block">
              {Math.round(gfsCurrent.convective_inhibition || 0)}{' '}
              <span className="text-xs font-normal text-slate-400">J/kg</span>
            </span>
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border inline-block mt-0.5 ${cinInfo.color}`}>
              {cinInfo.label}
            </span>
          </div>
        </div>

        {/* 8. GFS QPE (Quantitative Precipitation Estimator) */}
        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider flex items-center gap-1">
            <CloudRain className="w-3 h-3 text-cyan-400" />
            <span>QPE Precip</span>
          </span>
          <div className="mt-1">
            <span className="text-xl font-bold text-white block">
              {formatQpe(gfsCurrent.precipitation || 0, unitSystem)}
            </span>
            <span className="text-[10px] text-cyan-400/90 font-mono mt-0.5 block">
              48h Acc: {formatQpe(accumulatedQpe, unitSystem)}
            </span>
          </div>
        </div>
      </div>

      {/* Meteogram / 48-Hour Forecast Trend from Last Run */}
      <div className="mt-8 rounded-2xl bg-slate-950/70 border border-slate-800 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>GFS Model Run Projection (Next 48 Hours)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{chartLabel}</p>
          </div>

          {/* Variable Tabs (Including QPE & CAPE/CIN) */}
          <div className="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('temp_dew')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'temp_dew'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Temp & Dew
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('wind')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'wind'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Wind
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pressure')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'pressure'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pressure
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('clouds')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'clouds'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Clouds
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('qpe')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'qpe'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              QPE Precip
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('convective')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'convective'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CAPE & CIN
            </button>
          </div>
        </div>

        {/* SVG Meteogram Graph */}
        <div
          className="relative w-full overflow-hidden rounded-xl bg-slate-900/80 border border-slate-800 p-2 cursor-crosshair"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = e.clientX - rect.left;
            const pct = Math.max(0, Math.min(1, relX / rect.width));
            setHoverIndex(Math.round(pct * (forecastIndices.length - 1)));
          }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full block"
            style={{ height: chartHeight }}
            preserveAspectRatio="none"
          >
            {/* Gridlines */}
            <line x1={paddingX} y1={paddingTop} x2={chartWidth - paddingX} y2={paddingTop} stroke="#334155" strokeWidth="0.75" strokeDasharray="3,3" opacity="0.35" />
            <line x1={paddingX} y1={paddingTop + drawHeight / 2} x2={chartWidth - paddingX} y2={paddingTop + drawHeight / 2} stroke="#334155" strokeWidth="0.75" strokeDasharray="3,3" opacity="0.35" />
            <line x1={paddingX} y1={chartHeight - paddingBottom} x2={chartWidth - paddingX} y2={chartHeight - paddingBottom} stroke="#334155" strokeWidth="0.75" strokeDasharray="3,3" opacity="0.35" />

            {/* Curves */}
            {chartSeries.map((series) => (
              <path
                key={series.name}
                d={buildSvgPath(series.points)}
                fill="none"
                stroke={series.color}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Hover Indicator */}
            {hoverIndex !== null && chartSeries[0]?.points[hoverIndex] && (
              <g>
                <line
                  x1={chartSeries[0].points[hoverIndex].x}
                  y1={paddingTop}
                  x2={chartSeries[0].points[hoverIndex].x}
                  y2={chartHeight - paddingBottom}
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  strokeDasharray="2,2"
                  opacity="0.7"
                />
                {chartSeries.map((s) => (
                  <circle
                    key={s.name}
                    cx={s.points[hoverIndex].x}
                    cy={s.points[hoverIndex].y}
                    r="4.5"
                    fill={s.color}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                ))}
              </g>
            )}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoverIndex !== null && chartSeries[0]?.points[hoverIndex] && (
            <div
              className="absolute top-2 pointer-events-none transform -translate-x-1/2 bg-slate-950/95 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono shadow-xl backdrop-blur z-20"
              style={{
                left: `${Math.min(85, Math.max(15, (chartSeries[0].points[hoverIndex].x / chartWidth) * 100))}%`,
              }}
            >
              <div className="text-[10px] text-slate-400 font-sans">
                {formatFullDate(chartSeries[0].points[hoverIndex].time)}
              </div>
              <div className="flex items-center gap-3 mt-1 font-semibold">
                {chartSeries.map((s) => (
                  <span key={s.name} style={{ color: s.color }}>
                    {s.name}: {Math.round(s.points[hoverIndex].val * 100) / 100} {chartUnit}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Time X-axis indicators */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-2 px-2">
          <span>Now (Run init)</span>
          <span>+12h</span>
          <span>+24h (Tomorrow)</span>
          <span>+36h</span>
          <span>+48h</span>
        </div>
      </div>

      {/* GFS Hourly Forecast Card Strip (Next 24 hours) */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>GFS Hourly Forecast Strip (Next 24 Hours)</span>
          </h4>
          <span className="text-[11px] text-slate-500 font-mono">Scroll for timeline →</span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-700">
          {forecastIndices.slice(0, 24).map((idx) => {
            const timeStr = times[idx];
            const tempVal = convTemp(gfsHourly.temperature_2m[idx]);
            const windVal = convWind(gfsHourly.wind_speed_10m[idx]);
            const precipVal = convPrecip(gfsHourly.precipitation?.[idx] || 0);
            const wCode = gfsHourly.weather_code?.[idx] || 0;
            const capeVal = Math.round(gfsHourly.cape?.[idx] || 0);
            const cinVal = Math.round(gfsHourly.convective_inhibition?.[idx] || 0);
            const { condition, image } = getWeatherCondition(wCode, 1);

            return (
              <div
                key={timeStr}
                className="flex-shrink-0 w-28 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center flex flex-col items-center justify-between hover:bg-slate-800/90 transition-colors shadow-sm"
              >
                <span className="text-[11px] font-mono text-slate-300 font-medium">
                  {formatHourLabel(timeStr)}
                </span>

                <div className="w-9 h-9 my-1.5">
                  <img src={image} alt={condition} className="w-full h-full object-contain" />
                </div>

                <span className="text-sm font-bold text-white font-mono">
                  {Math.round(tempVal)}°
                </span>

                <div className="mt-1 text-[10px] text-slate-400 font-mono space-y-0.5">
                  <div>{Math.round(windVal)} {windUnit}</div>
                  {precipVal > 0 ? (
                    <div className="text-cyan-400 font-semibold">{precipVal.toFixed(2)} {precipUnit}</div>
                  ) : (
                    <div className="text-slate-500">0.00 {precipUnit}</div>
                  )}
                  {capeVal > 100 && (
                    <div className="text-[9px] text-amber-400">
                      ⚡{capeVal} {cinVal < -25 ? `(CIN ${cinVal})` : ''}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
