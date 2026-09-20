import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWeatherData, requestUserLocation } from '../store/weatherSlice';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorAlert() {
  const dispatch = useDispatch();
  const { error, coordinates } = useSelector((state) => state.weather);

  if (!error) return null;

  const handleRetry = () => {
    if (coordinates) {
      dispatch(fetchWeatherData(coordinates));
    } else {
      dispatch(requestUserLocation());
    }
  };

  return (
    <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 backdrop-blur-md flex items-start justify-between gap-3 text-rose-300">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-rose-200">Unable to update weather</h4>
          <p className="text-xs text-rose-300/80 mt-0.5">{error}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleRetry}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/40 text-xs font-semibold text-rose-200 border border-rose-500/30 transition-colors cursor-pointer shrink-0"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Retry</span>
      </button>
    </div>
  );
}
