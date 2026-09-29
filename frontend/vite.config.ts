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
        target: 'http://192.168.1.4:4318',
        changeOrigin: true,
      },
    },
  },

  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,

    coverage: {
      provider: 'v8',
    },
  },
});