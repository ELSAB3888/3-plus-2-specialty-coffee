/**
 * routes/extras.js
 * GET    /api/extras
 * POST   /api/extras
 * PUT    /api/extras/:id
 * DELETE /api/extras/:id
 */

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '../middleware/auth.js';
import { validateExtra, sanitizeId } from '../middleware/validate.js';
import { getExtras, saveExtras } from '../services/dataService.js';
import { createBackup, pruneOldBackups } from '../services/backupService.js';

const router = Router();

// GET /api/extras
router.get('/', async (req, res, next) => {
  try {
    const extras = await getExtras();
    res.json({ success: true, data: extras });
  } catch (err) {
    next(err);
  }
});

// POST /api/extras
router.post('/', auth, validateExtra, async (req, res, next) => {
  try {
    await createBackup('pre-create-extra');
    const extras = await getExtras();

    const now = new Date().toISOString();
    const nameEn = (req.body.name_en || req.body.name || '').trim();
    const nameAr = (req.body.name_ar || '').trim();
    const price = typeof req.body.price === 'string' ? parseFloat(req.body.price) : req.body.price;

    const newExtra = {
      id: uuidv4(),
      name_en: nameEn,
      name_ar: nameAr,
      price,
      is_available: req.body.is_available !== false,
      display_order: typeof req.body.display_order === 'number' ? req.body.display_order : extras.length + 1,
      created_at: now,
      updated_at: now,
    };

    extras.push(newExtra);
    await saveExtras(extras);
    await pruneOldBackups();

    console.log(`[${now}] extras: created ${newExtra.id} (${newExtra.name_en})`);
    res.status(201).json({ success: true, data: newExtra });
  } catch (err) {
    next(err);
  }
});

// PUT /api/extras/:id
router.put('/:id', auth, validateExtra, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!sanitizeId(id)) {
      return res.status(400).json({ success: false, error: 'Invalid extra id' });
    }

    const extras = await getExtras();
    const idx = extras.findIndex((e) => e.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: `Extra ${id} not found` });
    }

    await createBackup(`pre-update-extra-${id}`);

    const now = new Date().toISOString();
    const price = req.body.price !== undefined ? (typeof req.body.price === 'string' ? parseFloat(req.body.price) : req.body.price) : extras[idx].price;

    extras[idx] = {
      ...extras[idx],
      name_en: req.body.name_en !== undefined ? req.body.name_en.trim() : extras[idx].name_en,
      name_ar: req.body.name_ar !== undefined ? req.body.name_ar.trim() : extras[idx].name_ar,
      price,
      is_available: req.body.is_available !== undefined ? Boolean(req.body.is_available) : extras[idx].is_available,
      display_order: typeof req.body.display_order === 'number' ? req.body.display_order : extras[idx].display_order,
      updated_at: now,
    };

    await saveExtras(extras);
    await pruneOldBackups();

    console.log(`[${now}] extras: updated ${id}`);
    res.json({ success: true, data: extras[idx] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/extras/:id
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!sanitizeId(id)) {
      return res.status(400).json({ success: false, error: 'Invalid extra id' });
    }

    const extras = await getExtras();
    const idx = extras.findIndex((e) => e.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: `Extra ${id} not found` });
    }

    await createBackup(`pre-delete-extra-${id}`);
    extras.splice(idx, 1);
    await saveExtras(extras);
    await pruneOldBackups();

    console.log(`[${new Date().toISOString()}] extras: deleted ${id}`);
    res.json({ success: true, data: { deleted: id } });
  } catch (err) {
    next(err);
  }
});

export default router;

