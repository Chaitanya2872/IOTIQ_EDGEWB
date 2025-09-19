# Repository Overview

## Basic Info
- **name**: my-react-app
- **type**: React + TypeScript (Vite)
- **packageManager**: npm (lockfile present)

## Scripts
- **dev**: Vite dev server
- **build**: TypeScript build (tsc -b) then Vite build
- **lint**: ESLint on entire repo
- **preview**: Vite preview server

## Key Tech
- **React**: 18
- **Router**: react-router-dom 7
- **Charts**: recharts, chart.js + react-chartjs-2
- **UI/Icons**: antd, lucide-react
- **Maps**: leaflet, react-leaflet, Google Maps wrapper
- **Build Tool**: Vite 7
- **TypeScript**: ~5.8
- **ESLint**: 9 (flat config)

## Structure (high-level)
- **/public**: static assets
- **/src**: application code
  - **/api**: API clients/hooks (auth, inventory, analytics)
  - **/assets**: images
  - **/components**: reusable and page-level components
  - **/pages**: layout and navigation components
  - **/scripts**: data & analytics Python utilities and generated files
  - **/styles**: CSS modules for theming and features
  - **main.tsx**: app bootstrap
  - **App.tsx**: routes/layout entry
- **vite.config.ts**: Vite config
- **tsconfig*.json**: TS project configs
- **eslint.config.js**: ESLint flat config

## Notable Components
- **InventoryStockUsage.tsx**: Inventory analytics dashboard with consumption trends, footfall integration, and stock tracking.
- **InventoryDashboard.tsx, InventoryAnalytics.tsx**: Additional analytics UIs.
- **WorldMapComponent.tsx**: Map visualization.

## Data/Integrations
- **API**: Inventory and analytics APIs (hooks under src/api/hooks.ts and clients in src/api/inventory.ts)
- **Footfall**: FootfallAPI used for statistics and time-series (health, list, statistics endpoints)

## Development Notes
- Use `npm run dev` to start.
- Lint with `npm run lint`.
- Ensure environment variables in `.env` are configured for API endpoints.
- Some large components (e.g., InventoryStockUsage) exceed 2k lines; prefer refactoring into smaller subcomponents for maintainability.

## Potential Improvements
- Split complex components into subcomponents.
- Strengthen types for API payloads and unify date handling.
- Add tests and CI for lint/build.