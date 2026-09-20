import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestUserLocation, fetchWeatherData } from '../store/weatherSlice';
import { MapPin, Navigation, AlertTriangle, Globe } from 'lucide-react';

const PRESET_CITIES = [
  { name: 'San Francisco, CA', lat: 37.7749, lon: -122.4194 },
  { name: 'New York, NY', lat: 40.7128, lon: -74.006 },
  { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093 },
];

export default function GeolocationPrompt() {
  const dispatch = useDispatch();
  const { geolocationStatus, geolocationError, status } = useSelector((state) => state.weather);
  const [customLat, setCustomLat] = useState('');
  const [customLon, setCustomLon] = useState('');

  const isRequesting = geolocationStatus === 'requesting' || status === 'loading';
  const isDenied = geolocationStatus === 'denied';

  const handleAllowLocation = () => {
    dispatch(requestUserLocation());
  };

  const handleSelectPreset = (lat, lon) => {
    dispatch(fetchWeatherData({ latitude: lat, longitude: lon }));
  };

  const handleCustomCoordsSubmit = (e) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      dispatch(fetchWeatherData({ latitude: lat, longitude: lon }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-12 p-8 rounded-3xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-xl shadow-2xl text-center">
      {/* Icon */}
      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
        {isDenied ? (
          <AlertTriangle className="w-8 h-8 text-amber-400" />
        ) : (
          <Navigation className={`w-8 h-8 ${isRequesting ? 'animate-bounce' : ''}`} />
        )}
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">
        {isDenied ? 'Location Access Blocked' : 'Enable Device Location'}
      </h2>

      <p className="text-sm text-slate-300 max-w-md mx-auto mb-6 leading-relaxed">
        {isDenied
          ? geolocationError ||
            'Location permission was denied in your browser. You can grant access in browser settings and retry, or pick a location below.'
          : 'To display your accurate local weather, please grant permission for this application to access your device location.'}
      </p>

      {/* Action Button */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 mb-8">
        <button
          type="button"
          onClick={handleAllowLocation}
          disabled={isRequesting}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-500/25 active:scale-98 cursor-pointer disabled:opacity-50"
        >
          <MapPin className="w-4 h-4" />
          <span>{isRequesting ? 'Locating Device...' : isDenied ? 'Retry Location Request' : 'Use Device Location'}</span>
        </button>
      </div>

      {/* Preset Fallbacks */}
      <div className="border-t border-slate-700/60 pt-6">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          <Globe className="w-3.5 h-3.5" />
          <span>Or preview with a sample location:</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {PRESET_CITIES.map((city) => (
            <button
              key={city.name}
              type="button"
              onClick={() => handleSelectPreset(city.lat, city.lon)}
              className="px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {city.name}
            </button>
          ))}
        </div>

        {/* Custom Coordinates Option */}
        <form onSubmit={handleCustomCoordsSubmit} className="mt-5 flex items-center justify-center gap-2 max-w-sm mx-auto">
          <input
            type="number"
            step="any"
            placeholder="Latitude (e.g. 40.71)"
            value={customLat}
            onChange={(e) => setCustomLat(e.target.value)}
            className="w-1/2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <input
            type="number"
            step="any"
            placeholder="Longitude (e.g. -74.01)"
            value={customLon}
            onChange={(e) => setCustomLon(e.target.value)}
            className="w-1/2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-medium text-white border border-slate-600 cursor-pointer"
          >
            Go
          </button>
        </form>
      </div>
    </div>
  );
}
