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
    rollupOptions: {
      output: {
        // The two heavyweight rendering libraries are split out so the first
        // paint does not wait on them and they stay cached across deploys.
        manualChunks: {
          lottie: ['lottie-react', 'lottie-web'],
          d3: ['d3'],
        },
      },
    },
  },
}));
