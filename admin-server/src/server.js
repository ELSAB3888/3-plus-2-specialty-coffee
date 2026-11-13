import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Routes
import categoriesRouter from './routes/categories.js';
import productsRouter from './routes/products.js';
import extrasRouter from './routes/extras.js';
import imagesRouter from './routes/images.js';
import backupRouter from './routes/backup.js';
import gitRouter from './routes/git.js';
import healthRouter from './routes/health.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = '127.0.0.1';

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3001',
  'http://localhost:3001',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, same-origin server calls)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
  })
);

// ── Body parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static files (built admin dashboard) ─────────────────────────────────────
const distDir = path.resolve(__dirname, '../../dist');
const indexHtml = path.join(distDir, 'index.html');

// Serve static assets from dist for both root and /3-plus-2-specialty-coffee subpath
app.use(express.static(distDir));
app.use('/3-plus-2-specialty-coffee', express.static(distDir));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', healthRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/extras', extrasRouter);
app.use('/api/images', imagesRouter);
app.use('/api/backups', backupRouter);
app.use('/api/git', gitRouter);

// ── Asset 404 guard ───────────────────────────────────────────────────────────
// Never return index.html for missing static assets (prevents JS MIME type errors)
app.use((req, res, next) => {
  if (/\.(js|mjs|css|png|jpg|jpeg|svg|ico|json|woff2?|ttf|map)$/i.test(req.path)) {
    return res.status(404).type('text/plain').send('Asset not found');
  }
  next();
});

// ── SPA fallback (serves index.html for any client-side route) ───────────────
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    // Dev mode: redirect to Vite dev server
    res.redirect(`http://localhost:5173${req.originalUrl}`);
  }
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR ${req.method} ${req.path}:`, err.message);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const isDirectRun = process.argv[1] && (
  process.argv[1].endsWith('server.js') ||
  process.argv[1] === fileURLToPath(import.meta.url)
);

if (isDirectRun) {
  app.listen(PORT, HOST, () => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 3+2 Admin Server started`);
    console.log(`[${timestamp}]   Listening on http://${HOST}:${PORT}`);
    console.log(`[${timestamp}]   Allowed origins: ${allowedOrigins.join(', ')}`);
    console.log(`[${timestamp}]   Auth token configured: ${Boolean(process.env.ADMIN_TOKEN)}`);
    console.log(`[${timestamp}]   Git remote: ${process.env.GIT_REMOTE ? 'configured' : 'not configured'}`);
  });
}

export default app;
