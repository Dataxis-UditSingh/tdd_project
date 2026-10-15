import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',

  plugins: [react()],

  server: {
    port: 5173,

    proxy: {
      '/api': 'http://localhost:4000',
      '/v1': {
        target: 'http://192.168.29.225:4318',
        changeOrigin: true,
      },
    },
  },

  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,

    exclude: [
      'node_modules',
      'dist',
      'e2e/**',
    ],

    coverage: {
      provider: 'v8',
    },
  },
});