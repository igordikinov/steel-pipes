import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Project is served from a sub-path on GitHub Pages, so the production build
// needs the /steel-pipes/ base; local dev stays at /.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/steel-pipes/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
  },
}));
