import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  base: '/g360-signature-creator/',
  plugins: [solidPlugin()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
});
