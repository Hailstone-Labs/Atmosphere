# Atmosphere (wx_page)

A modern, responsive, real-time local weather dashboard built with React 19, Vite, Tailwind CSS v4, Bun, and Redux Toolkit.

Atmosphere automatically detects your device location to deliver accurate atmospheric conditions, intuitive visual indicators, dynamic condition-based themes, and seamless unit conversion.

---

## ✨ Features

- **🌐 Automatic Device Geolocation**: Seamlessly queries the browser's HTML5 Geolocation API with high accuracy on launch.
- **📍 Reverse Geocoding**: Automatically resolves coordinates to human-readable city, region/state, and country names.
- **⚡ Real-Time Atmospheric Conditions** (via [Open-Meteo](https://open-meteo.com)):
  - **Current Temperature** with bold, easy-to-read typography.
  - **Dewpoint** calculation for atmospheric moisture levels.
  - **Wind Speed & Direction** with an interactive rotating 360° compass needle and 16-point cardinal bearing.
  - **Surface Barometric Pressure** at ground level.
  - **Cloud Cover** percentage with visual progress bar and cloudiness classifications.
  - **Day/Night Cycle & Timezone** detection.
- **🎨 Dynamic Weather Art & Theming**: Maps standard WMO weather codes to custom SVG weather artwork, condition badges, and atmospheric gradient backgrounds.
- **🔄 Unit System Toggle (Metric & Imperial)**:
  - Toggle between **Metric** (°C, km/h, hPa) and **Imperial** (°F, mph, inHg) at any time.
  - Persists preference locally in `localStorage` across visits.
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
- **Framework**: [React 19](https://react.dev)
- **Build Tool**: [Vite 8](https://vite.dev)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org) & [React-Redux](https://react-redux.js.org)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) (via `@tailwindcss/vite`)
- **Icons**: [Lucide React](https://lucide.dev)
- **Linter**: [Oxlint](https://oxc.rs)
- **APIs**:
  - [Open-Meteo Forecast API](https://open-meteo.com) (No API key required)
  - [BigDataCloud Reverse Geocoding Client API](https://www.bigdatacloud.com)

---

## 📁 Project Structure

```text
wx_page/
├── public/
│   ├── favicon.svg             # App favicon
│   ├── icons.svg               # SVG icons sprite
│   └── weather/                # SVG weather condition artwork
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
│   │   ├── Header.jsx              # App header, timers, unit toggle & refresh
│   │   ├── UnitToggle.jsx          # Metric / Imperial switch
│   │   ├── WeatherCard.jsx         # Hero card with temperature, condition, & art
│   │   ├── WeatherMetrics.jsx      # Metrics grid (dewpoint, wind, pressure, clouds)
│   │   └── WindCompass.jsx         # Rotating SVG compass with cardinal direction
│   ├── store/
│   │   ├── index.js                # Redux store configuration
│   │   ├── preferencesSlice.js     # User preferences & localStorage persistence
│   │   └── weatherSlice.js         # Weather & geolocation async thunks & state
│   ├── utils/
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

1. **[Open-Meteo](https://open-meteo.com)**:
   - Provides free, high-resolution weather forecasts and real-time meteorological conditions without requiring an API key.
2. **[BigDataCloud](https://www.bigdatacloud.com)**:
   - Free client-side reverse geocoding API used to convert device coordinates into locality and region information.

---

## 📄 License

This project is licensed under the MIT License.
