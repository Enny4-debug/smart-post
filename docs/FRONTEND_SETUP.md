# SmartPost Frontend — Installation & Usage Guide

This document outlines the steps required to set up, run, and build the SmartPost frontend application.

## Prerequisites
Before you begin, ensure you have the following installed on your machine:
- **Node.js** (v18.x or v20.x recommended)
- **Yarn** (The project specifies `yarn@4.6.0`, but `npm` also works)

## Tech Stack Overview
- **Framework:** React 18
- **Build Tool:** Vite
- **UI Library:** Material-UI (MUI v6)
- **Routing:** React Router v7
- **HTTP Client:** Axios

---

## 1. Installation

1. Open your terminal and navigate to the frontend directory:
   ```bash
   cd /path/to/smart-post/frontend
   ```

2. Install the project dependencies:
   ```bash
   npm install
   # OR if using yarn:
   yarn install
   ```

## 2. Environment Variables

Create a `.env` file in the root of the `frontend` directory (next to `package.json`). Add the required environment variables. For local development, it should look like this:

```env
# Example .env file
VITE_API_BASE_URL=http://localhost:8000
```
*(Note: Vite requires custom environment variables to be prefixed with `VITE_`)*

---

## 3. Usage & Available Scripts

In the project directory, you can run the following commands:

### Start Development Server
```bash
npm start
# OR
yarn start
```
Runs the app in development mode using Vite. 
Open [http://localhost:5173](http://localhost:5173) (or the port Vite assigns) to view it in your browser. The page will reload when you make changes.

### Build for Production
```bash
npm run build
# OR
yarn build
```
Builds the app for production to the `dist` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

### Preview Production Build
```bash
npm run preview
# OR
yarn preview
```
Locally preview the production build that was generated in the `dist` folder.

### Code Quality (Linting & Formatting)
- **Run Linter:** `npm run lint`
- **Fix Lint Errors:** `npm run lint:fix`
- **Format Code:** `npm run prettier`

---

## 4. Project Structure Highlights

- `/src/api` - Axios client setup and API configuration.
- `/src/assets` - Static assets like images (e.g., the SmartPost logo).
- `/src/components` - Reusable UI components.
- `/src/layout` - Layout wrappers (Dashboard, Header, Sidebar).
- `/src/menu-items` - Sidebar navigation configurations per role.
- `/src/pages` - Main page components (e.g., Student Dashboard, Admin Users).
- `/src/routes` - React Router configuration (`MainRoutes.jsx`, etc.).
- `/src/sections` - Modular sections for pages (e.g., Auth forms).

---

## Troubleshooting

- **CORS Errors:** Ensure your backend (`fastapi`) is running and its `CORS_ORIGINS` environment variable includes your frontend's exact local URL (e.g., `http://localhost:5173` or `http://localhost:3000`).
- **Dependencies out of sync:** If you encounter weird module resolution errors, delete `node_modules` and the package lock file (`package-lock.json` or `yarn.lock`), then run the install command again.
