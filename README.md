# Atmosphere (wx_page)

A modern, responsive, real-time local weather dashboard and numerical weather prediction interface built with **React 19**, **Vite**, **Tailwind CSS v4**, **Bun**, and **Redux Toolkit**.

Atmosphere automatically detects your device location to deliver accurate atmospheric conditions, 48-hour trend plots for every parameter, NOAA GFS numerical model outputs (including CAPE, CIN, and QPE), dynamic condition-based themes, and seamless unit conversion.

---

## ✨ Features

- **🌐 Automatic Device Geolocation**: Seamlessly queries the browser's HTML5 Geolocation API with high accuracy on launch.
- **📍 Reverse Geocoding**: Automatically resolves device coordinates to human-readable city, region/state, and country names.
- **⚡ Real-Time Atmospheric Conditions** (via [Open-Meteo](https://open-meteo.com)):
  - **Current Temperature** with bold, easy-to-read typography.
  - **Dewpoint** calculation for atmospheric moisture levels.
  - **Wind Speed & Direction** with an interactive rotating 360° compass needle and 16-point cardinal bearing.
  - **Surface Barometric Pressure** at ground level.
  - **Cloud Cover** percentage with visual progress bar and cloudiness classifications.
  - **Day/Night Cycle & Timezone** detection.
- **📈 48-Hour Historical Trend Plots for Every Parameter**:
  - Every single parameter card includes an interactive SVG trend plot spanning the last 2 days (48 hours) up to the current hour.
  - Features smooth cubic curves, gradient area fills, min/max metrics, timeline tick markers (`-48h`, `-24h`, `Now`), and hover/touch crosshairs with exact timestamp tooltips.
  - Available for:
    - **Temperature** (in hero card)
    - **Dewpoint** (condensation threshold)
    - **Wind Speed** (surface velocity at 10m)
    - **Wind Direction** (angular heading & compass bearing)
    - **Surface Pressure** (barograph trace showing pressure systems)
    - **Cloud Cover** (sky opacity percentage)
- **🌪️ NOAA GFS Numerical Model Output (Latest Operational Run)**:
  - Dedicated section displaying forecast diagnostics from the latest operational cycle (`00Z`, `06Z`, `12Z`, or `18Z`) of the **NOAA Global Forecast System (GFS 0.25°)**:
  - **Model Surface Diagnostics**: GFS 2m Temperature (with real-time delta vs. observation), Dewpoint, Wind Speed/Direction, and Mean Sea Level Pressure.
  - **CAPE (Convective Available Potential Energy)**: Atmospheric instability index in $\text{J/kg}$ categorized by thunderstorm potential (Stable, Marginal, Moderate, or Severe Instability).
  - **CIN (Convective Inhibition Index)**: Boundary-layer capping barrier energy in $\text{J/kg}$ indicating whether convection is easily triggered or suppressed by a capping inversion.
  - **QPE (Quantitative Precipitation Estimator)**: Current modeled liquid precipitation rate alongside the **48-Hour Cumulative QPE Accumulation Total** in $\text{mm}$ or $\text{inches}$.
  - **Interactive 48-Hour GFS Meteogram**: Tabbed forecast graph with interactive crosshairs for *Temp & Dewpoint*, *Wind*, *Pressure*, *Cloud Cover*, *QPE Precipitation (Hourly & Cumulative)*, and *CAPE & CIN*.
  - **GFS Hourly Forecast Strip**: 24-hour horizontal forecast timeline featuring condition artwork, projected temperatures, precipitation totals, and convective alerts.
- **🎨 Dynamic Weather Art & Theming**: Maps standard WMO weather codes to custom SVG weather artwork, condition badges, and atmospheric gradient backgrounds.
- **🔄 Unit System Toggle (Metric & Imperial)**:
  - Instant toggle between **Metric** (°C, km/h, hPa, mm) and **Imperial** (°F, mph, inHg, in).
  - Reactively updates all real-time stats, historical 48-hour trend plots, and GFS model charts.
  - Persists preference locally in `localStorage` across visits (default is **Metric**).
- **⏱️ Automated Polling & Background Refresh**:
  - Live countdown timer for the automatic 5-minute update cycle.
  - One-click manual refresh button with live loading spinners.
  - Smart tab visibility listener that automatically updates data if the browser tab was inactive for over 5 minutes.
- **🛡️ Robust Fallback & Permission Handling**:
  - Clear user prompts if location permission is pending or denied.
  - Quick-preset city buttons (San Francisco, New York, London, Tokyo, Sydney).
  - Manual latitude/longitude coordinate input form.
  - Informative error banners with instant retry mechanisms.

---

## 🛠️ Tech Stack

- **Runtime & Package Manager**: [Bun](https://bun.sh) / [Node.js](https://nodejs.org)
- **Framework**: [React 19](https://react.dev) (JSX)
- **Build Tool**: [Vite 8](https://vite.dev)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org) & [React-Redux](https://react-redux.js.org)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) (via `@tailwindcss/vite`)
- **Icons**: [Lucide React](https://lucide.dev)
- **Linter**: [Oxlint](https://oxc.rs)
- **APIs**:
  - [Open-Meteo Forecast & Historical API](https://open-meteo.com) (No API key required)
  - [Open-Meteo NOAA GFS Seamless Model API](https://open-meteo.com/en/docs/gfs-api)
  - [BigDataCloud Reverse Geocoding Client API](https://www.bigdatacloud.com)

---

## 📁 Project Structure

```text
wx_page/
├── public/
│   ├── favicon.svg             # App favicon
│   └── weather/                # Custom SVG weather condition artwork
│       ├── clear-night.svg
│       ├── drizzle.svg
│       ├── fog.svg
│       ├── heavy-rain.svg
│       ├── overcast.svg
│       ├── partly-cloudy.svg
│       ├── partly-cloudy-night.svg
│       ├── rain.svg
│       ├── snow.svg
│       ├── snow-heavy.svg
│       ├── sun.svg
│       ├── thunderstorm.svg
│       └── thunderstorm-hail.svg
├── src/
│   ├── components/
│   │   ├── ErrorAlert.jsx          # Error banner with retry button
│   │   ├── GeolocationPrompt.jsx   # Geolocation request, presets, & custom coords
│   │   ├── GFSModelSection.jsx     # NOAA GFS model run output, CAPE/CIN/QPE meteogram
│   │   ├── Header.jsx              # App header, timers, unit toggle & refresh
│   │   ├── TrendPlot.jsx           # Reusable interactive 48-hour SVG trend chart
│   │   ├── UnitToggle.jsx          # Metric / Imperial switch
│   │   ├── WeatherCard.jsx         # Hero card with temperature, condition, art, & trend
│   │   ├── WeatherMetrics.jsx      # Metrics grid with 48h trend plots for each parameter
│   │   └── WindCompass.jsx         # Rotating SVG compass with cardinal direction
│   ├── store/
│   │   ├── index.js                # Redux store configuration
│   │   ├── preferencesSlice.js     # User preferences & localStorage persistence
│   │   └── weatherSlice.js         # Weather, GFS, & geolocation async thunks & state
│   ├── utils/
│   │   ├── gfsHelper.js            # GFS run cycle calculation, CAPE/CIN & QPE formatting
│   │   ├── unitConversion.js       # Temperature, speed, pressure, bearing helpers
│   │   └── weatherCodes.js         # WMO code to condition text, icons, & gradients
│   ├── App.jsx                     # Root application container & interval timers
│   ├── index.css                   # Global styles & Tailwind CSS imports
│   └── main.jsx                    # React root entry point
├── .gitignore
├── .oxlintrc.json                  # Oxlint configuration
├── bun.lock                        # Bun lockfile
├── index.html                      # HTML template
├── package.json
└── vite.config.js                  # Vite configuration with React & Tailwind plugins
```

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) (recommended) or [Node.js](https://nodejs.org) (v18+)

### 1. Clone the repository

```bash
git clone https://github.com/Hailstone-Labs/wx_page.git
cd wx_page
```

### 2. Install dependencies

Using Bun:
```bash
bun install
```

Or using npm:
```bash
npm install
```

### 3. Start development server

Using Bun:
```bash
bun run dev
```

Or using npm:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `bun run dev` | Starts the Vite local development server with Hot Module Replacement (HMR). |
| `bun run build` | Compiles and bundles production-ready assets into the `dist/` directory. |
| `bun run preview` | Locally serves the production build from `dist/` for verification. |
| `bun run lint` | Runs [Oxlint](https://oxc.rs) to check code quality and React best practices. |

---

## 🌐 External APIs Used

1. **[Open-Meteo Forecast & Historical API](https://open-meteo.com)**:
   - Provides free, high-resolution current weather and 2-day historical data without requiring an API key.
2. **[Open-Meteo NOAA GFS Seamless API](https://open-meteo.com/en/docs/gfs-api)**:
   - Provides operational run data for the NOAA Global Forecast System (0.25° grid) including CAPE, CIN, surface pressure, and QPE precipitation.
3. **[BigDataCloud](https://www.bigdatacloud.com)**:
   - Free client-side reverse geocoding API used to convert device coordinates into locality and region information.

---

## 📄 License

This project is licensed under the MIT License.
