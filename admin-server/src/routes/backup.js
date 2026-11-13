/**
 * routes/backup.js — Safe Backup & Restore Operations
 * GET  /api/backups
 * POST /api/backups (create manual backup)
 * POST /api/backups/:id/restore (full restore, creates safety snapshot, NEVER auto-publishes)
 * POST /api/backups/:id/restore-product/:productId (single product restore)
 */

import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { sanitizeId } from '../middleware/validate.js';
import {
  listBackups,
  createBackup,
  restoreBackup,
  restoreProduct,
  pruneOldBackups,
} from '../services/backupService.js';

const router = Router();

// GET /api/backups
router.get('/', auth, async (_req, res, next) => {
  try {
    const backups = await listBackups();
    res.json({ success: true, data: backups });
  } catch (err) {
    next(err);
  }
});

// POST /api/backups
router.post('/', auth, async (req, res, next) => {
  try {
    const label = req.body.label ? String(req.body.label).trim() : 'manual';
    const backupId = await createBackup(label);
    await pruneOldBackups();
    res.status(201).json({ success: true, data: { backupId, label } });
  } catch (err) {
    next(err);
  }
});

// POST /api/backups/:id/restore
router.post('/:id/restore', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!sanitizeId(id)) {
      return res.status(400).json({ success: false, error: 'Invalid backup id' });
    }

    // Explicit confirmation header or body check
    const confirmed = req.body.confirmed === true;
    if (!confirmed) {
      return res.status(400).json({
        success: false,
        error: 'Explicit confirmation required. Send { confirmed: true } in request body.',
      });
    }

    const result = await restoreBackup(id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/backups/:id/restore-product/:productId
router.post('/:id/restore-product/:productId', auth, async (req, res, next) => {
  try {
    const { id, productId } = req.params;
    if (!sanitizeId(id) || !sanitizeId(productId)) {
      return res.status(400).json({ success: false, error: 'Invalid backup or product id' });
    }

    const confirmed = req.body.confirmed === true;
    if (!confirmed) {
      return res.status(400).json({
        success: false,
        error: 'Explicit confirmation required. Send { confirmed: true } in request body.',
      });
    }

    const result = await restoreProduct(id, productId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export default router;

