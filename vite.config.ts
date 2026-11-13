import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// When deployed to GitHub Pages, assets must be served from the repo sub-path.
// With hash routing (createHashRouter) the HTML is always index.html so base='/' works,
// but explicit repo-name base lets GitHub Pages serve CSS/JS correctly.
const base = process.env.GITHUB_REPOSITORY
  ? '/' + process.env.GITHUB_REPOSITORY.split('/')[1] + '/'
  : '/';

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          i18n: ['i18next', 'react-i18next'],
        },
      },
    },
  },
});
