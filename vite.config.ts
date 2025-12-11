import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    build: {
      target: 'esnext', // Crucial for modern AI SDKs
      outDir: 'dist',
    },
    base: './', // Ensures relative paths work on any static hosting (Vercel, GitHub Pages, etc.)
  };
});