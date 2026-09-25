import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  requestUserLocation,
  fetchWeatherData,
  decrementTimer,
  resetTimer,
} from './store/weatherSlice';
import Header from './components/Header';
import WeatherCard from './components/WeatherCard';
import WeatherMetrics from './components/WeatherMetrics';
import GFSModelSection from './components/GFSModelSection';
import GeolocationPrompt from './components/GeolocationPrompt';
import ErrorAlert from './components/ErrorAlert';
import { CloudSun } from 'lucide-react';

export default function App() {
  const dispatch = useDispatch();
  const {
    currentWeather,
    coordinates,
    status,
    geolocationStatus,
    secondsUntilNextUpdate,
    lastUpdated,
  } = useSelector((state) => state.weather);

  // 1. On mount: Request user device location
  useEffect(() => {
    dispatch(requestUserLocation());
  }, [dispatch]);

  // 2. Countdown and 5-minute auto-update interval
  useEffect(() => {
    const timerInterval = setInterval(() => {
      dispatch(decrementTimer());
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [dispatch]);

  // When countdown hits 0, trigger automatic update
  useEffect(() => {
    if (secondsUntilNextUpdate === 0) {
      if (coordinates) {
        dispatch(fetchWeatherData(coordinates));
      } else {
        dispatch(requestUserLocation());
      }
    }
  }, [secondsUntilNextUpdate, coordinates, dispatch]);

  // 3. Tab visibility listener: Auto-update if > 5 minutes have passed while in background
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && lastUpdated && coordinates) {
        const elapsed = (Date.now() - new Date(lastUpdated).getTime()) / 1000;
        if (elapsed >= 300) {
          dispatch(fetchWeatherData(coordinates));
          dispatch(resetTimer());
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [lastUpdated, coordinates, dispatch]);

  const hasWeather = Boolean(currentWeather);
  const showPrompt =
    !hasWeather &&
    (geolocationStatus === 'idle' ||
      geolocationStatus === 'requesting' ||
      geolocationStatus === 'denied');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Top subtle background atmospheric glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Main Content Area */}
        <main className="mt-8 flex-1">
          <ErrorAlert />

          {/* Show Geolocation Prompt when waiting for initial permission or if denied */}
          {showPrompt && <GeolocationPrompt />}

          {/* Show Main Weather Dashboard once data is available */}
          {hasWeather && (
            <div className="space-y-6 animate-fade-in">
              {/* Current Weather Hero Card with 48h Temperature Trend */}
              <WeatherCard />

              {/* Parameter Metrics Grid: Dewpoint, Wind Speed, Wind Direction, Surface Pressure, Cloud Cover — each with 48h Trend Plot */}
              <WeatherMetrics />

              {/* Section Showing GFS Numerical Model Output for Current Location based on Last Run */}
              <GFSModelSection />
            </div>
          )}

          {/* Loading indicator if loading for the first time */}
          {status === 'loading' && !hasWeather && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
              <p className="mt-4 text-sm font-medium text-slate-300">
                Retrieving local weather and GFS model output for your device...
              </p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <CloudSun className="w-4 h-4 text-slate-400" />
            <span>Experimental Weather Application · Use at your own risk.</span>
          </div>
          <div>
            Data sourced with permission from{' '}
            <a
              href="https://open-meteo.com"
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              Open-Meteo & NOAA GFS
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
