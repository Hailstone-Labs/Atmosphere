import { createSlice } from '@reduxjs/toolkit';

const getInitialUnitSystem = () => {
  // Requirement: default is metric
  try {
    const saved = localStorage.getItem('wx_unit_system');
    if (saved === 'imperial' || saved === 'metric') {
      return saved;
    }
  } catch {
    // ignore localStorage errors
  }
  return 'metric';
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: {
    unitSystem: getInitialUnitSystem(), // 'metric' | 'imperial'
  },
  reducers: {
    toggleUnitSystem: (state) => {
      state.unitSystem = state.unitSystem === 'metric' ? 'imperial' : 'metric';
      try {
        localStorage.setItem('wx_unit_system', state.unitSystem);
      } catch {
        // ignore
      }
    },
    setUnitSystem: (state, action) => {
      state.unitSystem = action.payload === 'imperial' ? 'imperial' : 'metric';
      try {
        localStorage.setItem('wx_unit_system', state.unitSystem);
      } catch {
        // ignore
      }
    },
  },
});

export const { toggleUnitSystem, setUnitSystem } = preferencesSlice.actions;
export default preferencesSlice.reducer;
