import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch weather data and GFS model output
export const fetchWeatherData = createAsyncThunk(
  'weather/fetchWeatherData',
  async ({ latitude, longitude }, { rejectWithValue }) => {
    try {
      // 1. Current observations & 2-day historical trend (past_days=2)
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,is_day&hourly=temperature_2m,dew_point_2m,wind_speed_10m,wind_direction_10m,surface_pressure,cloud_cover&past_days=2&forecast_days=1&timezone=auto`;

      const weatherPromise = fetch(weatherUrl).then(async (res) => {
        if (!res.ok) throw new Error(`Weather API error: ${res.statusText}`);
        return res.json();
      });

      // 2. NOAA GFS Model Output based on the latest run (including CAPE, CIN, and QPE precipitation)
      const gfsUrl = `https://api.open-meteo.com/v1/gfs?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,dew_point_2m,surface_pressure,wind_speed_10m,wind_direction_10m,cloud_cover,precipitation,weather_code,cape,convective_inhibition&hourly=temperature_2m,dew_point_2m,surface_pressure,wind_speed_10m,wind_direction_10m,cloud_cover,precipitation,weather_code,cape,convective_inhibition&forecast_days=4&timezone=auto`;

      const gfsPromise = fetch(gfsUrl)
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null);

      // 3. Reverse geocode to find city / region
      const geocodeUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
      const geocodePromise = fetch(geocodeUrl)
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null);

      const [weatherData, gfsData, geoData] = await Promise.all([
        weatherPromise,
        gfsPromise,
        geocodePromise,
      ]);

      const city = geoData?.city || geoData?.locality || geoData?.principalSubdivision || '';
      const region = geoData?.principalSubdivision || '';
      const country = geoData?.countryName || geoData?.countryCode || '';

      // Extract past two days trend (last 48 hourly points up to current time)
      const currentIso = weatherData.current?.time;
      const hourly = weatherData.hourly || {};
      const times = hourly.time || [];

      // Find indices up to current time
      const validIndices = [];
      for (let i = 0; i < times.length; i++) {
        if (!currentIso || times[i] <= currentIso) {
          validIndices.push(i);
        }
      }

      // Slice the last 48 entries (past 48 hours / 2 days)
      const last48 = validIndices.slice(-48);

      const pastTrends = {
        time: last48.map((i) => times[i]),
        temperature_2m: last48.map((i) => hourly.temperature_2m?.[i]),
        dew_point_2m: last48.map((i) => hourly.dew_point_2m?.[i]),
        wind_speed_10m: last48.map((i) => hourly.wind_speed_10m?.[i]),
        wind_direction_10m: last48.map((i) => hourly.wind_direction_10m?.[i]),
        surface_pressure: last48.map((i) => hourly.surface_pressure?.[i]),
        cloud_cover: last48.map((i) => hourly.cloud_cover?.[i]),
      };

      return {
        weather: weatherData,
        pastTrends,
        gfs: gfsData,
        location: {
          latitude,
          longitude,
          city,
          region,
          country,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch weather data');
    }
  }
);

// Async thunk to request device geolocation
export const requestUserLocation = createAsyncThunk(
  'weather/requestUserLocation',
  async (_, { dispatch, rejectWithValue }) => {
    if (!navigator.geolocation) {
      return rejectWithValue('Geolocation is not supported by your browser.');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          // Dispatch weather and model fetch immediately
          dispatch(fetchWeatherData(coords));
          resolve(coords);
        },
        (error) => {
          let msg = 'Unable to retrieve location.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              msg =
                'Location permission was denied. Please allow location access in your browser settings to see current local weather.';
              break;
            case error.POSITION_UNAVAILABLE:
              msg = 'Location information is unavailable on your device.';
              break;
            case error.TIMEOUT:
              msg = 'The request to obtain device location timed out.';
              break;
            default:
              msg = error.message || msg;
          }
          reject(rejectWithValue(msg));
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 60000,
        }
      );
    });
  }
);

const weatherSlice = createSlice({
  name: 'weather',
  initialState: {
    coordinates: null, // { latitude, longitude }
    locationDetails: {
      city: '',
      region: '',
      country: '',
    },
    currentWeather: null,
    weatherUnits: null,
    pastTrends: null, // 48-hour trend data for every parameter
    gfsData: null, // Latest NOAA GFS model run data
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    lastUpdated: null,
    geolocationStatus: 'idle', // 'idle' | 'requesting' | 'granted' | 'denied'
    geolocationError: null,
    secondsUntilNextUpdate: 300, // 5 minutes
  },
  reducers: {
    decrementTimer: (state) => {
      if (state.secondsUntilNextUpdate > 0) {
        state.secondsUntilNextUpdate -= 1;
      } else {
        state.secondsUntilNextUpdate = 300;
      }
    },
    resetTimer: (state) => {
      state.secondsUntilNextUpdate = 300;
    },
    setFallbackCoordinates: (state, action) => {
      state.coordinates = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Request location
    builder
      .addCase(requestUserLocation.pending, (state) => {
        state.geolocationStatus = 'requesting';
        state.geolocationError = null;
      })
      .addCase(requestUserLocation.fulfilled, (state, action) => {
        state.geolocationStatus = 'granted';
        state.coordinates = action.payload;
        state.geolocationError = null;
      })
      .addCase(requestUserLocation.rejected, (state, action) => {
        state.geolocationStatus = 'denied';
        state.geolocationError = action.payload || 'Failed to get location';
      });

    // Fetch weather data
    builder
      .addCase(fetchWeatherData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchWeatherData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentWeather = action.payload.weather.current;
        state.weatherUnits = action.payload.weather.current_units;
        state.pastTrends = action.payload.pastTrends;
        state.gfsData = action.payload.gfs;
        state.coordinates = {
          latitude: action.payload.location.latitude,
          longitude: action.payload.location.longitude,
        };
        state.locationDetails = {
          city: action.payload.location.city,
          region: action.payload.location.region,
          country: action.payload.location.country,
        };
        state.lastUpdated = action.payload.timestamp;
        state.secondsUntilNextUpdate = 300;
        state.error = null;
      })
      .addCase(fetchWeatherData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch weather data';
      });
  },
});

export const { decrementTimer, resetTimer, setFallbackCoordinates } = weatherSlice.actions;
export default weatherSlice.reducer;
