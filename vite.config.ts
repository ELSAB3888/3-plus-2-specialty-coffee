import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

/** Vite plugin to duplicate index.html as 404.html for GitHub Pages SPA routing */
function copy404Plugin(): Plugin {
  return {
    name: 'copy-404-html',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const indexHtml = path.join(distDir, 'index.html');
      const notFoundHtml = path.join(distDir, '404.html');
      if (fs.existsSync(indexHtml)) {
        fs.copyFileSync(indexHtml, notFoundHtml);
        console.log('✓ Created dist/404.html from dist/index.html');
      }
    },
  };
}

/** Dev plugin to support /3-plus-2-specialty-coffee/* subpath seamlessly in local development */
function devSubpathFallbackPlugin(): Plugin {
  return {
    name: 'dev-subpath-fallback',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url && req.url.startsWith('/3-plus-2-specialty-coffee')) {
          req.url = req.url.replace(/^\/3-plus-2-specialty-coffee/, '') || '/';
        }
        next();
      });
    },
  };
}

export default defineConfig(({ command }) => {
  const isBuild = command === 'build';
  // GitHub Pages deployment requires repository subpath; local dev serves cleanly from root /
  const base = isBuild
    ? (process.env.GITHUB_REPOSITORY
        ? '/' + process.env.GITHUB_REPOSITORY.split('/')[1] + '/'
        : '/3-plus-2-specialty-coffee/')
    : '/';

  return {
    base,
    plugins: [react(), copy404Plugin(), devSubpathFallbackPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      strictPort: false,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
          secure: false,
        },
      },
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
  };
});
