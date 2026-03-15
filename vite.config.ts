import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), tailwindcss()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        'process.env.POSTHOG_API_KEY': JSON.stringify(env.POSTHOG_API_KEY || ''),
        'process.env.POSTHOG_HOST': JSON.stringify(env.POSTHOG_HOST || ''),
        'process.env.SENTRY_DSN': JSON.stringify(env.SENTRY_DSN || ''),
        'process.env.NODE_ENV': JSON.stringify(mode || 'development'),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
