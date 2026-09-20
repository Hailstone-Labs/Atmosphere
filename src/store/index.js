import { configureStore } from '@reduxjs/toolkit';
import weatherReducer from './weatherSlice';
import preferencesReducer from './preferencesSlice';

export const store = configureStore({
  reducer: {
    weather: weatherReducer,
    preferences: preferencesReducer,
  },
});

export default store;
