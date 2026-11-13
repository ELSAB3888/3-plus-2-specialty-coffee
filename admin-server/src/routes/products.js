/**
 * routes/products.js
 * GET    /api/products
 * GET    /api/products/:id
 * POST   /api/products
 * PUT    /api/products/:id
 * PATCH  /api/products/:id/availability
 * DELETE /api/products/:id
 */

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '../middleware/auth.js';
import { validateProduct, sanitizeId } from '../middleware/validate.js';
import { getProducts, saveProducts, getCategories } from '../services/dataService.js';
import { createBackup, pruneOldBackups } from '../services/backupService.js';

const router = Router();

// GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const products = await getProducts();
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!sanitizeId(id)) {
      return res.status(400).json({ success: false, error: 'Invalid product id' });
    }
    const products = await getProducts();
    const product = products.find((p) => p.id === id);
    if (!product) {
      return res.status(404).json({ success: false, error: `Product ${id} not found` });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// POST /api/products
router.post('/', auth, validateProduct, async (req, res, next) => {
  try {
    await createBackup('pre-create-product');

    const categories = await getCategories();
    const categoryExists = categories.some((c) => c.id === req.body.category_id);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        error: `Category ${req.body.category_id} does not exist`,
      });
    }

    const products = await getProducts();
    const now = new Date().toISOString();

    const rawSizes = req.body.sizes || req.body.product_sizes || [];
    const sizes = rawSizes.map((s, idx) => ({
      id: s.id || uuidv4(),
      label_en: (s.label_en || s.name || 'Standard').trim(),
      label_ar: (s.label_ar || s.name || 'حجم قياسي').trim(),
      price: typeof s.price === 'string' ? parseFloat(s.price) : s.price,
      display_order: typeof s.display_order === 'number' ? s.display_order : idx + 1,
      is_available: s.is_available !== false,
      created_at: s.created_at || now,
    }));

    const newProduct = {
      id: uuidv4(),
      category_id: req.body.category_id,
      name_en: (req.body.name_en || req.body.name || '').trim(),
      name_ar: (req.body.name_ar || '').trim(),
      description_en: req.body.description_en?.trim() || null,
      description_ar: req.body.description_ar?.trim() || null,
      image: req.body.image || null,
      image_url: req.body.image || null,
      image_url_original: req.body.image_url_original || null,
      display_order: typeof req.body.display_order === 'number' ? req.body.display_order : products.length + 1,
      is_visible: req.body.is_visible !== false,
      is_featured: Boolean(req.body.is_featured),
      sizes,
      extra_ids: Array.isArray(req.body.extra_ids) ? req.body.extra_ids : [],
      created_at: now,
      updated_at: now,
    };

    products.push(newProduct);
    await saveProducts(products);
    await pruneOldBackups();

    console.log(`[${now}] products: created ${newProduct.id} (${newProduct.name_en || newProduct.name_ar})`);
    res.status(201).json({ success: true, data: newProduct });
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id
router.put('/:id', auth, validateProduct, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!sanitizeId(id)) {
      return res.status(400).json({ success: false, error: 'Invalid product id' });
    }

    const products = await getProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: `Product ${id} not found` });
    }

    await createBackup(`pre-update-product-${id}`);

    const now = new Date().toISOString();
    const rawSizes = req.body.sizes || req.body.product_sizes || [];
    const sizes = rawSizes.map((s, sIdx) => ({
      id: s.id || uuidv4(),
      label_en: (s.label_en || s.name || 'Standard').trim(),
      label_ar: (s.label_ar || s.name || 'حجم قياسي').trim(),
      price: typeof s.price === 'string' ? parseFloat(s.price) : s.price,
      display_order: typeof s.display_order === 'number' ? s.display_order : sIdx + 1,
      is_available: s.is_available !== false,
      created_at: s.created_at || now,
    }));

    products[idx] = {
      ...products[idx],
      category_id: req.body.category_id ?? products[idx].category_id,
      name_en: req.body.name_en !== undefined ? req.body.name_en.trim() : products[idx].name_en,
      name_ar: req.body.name_ar !== undefined ? req.body.name_ar.trim() : products[idx].name_ar,
      description_en: req.body.description_en !== undefined ? req.body.description_en : products[idx].description_en,
      description_ar: req.body.description_ar !== undefined ? req.body.description_ar : products[idx].description_ar,
      image: req.body.image !== undefined ? req.body.image : products[idx].image,
      image_url: req.body.image !== undefined ? req.body.image : (products[idx].image || products[idx].image_url),
      display_order: typeof req.body.display_order === 'number' ? req.body.display_order : products[idx].display_order,
      is_visible: req.body.is_visible !== undefined ? req.body.is_visible : products[idx].is_visible,
      is_featured: req.body.is_featured !== undefined ? Boolean(req.body.is_featured) : products[idx].is_featured,
      sizes,
      extra_ids: Array.isArray(req.body.extra_ids) ? req.body.extra_ids : (products[idx].extra_ids || []),
      updated_at: now,
    };

    await saveProducts(products);
    await pruneOldBackups();

    console.log(`[${now}] products: updated ${id}`);
    res.json({ success: true, data: products[idx] });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/products/:id/availability
router.patch('/:id/availability', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!sanitizeId(id)) {
      return res.status(400).json({ success: false, error: 'Invalid product id' });
    }

    const products = await getProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: `Product ${id} not found` });
    }

    await createBackup(`pre-toggle-availability-${id}`);

    const now = new Date().toISOString();
    const currentVis = products[idx].is_visible;
    const newVis = req.body.is_visible !== undefined ? Boolean(req.body.is_visible) : !currentVis;

    products[idx] = {
      ...products[idx],
      is_visible: newVis,
      updated_at: now,
    };

    await saveProducts(products);
    await pruneOldBackups();

    console.log(`[${now}] products: set ${id} is_visible to ${newVis}`);
    res.json({ success: true, data: products[idx] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!sanitizeId(id)) {
      return res.status(400).json({ success: false, error: 'Invalid product id' });
    }

    const products = await getProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: `Product ${id} not found` });
    }

    await createBackup(`pre-delete-product-${id}`);
    const deleted = products.splice(idx, 1)[0];
    await saveProducts(products);
    await pruneOldBackups();

    console.log(`[${new Date().toISOString()}] products: deleted ${id} (${deleted.name_en || deleted.name_ar})`);
    res.json({ success: true, data: { deleted: id } });
  } catch (err) {
    next(err);
  }
});

export default router;

