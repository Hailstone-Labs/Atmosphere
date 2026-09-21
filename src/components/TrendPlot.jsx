import React, { useState, useRef, useId } from 'react';
import { getCompassDirection } from '../utils/unitConversion';

export default function TrendPlot({
  times = [],
  values = [],
  unit = '',
  color = '#38bdf8', // primary stroke color
  gradientId,
  label = '48h Trend',
  height = 80,
  isDirection = false, // for wind direction
  formatValue,
}) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const svgRef = useRef(null);
  const autoId = useId();
  const fillGradId = gradientId || `grad-${autoId.replace(/:/g, '')}`;

  // Filter out invalid values
  const validData = times.map((time, idx) => ({
    time,
    value: values[idx],
  })).filter((d) => d.value !== null && d.value !== undefined && !Number.isNaN(d.value));

  if (validData.length < 2) {
    return (
      <div
        className="flex items-center justify-center rounded-xl bg-slate-900/40 text-xs text-slate-500 font-mono"
        style={{ height }}
      >
        Trend data accumulating...
      </div>
    );
  }

  const rawValues = validData.map((d) => d.value);
  const minVal = Math.min(...rawValues);
  const maxVal = Math.max(...rawValues);
  const range = maxVal - minVal || 1;

  // SVG dimensions
  const svgWidth = 320;
  const paddingX = 8;
  const paddingTop = 12;
  const paddingBottom = 16;
  const drawHeight = height - paddingTop - paddingBottom;
  const drawWidth = svgWidth - paddingX * 2;

  // Calculate points
  const points = validData.map((d, i) => {
    const x = paddingX + (i / (validData.length - 1)) * drawWidth;
    // Invert Y because SVG coordinates go down
    const normalized = (d.value - minVal) / range;
    const y = paddingTop + (1 - normalized) * drawHeight;
    return { x, y, value: d.value, time: d.time, index: i };
  });

  // Build smooth bezier curve
  let pathD = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    pathD += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  // Area path for gradient fill
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const baselineY = height - paddingBottom;
  const areaD = `${pathD} L ${lastPoint.x.toFixed(1)} ${baselineY} L ${firstPoint.x.toFixed(1)} ${baselineY} Z`;

  // Mouse / Touch handler for interactive inspection
  const handlePointerMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    if (clientX === undefined) return;

    const relativeX = clientX - rect.left;
    const percent = Math.max(0, Math.min(1, relativeX / rect.width));
    const targetIdx = Math.round(percent * (points.length - 1));
    setHoverIndex(targetIdx);
  };

  const handlePointerLeave = () => {
    setHoverIndex(null);
  };

  const activePoint = hoverIndex !== null ? points[hoverIndex] : null;

  // Format time for tooltip
  const formatTimeLabel = (isoStr) => {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    const day = d.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' });
    const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return `${day} · ${time}`;
  };

  // Format value for display
  const displayVal = (v) => {
    if (formatValue) return formatValue(v);
    if (isDirection) {
      const cardinal = getCompassDirection(v);
      return `${cardinal} (${Math.round(v)}°)`;
    }
    return `${Math.round(v * 10) / 10} ${unit}`;
  };

  return (
    <div className="w-full select-none pt-2">
      {/* Header with 48h badge and min/max or active value */}
      <div className="flex items-center justify-between text-[11px] mb-1.5 px-0.5">
        <span className="text-slate-400 font-medium tracking-wide flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
          <span>{label}</span>
          <span className="text-[10px] text-slate-500 font-normal">(Last 2 days)</span>
        </span>

        {activePoint ? (
          <span className="font-mono font-semibold text-white bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
            {displayVal(activePoint.value)}
          </span>
        ) : (
          <span className="text-slate-400 font-mono text-[10px]">
            {isDirection ? (
              <span>Avg: {Math.round(rawValues.reduce((a, b) => a + b, 0) / rawValues.length)}°</span>
            ) : (
              <span>
                <strong className="text-slate-300">Min:</strong> {displayVal(minVal)} · <strong className="text-slate-300">Max:</strong> {displayVal(maxVal)}
              </span>
            )}
          </span>
        )}
      </div>

      {/* SVG Canvas */}
      <div
        className="relative w-full overflow-hidden rounded-xl bg-slate-900/60 border border-slate-800/80 cursor-crosshair"
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
        onTouchEnd={handlePointerLeave}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${height}`}
          className="w-full overflow-visible block"
          style={{ height }}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={fillGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.32" />
              <stop offset="70%" stopColor={color} stopOpacity="0.06" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={svgWidth - paddingX}
            y2={paddingTop}
            stroke="#334155"
            strokeWidth="0.75"
            strokeDasharray="2,3"
            opacity="0.4"
          />
          <line
            x1={paddingX}
            y1={paddingTop + drawHeight / 2}
            x2={svgWidth - paddingX}
            y2={paddingTop + drawHeight / 2}
            stroke="#334155"
            strokeWidth="0.75"
            strokeDasharray="2,3"
            opacity="0.4"
          />
          <line
            x1={paddingX}
            y1={baselineY}
            x2={svgWidth - paddingX}
            y2={baselineY}
            stroke="#334155"
            strokeWidth="0.75"
            strokeDasharray="2,3"
            opacity="0.4"
          />

          {/* Area Fill */}
          <path d={areaD} fill={`url(#${fillGradId})`} />

          {/* Stroke Line */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover Crosshair & Dot */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={paddingTop}
                x2={activePoint.x}
                y2={baselineY}
                stroke="#f8fafc"
                strokeWidth="1.2"
                strokeDasharray="2,2"
                opacity="0.7"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="4.5"
                fill={color}
                stroke="#ffffff"
                strokeWidth="2"
                className="filter drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]"
              />
            </g>
          )}
        </svg>

        {/* Hover Time Tooltip pill floating at bottom/top */}
        {activePoint && (
          <div
            className="absolute top-1 pointer-events-none transform -translate-x-1/2 bg-slate-950/95 text-slate-200 border border-slate-700/80 px-2 py-0.5 rounded text-[10px] font-mono shadow-md backdrop-blur whitespace-nowrap z-20"
            style={{
              left: `${Math.min(85, Math.max(15, (activePoint.x / svgWidth) * 100))}%`,
            }}
          >
            {formatTimeLabel(activePoint.time)}
          </div>
        )}
      </div>

      {/* Timeline X-Axis Ticks */}
      <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono mt-1 px-1">
        <span>-48h (2d ago)</span>
        <span>-24h (Yesterday)</span>
        <span className="text-slate-400 font-semibold">Now</span>
      </div>
    </div>
  );
}
