import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../../../dist');

/**
 * Serve the built frontend from dist/ when available.
 * With hash routing (createHashRouter), all client routes are handled
 * within index.html using /#/path fragments, so we just serve the
 * static dist folder and fall back to index.html for any non-API,
 * non-static request.
 */
export function serveAdminUI(app) {
  if (fs.existsSync(DIST_DIR)) {
    // Production: serve built files from dist/
    app.use(express.static(DIST_DIR));

    // SPA fallback: any GET that doesn't match a static file or /api/* returns index.html
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(DIST_DIR, 'index.html'));
    });

    console.log(`  Serving frontend from ${DIST_DIR}`);
    console.log('  Admin dashboard: http://127.0.0.1:3001/#/admin');
  } else {
    // Development: redirect to Vite dev server
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.redirect(`http://localhost:5173${req.originalUrl}`);
    });
    console.log('  Admin UI: redirect to http://localhost:5173 (run npm run dev)');
  }
}
