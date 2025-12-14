import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Experimental Vite config: not used by default build yet.
// Keep CRA/CRACO as default; use `npx vite` to trial run.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false
  },
  build: {
    sourcemap: true
  }
});