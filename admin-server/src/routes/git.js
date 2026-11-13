/**
 * routes/git.js — Automated Git & Deployment Operations
 * POST /api/git/commit-and-push
 * GET  /api/git/status
 * GET  /api/git/health
 */

import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { commitAndPush, getStatus, getGitHealth } from '../services/gitService.js';
import { createBackup } from '../services/backupService.js';

const router = Router();

// GET /api/git/status
router.get('/status', auth, async (_req, res, next) => {
  try {
    const status = await getStatus();
    res.json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
});

// GET /api/git/health
router.get('/health', auth, async (_req, res, next) => {
  try {
    const health = await getGitHealth();
    res.json({ success: true, data: health });
  } catch (err) {
    next(err);
  }
});

// POST /api/git/commit-and-push
router.post('/commit-and-push', auth, async (req, res, next) => {
  try {
    const operation = req.body.operation || 'admin-update';
    const rawMessage = req.body.message || 'Update menu data';
    const message = `chore(menu): ${rawMessage.trim()}`;

    // 1. Mandatory safety backup before publishing/git commit
    const backupId = await createBackup(`pre-publish-${operation}`);
    console.log(`[${new Date().toISOString()}] git: created safety backup ${backupId} before publishing`);

    // 2. Perform Git commit and push
    const result = await commitAndPush(message);

    if (!result.success) {
      // Local changes and backups are completely preserved!
      return res.status(502).json({
        success: false,
        error: `Git publishing failed: ${result.error}. Local changes and backup (${backupId}) are safely preserved.`,
        data: {
          savedLocally: true,
          backupId,
          canRetry: true,
        },
      });
    }

    res.json({
      success: true,
      data: {
        savedLocally: true,
        pushed: true,
        commitHash: result.commitHash,
        branch: result.branch,
        backupId,
        message: 'Successfully pushed to GitHub. CI/CD pipeline triggered for deployment.',
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;

