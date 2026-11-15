/**
 * Vite config
 * Path: vite.config.js
 *
 * React plus Konva's service worker step (src/pwa/swBuild.js), which writes dist/sw.js after
 * each production build. `npm run dev` has no service worker; use `npm run build && npm run preview`
 * to try offline mode.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { konvaPwa } from './src/pwa/swBuild.js';

export default defineConfig({
  plugins: [react(), konvaPwa()],
});
