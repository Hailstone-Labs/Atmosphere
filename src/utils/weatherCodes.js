/**
 * WMO Weather interpretation codes (WW)
 * Maps Open-Meteo weather codes to human-readable text, SVG image path, and atmospheric theme.
 */

export const getWeatherCondition = (code, isDay = 1) => {
  const numericCode = Number(code);

  switch (numericCode) {
    case 0:
      return {
        condition: isDay ? 'Clear Sky' : 'Clear Night',
        image: isDay ? '/weather/sun.svg' : '/weather/clear-night.svg',
        theme: isDay
          ? 'from-amber-500/20 via-orange-500/10 to-transparent border-amber-400/30'
          : 'from-indigo-950/40 via-purple-900/20 to-transparent border-indigo-500/30',
        badge: 'Sunny / Clear',
      };
    case 1:
      return {
        condition: isDay ? 'Mainly Clear' : 'Mainly Clear Night',
        image: isDay ? '/weather/sun.svg' : '/weather/clear-night.svg',
        theme: isDay
          ? 'from-amber-400/20 via-yellow-500/10 to-transparent border-amber-400/30'
          : 'from-slate-900/40 via-indigo-950/20 to-transparent border-slate-600/30',
        badge: 'Mainly Clear',
      };
    case 2:
      return {
        condition: 'Partly Cloudy',
        image: isDay ? '/weather/partly-cloudy.svg' : '/weather/partly-cloudy-night.svg',
        theme: 'from-sky-500/20 via-blue-500/10 to-transparent border-sky-400/30',
        badge: 'Partly Cloudy',
      };
    case 3:
      return {
        condition: 'Overcast',
        image: '/weather/overcast.svg',
        theme: 'from-slate-500/20 via-gray-600/10 to-transparent border-slate-400/30',
        badge: 'Overcast',
      };
    case 45:
    case 48:
      return {
        condition: numericCode === 48 ? 'Depositing Rime Fog' : 'Foggy',
        image: '/weather/fog.svg',
        theme: 'from-zinc-500/20 via-slate-600/10 to-transparent border-zinc-400/30',
        badge: 'Fog & Mist',
      };
    case 51:
    case 53:
    case 55:
      return {
        condition:
          numericCode === 51
            ? 'Light Drizzle'
            : numericCode === 53
            ? 'Moderate Drizzle'
            : 'Dense Drizzle',
        image: '/weather/drizzle.svg',
        theme: 'from-cyan-600/20 via-sky-700/10 to-transparent border-cyan-400/30',
        badge: 'Drizzle',
      };
    case 56:
    case 57:
      return {
        condition: 'Freezing Drizzle',
        image: '/weather/drizzle.svg',
        theme: 'from-teal-600/20 via-cyan-800/10 to-transparent border-teal-400/30',
        badge: 'Freezing Drizzle',
      };
    case 61:
      return {
        condition: 'Slight Rain',
        image: '/weather/rain.svg',
        theme: 'from-blue-600/20 via-sky-800/10 to-transparent border-blue-400/30',
        badge: 'Light Rain',
      };
    case 63:
      return {
        condition: 'Moderate Rain',
        image: '/weather/rain.svg',
        theme: 'from-blue-700/25 via-slate-800/15 to-transparent border-blue-500/30',
        badge: 'Moderate Rain',
      };
    case 65:
      return {
        condition: 'Heavy Rain',
        image: '/weather/heavy-rain.svg',
        theme: 'from-blue-900/30 via-slate-900/20 to-transparent border-blue-600/40',
        badge: 'Heavy Rain',
      };
    case 66:
    case 67:
      return {
        condition: 'Freezing Rain',
        image: '/weather/heavy-rain.svg',
        theme: 'from-cyan-900/30 via-slate-900/20 to-transparent border-cyan-500/30',
        badge: 'Freezing Rain',
      };
    case 71:
      return {
        condition: 'Slight Snow Fall',
        image: '/weather/snow.svg',
        theme: 'from-sky-200/20 via-indigo-900/20 to-transparent border-sky-300/30',
        badge: 'Light Snow',
      };
    case 73:
      return {
        condition: 'Moderate Snow Fall',
        image: '/weather/snow.svg',
        theme: 'from-sky-300/20 via-slate-800/20 to-transparent border-sky-300/30',
        badge: 'Moderate Snow',
      };
    case 75:
    case 77:
      return {
        condition: numericCode === 77 ? 'Snow Grains' : 'Heavy Snow Fall',
        image: '/weather/snow-heavy.svg',
        theme: 'from-indigo-300/20 via-blue-950/30 to-transparent border-indigo-200/30',
        badge: 'Heavy Snow',
      };
    case 80:
    case 81:
    case 82:
      return {
        condition:
          numericCode === 82 ? 'Violent Rain Showers' : 'Rain Showers',
        image: numericCode === 82 ? '/weather/heavy-rain.svg' : '/weather/rain.svg',
        theme: 'from-blue-800/25 via-sky-900/15 to-transparent border-blue-400/30',
        badge: 'Rain Showers',
      };
    case 85:
    case 86:
      return {
        condition: 'Snow Showers',
        image: '/weather/snow.svg',
        theme: 'from-sky-300/20 via-blue-950/20 to-transparent border-sky-300/30',
        badge: 'Snow Showers',
      };
    case 95:
      return {
        condition: 'Thunderstorm',
        image: '/weather/thunderstorm.svg',
        theme: 'from-purple-900/30 via-amber-600/15 to-transparent border-amber-500/40',
        badge: 'Thunderstorm',
      };
    case 96:
    case 99:
      return {
        condition: 'Thunderstorm with Hail',
        image: '/weather/thunderstorm-hail.svg',
        theme: 'from-purple-950/40 via-amber-700/20 to-transparent border-red-500/40',
        badge: 'Severe Storm & Hail',
      };
    default:
      return {
        condition: 'Partly Cloudy',
        image: '/weather/partly-cloudy.svg',
        theme: 'from-sky-500/20 via-blue-500/10 to-transparent border-sky-400/30',
        badge: 'Weather',
      };
  }
};
