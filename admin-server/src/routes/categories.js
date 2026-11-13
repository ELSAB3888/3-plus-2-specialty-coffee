/**
 * routes/categories.js
 * GET    /api/categories
 * POST   /api/categories
 * PUT    /api/categories/:id
 * DELETE /api/categories/:id
 */

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '../middleware/auth.js';
import { validateCategory, sanitizeId } from '../middleware/validate.js';
import { getCategories, saveCategories, getProducts } from '../services/dataService.js';
import { createBackup, pruneOldBackups } from '../services/backupService.js';

const router = Router();

// GET /api/categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await getCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});

// POST /api/categories
router.post('/', auth, validateCategory, async (req, res, next) => {
  try {
    await createBackup('pre-create-category');
    const categories = await getCategories();

    const nameEn = req.body.name_en || req.body.name || '';
    const nameAr = req.body.name_ar || '';
    const slug = req.body.slug || nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const now = new Date().toISOString();
    const newCategory = {
      id: uuidv4(),
      name_en: nameEn.trim(),
      name_ar: nameAr.trim(),
      slug: slug || `category-${Date.now()}`,
      description_en: req.body.description_en?.trim() || null,
      description_ar: req.body.description_ar?.trim() || null,
      image: req.body.image || null,
      display_order: typeof req.body.display_order === 'number' ? req.body.display_order : categories.length + 1,
      is_visible: req.body.is_visible !== false,
      created_at: now,
      updated_at: now,
    };

    categories.push(newCategory);
    await saveCategories(categories);
    await pruneOldBackups();

    console.log(`[${now}] categories: created ${newCategory.id} (${newCategory.name_en})`);
    res.status(201).json({ success: true, data: newCategory });
  } catch (err) {
    next(err);
  }
});

// PUT /api/categories/:id
router.put('/:id', auth, validateCategory, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!sanitizeId(id)) {
      return res.status(400).json({ success: false, error: 'Invalid category id' });
    }

    const categories = await getCategories();
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: `Category ${id} not found` });
    }

    await createBackup(`pre-update-category-${id}`);

    const nameEn = req.body.name_en ?? req.body.name ?? categories[idx].name_en;
    const now = new Date().toISOString();

    categories[idx] = {
      ...categories[idx],
      name_en: typeof nameEn === 'string' ? nameEn.trim() : categories[idx].name_en,
      name_ar: req.body.name_ar !== undefined ? req.body.name_ar.trim() : categories[idx].name_ar,
      slug: req.body.slug ?? categories[idx].slug,
      description_en: req.body.description_en !== undefined ? req.body.description_en : categories[idx].description_en,
      description_ar: req.body.description_ar !== undefined ? req.body.description_ar : categories[idx].description_ar,
      image: req.body.image !== undefined ? req.body.image : categories[idx].image,
      display_order: typeof req.body.display_order === 'number' ? req.body.display_order : categories[idx].display_order,
      is_visible: req.body.is_visible !== undefined ? req.body.is_visible : categories[idx].is_visible,
      updated_at: now,
    };

    await saveCategories(categories);
    await pruneOldBackups();

    console.log(`[${now}] categories: updated ${id}`);
    res.json({ success: true, data: categories[idx] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/categories/:id
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!sanitizeId(id)) {
      return res.status(400).json({ success: false, error: 'Invalid category id' });
    }

    const categories = await getCategories();
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: `Category ${id} not found` });
    }

    // Check no products use this category
    const products = await getProducts();
    const usingProducts = products.filter((p) => p.category_id === id);
    if (usingProducts.length > 0) {
      return res.status(409).json({
        success: false,
        error: `Cannot delete category — ${usingProducts.length} product(s) still reference it`,
        data: { products: usingProducts.map((p) => ({ id: p.id, name: p.name_en || p.name_ar })) },
      });
    }

    await createBackup(`pre-delete-category-${id}`);
    categories.splice(idx, 1);
    await saveCategories(categories);
    await pruneOldBackups();

    console.log(`[${new Date().toISOString()}] categories: deleted ${id}`);
    res.json({ success: true, data: { deleted: id } });
  } catch (err) {
    next(err);
  }
});

export default router;
