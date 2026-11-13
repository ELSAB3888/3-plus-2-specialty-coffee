/**
 * routes/health.js — GET /api/health
 * Public route — no auth required.
 */

import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const DATA_DIR = path.resolve(PROJECT_ROOT, 'public', 'data');

const router = Router();

router.get('/health', async (req, res) => {
  const timestamp = new Date().toISOString();

  const checkFile = async (filename) => {
    try {
      const filePath = path.join(DATA_DIR, filename);
      const raw = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      return { exists: true, count: Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length };
    } catch {
      return { exists: false, count: 0 };
    }
  };

  const [categories, products, extras] = await Promise.all([
    checkFile('categories.json'),
    checkFile('products.json'),
    checkFile('extras.json'),
  ]);

  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp,
      dataFiles: { categories, products, extras },
    },
  });
});

export default router;
