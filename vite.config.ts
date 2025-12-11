import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // Using '.' instead of process.cwd() to avoid TS issues with missing Node types
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // This is critical: it replaces process.env.API_KEY with the actual string during build
      // allowing the app to work in the browser while keeping code compatible.
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    // Ensure relative paths for assets if deployed to a subdirectory
    base: './',
  };
});