import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../../../dist');

/**
 * Serve the built frontend from dist/ when available.
 * Supports both root / and GitHub Pages /3-plus-2-specialty-coffee subpath.
 * Never serves index.html for missing static assets to prevent JS MIME type errors.
 */
export function serveAdminUI(app) {
  if (fs.existsSync(DIST_DIR)) {
    // Production: serve built files from dist/ (both root and subpath)
    app.use(express.static(DIST_DIR));
    app.use('/3-plus-2-specialty-coffee', express.static(DIST_DIR));

    // Guard: static asset requests that were not matched by express.static should 404
    app.use((req, res, next) => {
      if (/\.(js|mjs|css|png|jpg|jpeg|svg|ico|json|woff2?|ttf|map)$/i.test(req.path)) {
        return res.status(404).type('text/plain').send('Asset not found');
      }
      next();
    });

    // SPA fallback: any GET that doesn't match a static file or /api/* returns index.html
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(DIST_DIR, 'index.html'));
    });

    console.log(`  Serving frontend from ${DIST_DIR}`);
    console.log('  Admin dashboard: http://127.0.0.1:3001/admin/login');
  } else {
    // Development: redirect to Vite dev server
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.redirect(`http://localhost:5173${req.originalUrl}`);
    });
    console.log('  Admin UI: redirect to http://localhost:5173 (run npm run dev)');
  }
}
