/**
 * Helpers for NOAA GFS (Global Forecast System) model data and metadata.
 */

export const getLatestGFSRunMetadata = () => {
  const now = new Date();
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const totalUtcMinutes = utcHours * 60 + utcMinutes;

  // GFS model cycles run at 00Z, 06Z, 12Z, and 18Z.
  // Each cycle takes roughly 3.5 to 4 hours to process and publish.
  let cycleHour;
  const cycleDate = new Date(now.getTime());

  if (totalUtcMinutes >= 21 * 60 + 30) {
    cycleHour = 18;
  } else if (totalUtcMinutes >= 15 * 60 + 30) {
    cycleHour = 12;
  } else if (totalUtcMinutes >= 9 * 60 + 30) {
    cycleHour = 6;
  } else if (totalUtcMinutes >= 3 * 60 + 30) {
    cycleHour = 0;
  } else {
    // Falls back to prior day 18Z
    cycleHour = 18;
    cycleDate.setUTCDate(cycleDate.getUTCDate() - 1);
  }

  const year = cycleDate.getUTCFullYear();
  const month = String(cycleDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(cycleDate.getUTCDate()).padStart(2, '0');
  const cycleStr = `${String(cycleHour).padStart(2, '0')}Z`;

  return {
    cycle: cycleStr,
    cycleDateFormatted: `${year}-${month}-${day}`,
    cycleTime: `${year}-${month}-${day} ${cycleStr}`,
    runTimestamp: `${year}-${month}-${day}T${String(cycleHour).padStart(2, '0')}:00:00Z`,
    modelName: 'NOAA GFS (Global Forecast System)',
    resolution: '0.25° (~28 km) Grid',
    source: 'NOAA / NCEP via Open-Meteo GFS API',
  };
};

export const getCapeDescription = (cape) => {
  if (cape === null || cape === undefined || Number.isNaN(cape)) return { label: 'N/A', level: 'none' };
  const val = Math.round(cape);
  if (val < 300) {
    return { label: 'Stable', level: 'low', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
  } else if (val < 1000) {
    return { label: 'Marginal Instability', level: 'moderate', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
  } else if (val < 2500) {
    return { label: 'Moderate Instability (Storms Possible)', level: 'high', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' };
  } else {
    return { label: 'Severe Instability (Severe Storms Likely)', level: 'extreme', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  }
};

export const getCinDescription = (cin) => {
  if (cin === null || cin === undefined || Number.isNaN(cin)) return { label: 'N/A', level: 'none' };
  const mag = Math.abs(Math.round(cin));
  if (mag < 25) {
    return { label: 'Weak / No Cap (Convective Lift Possible)', level: 'weak', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
  } else if (mag < 100) {
    return { label: 'Moderate Cap (Requires Strong Lift)', level: 'moderate', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
  } else {
    return { label: 'Strong Cap (Convection Suppressed)', level: 'strong', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
  }
};

export const formatQpe = (mm, unitSystem = 'metric') => {
  if (mm === null || mm === undefined || Number.isNaN(mm)) return '--';
  if (unitSystem === 'imperial') {
    const inches = mm * 0.03937;
    return `${inches.toFixed(2)} in`;
  }
  return `${mm.toFixed(1)} mm`;
};
