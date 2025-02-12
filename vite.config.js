import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
      },
    },
  },
  plugins: [
    react(),
  ],
  server: {
    port: 8080,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // secure: false, // it works without this, but you get a code of 304 Not Modified instead of 200 OK
      },
    },
  },
});
