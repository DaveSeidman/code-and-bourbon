import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  plugins: [
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart({
      srcDirectory: 'src',
    }),
    // react's vite plugin must come after start's vite plugin
    viteReact(),
  ],
  server: {
    port: 3000,
  },
});
