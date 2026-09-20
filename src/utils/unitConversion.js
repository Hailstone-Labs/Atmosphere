/**
 * Unit conversion utilities for metric and imperial weather metrics.
 */

export const formatTemperature = (celsius, unit = 'metric') => {
  if (celsius === null || celsius === undefined || Number.isNaN(celsius)) return '--';
  if (unit === 'imperial') {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${Math.round(fahrenheit)}°F`;
  }
  return `${Math.round(celsius)}°C`;
};

export const formatDewpoint = (celsius, unit = 'metric') => {
  if (celsius === null || celsius === undefined || Number.isNaN(celsius)) return '--';
  if (unit === 'imperial') {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${fahrenheit.toFixed(1)}°F`;
  }
  return `${celsius.toFixed(1)}°C`;
};

export const formatWindSpeed = (kmh, unit = 'metric') => {
  if (kmh === null || kmh === undefined || Number.isNaN(kmh)) return '--';
  if (unit === 'imperial') {
    const mph = kmh * 0.621371;
    return `${mph.toFixed(1)} mph`;
  }
  return `${kmh.toFixed(1)} km/h`;
};

export const getCompassDirection = (degrees) => {
  if (degrees === null || degrees === undefined || Number.isNaN(degrees)) return '--';
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW'
  ];
  const index = Math.round((((degrees % 360) + 360) % 360) / 22.5) % 16;
  return directions[index];
};

export const formatWindDirection = (degrees) => {
  if (degrees === null || degrees === undefined || Number.isNaN(degrees)) return '--';
  const normalized = Math.round((((degrees % 360) + 360) % 360));
  const cardinal = getCompassDirection(degrees);
  return `${cardinal} (${normalized}°)`;
};

export const formatPressure = (hPa, unit = 'metric') => {
  if (hPa === null || hPa === undefined || Number.isNaN(hPa)) return '--';
  if (unit === 'imperial') {
    const inHg = hPa * 0.02953;
    return `${inHg.toFixed(2)} inHg`;
  }
  return `${Math.round(hPa)} hPa`;
};

export const formatCloudCover = (percent) => {
  if (percent === null || percent === undefined || Number.isNaN(percent)) return '--';
  return `${Math.round(percent)}%`;
};
