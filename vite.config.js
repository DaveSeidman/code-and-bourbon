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
  },
});
