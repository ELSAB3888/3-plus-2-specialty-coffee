/**
 * routes/images.js — Safe Local Image Management
 * POST   /api/images/upload (Multer: JPG/PNG/WebP, max 5MB)
 * DELETE /api/images/:filename (Reference counting: blocks deletion if in use)
 */

import { Router } from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { auth } from '../middleware/auth.js';
import { sanitizeFilename } from '../middleware/validate.js';
import { getProducts, getCategories } from '../services/dataService.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const IMAGES_DIR = path.resolve(PROJECT_ROOT, 'public', 'images', 'products');

// Multer storage engine
const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      await fs.mkdir(IMAGES_DIR, { recursive: true });
      cb(null, IMAGES_DIR);
    } catch (err) {
      cb(err, IMAGES_DIR);
    }
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const rand = Math.random().toString(36).substring(2, 8);
    const filename = `storage-${Date.now()}-${rand}${ext}`;
    cb(null, filename);
  },
});

// File filter: JPG, PNG, WebP only
const fileFilter = (_req, file, cb) => {
  const allowedMime = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedExt = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMime.includes(file.mimetype) && allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and WebP images are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

// POST /api/images/upload
router.post('/upload', auth, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: 'File exceeds 5MB size limit' });
      }
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided in upload' });
    }

    const publicPath = `/images/products/${req.file.filename}`;
    console.log(`[${new Date().toISOString()}] images: uploaded ${req.file.filename}`);

    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        publicPath,
        size: req.file.size,
      },
    });
  });
});

// DELETE /api/images/:filename
router.delete('/:filename', auth, async (req, res, next) => {
  try {
    const safeName = sanitizeFilename(req.params.filename);
    if (!safeName) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filename or unsafe characters detected.',
      });
    }

    // Reference Counting Check:
    // Check if any product or category references this image
    const [products, categories] = await Promise.all([getProducts(), getCategories()]);

    const usingProducts = products.filter(
      (p) => (p.image && p.image.includes(safeName)) || (p.image_url && p.image_url.includes(safeName))
    );
    const usingCategories = categories.filter(
      (c) => (c.image && c.image.includes(safeName)) || (c.image_url && c.image_url.includes(safeName))
    );

    if (usingProducts.length > 0 || usingCategories.length > 0) {
      return res.status(409).json({
        success: false,
        error: `Cannot delete image: still referenced by ${usingProducts.length} product(s) and ${usingCategories.length} category/categories.`,
        data: {
          referencedBy: {
            products: usingProducts.map((p) => ({ id: p.id, name: p.name_en || p.name_ar })),
            categories: usingCategories.map((c) => ({ id: c.id, name: c.name_en || c.name_ar })),
          },
        },
      });
    }

    const filePath = path.join(IMAGES_DIR, safeName);
    try {
      await fs.unlink(filePath);
      console.log(`[${new Date().toISOString()}] images: deleted ${safeName}`);
      res.json({ success: true, data: { deleted: safeName } });
    } catch (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({ success: false, error: 'Image file does not exist' });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

export default router;

