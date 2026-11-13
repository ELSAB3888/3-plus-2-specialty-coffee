/**
 * backupService.js — Create, list, restore, and prune backups.
 * Backups are stored as timestamped folders under ../backups/ (project root).
 * Enforces:
 *  - 10-backup max retention (pruned only AFTER verification)
 *  - Safety backup before restore
 *  - No automatic publishing on restore
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCategories, getProducts, getExtras, saveCategories, saveProducts, saveExtras } from './dataService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const BACKUP_DIR = path.resolve(PROJECT_ROOT, 'backups');
const MAX_BACKUPS = 10;

/** Ensure the backup directory exists. */
async function ensureBackupDir() {
  await fs.mkdir(BACKUP_DIR, { recursive: true });
}

/**
 * Create a backup of categories, products, and extras.
 * If backup fails, caller MUST abort the modification.
 * @param {string} [label]  Human-readable label
 * @returns {Promise<string>}  backupId (folder name)
 */
export async function createBackup(label = '') {
  await ensureBackupDir();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupId = `backup-${timestamp}`;
  const backupPath = path.join(BACKUP_DIR, backupId);

  await fs.mkdir(backupPath, { recursive: true });

  const [categories, products, extras] = await Promise.all([
    getCategories(),
    getProducts(),
    getExtras(),
  ]);

  // Collect image filenames referenced by products and categories
  const imageFilenames = [];
  for (const product of products) {
    if (product.image) imageFilenames.push(product.image);
    if (product.image_url) imageFilenames.push(product.image_url);
  }
  for (const cat of categories) {
    if (cat.image) imageFilenames.push(cat.image);
    if (cat.image_url) imageFilenames.push(cat.image_url);
  }

  const backupData = {
    timestamp: new Date().toISOString(),
    label: label || 'auto',
    counts: {
      categories: categories.length,
      products: products.length,
      extras: extras.length,
    },
    categories,
    products,
    extras,
    imageFilenames: [...new Set(imageFilenames)],
  };

  const backupFile = path.join(backupPath, 'backup.json');
  const tmpFile = backupFile + '.tmp';
  await fs.writeFile(tmpFile, JSON.stringify(backupData, null, 2), 'utf-8');
  await fs.rename(tmpFile, backupFile);

  console.log(`[${new Date().toISOString()}] createBackup: created ${backupId} (label: ${label || 'auto'})`);
  return backupId;
}

/**
 * List all backups sorted newest first.
 * @returns {Promise<Array<{id: string, timestamp: string, label: string, counts: object}>>}
 */
export async function listBackups() {
  await ensureBackupDir();

  const entries = await fs.readdir(BACKUP_DIR, { withFileTypes: true });
  const backupFolders = entries
    .filter((e) => e.isDirectory() && e.name.startsWith('backup-'))
    .map((e) => e.name);

  const backups = [];
  for (const folder of backupFolders) {
    try {
      const backupFile = path.join(BACKUP_DIR, folder, 'backup.json');
      const raw = await fs.readFile(backupFile, 'utf-8');
      const data = JSON.parse(raw);
      backups.push({
        id: folder,
        timestamp: data.timestamp,
        label: data.label || '',
        counts: data.counts || {
          categories: (data.categories || []).length,
          products: (data.products || []).length,
          extras: (data.extras || []).length,
        },
      });
    } catch {
      console.warn(`[${new Date().toISOString()}] listBackups: skipping corrupt backup ${folder}`);
    }
  }

  // Sort newest first
  backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return backups;
}

/**
 * Restore all data from a backup.
 * Creates a safety backup first.
 * DOES NOT PUBLISH TO GIT/DEPLOYMENT AUTOMATICALLY.
 * @param {string} backupId
 * @returns {Promise<{categories: Array, products: Array, extras: Array, restoredFrom: string, safetyBackupId: string}>}
 */
export async function restoreBackup(backupId) {
  const backupPath = path.join(BACKUP_DIR, backupId);
  const backupFile = path.join(backupPath, 'backup.json');

  try {
    await fs.access(backupFile);
  } catch {
    throw new Error(`Backup not found: ${backupId}`);
  }

  // Mandatory safety backup before restoring
  const safetyId = await createBackup(`safety-before-restore-${backupId}`);
  console.log(`[${new Date().toISOString()}] restoreBackup: safety backup created: ${safetyId}`);

  const raw = await fs.readFile(backupFile, 'utf-8');
  const backupData = JSON.parse(raw);

  await saveCategories(backupData.categories);
  await saveProducts(backupData.products);
  await saveExtras(backupData.extras);

  console.log(`[${new Date().toISOString()}] restoreBackup: restored from ${backupId}. NOT published automatically.`);

  return {
    categories: backupData.categories,
    products: backupData.products,
    extras: backupData.extras,
    restoredFrom: backupId,
    safetyBackupId: safetyId,
    published: false,
    message: 'Data restored locally. Review and explicitly confirm publication to push live.',
  };
}

/**
 * Restore a single product from a backup without touching other products.
 * Creates a safety backup first.
 * DOES NOT PUBLISH AUTOMATICALLY.
 * @param {string} backupId
 * @param {string} productId
 * @returns {Promise<{product: object, safetyBackupId: string}>}
 */
export async function restoreProduct(backupId, productId) {
  const backupPath = path.join(BACKUP_DIR, backupId);
  const backupFile = path.join(backupPath, 'backup.json');

  try {
    await fs.access(backupFile);
  } catch {
    throw new Error(`Backup not found: ${backupId}`);
  }

  const raw = await fs.readFile(backupFile, 'utf-8');
  const backupData = JSON.parse(raw);

  const archivedProduct = (backupData.products || []).find((p) => p.id === productId);
  if (!archivedProduct) {
    throw new Error(`Product ${productId} not found in backup ${backupId}`);
  }

  // Safety backup before modifying
  const safetyId = await createBackup(`safety-before-product-restore-${productId}`);
  console.log(`[${new Date().toISOString()}] restoreProduct: safety backup created: ${safetyId}`);

  const currentProducts = await getProducts();
  const idx = currentProducts.findIndex((p) => p.id === productId);

  if (idx !== -1) {
    currentProducts[idx] = archivedProduct;
  } else {
    currentProducts.push(archivedProduct);
  }

  await saveProducts(currentProducts);
  console.log(`[${new Date().toISOString()}] restoreProduct: restored product ${productId} from ${backupId}`);

  return {
    product: archivedProduct,
    safetyBackupId: safetyId,
    published: false,
  };
}

/**
 * Delete old backups keeping only the latest MAX_BACKUPS.
 * Called ONLY AFTER an operation and backup have been verified.
 */
export async function pruneOldBackups() {
  await ensureBackupDir();

  const entries = await fs.readdir(BACKUP_DIR, { withFileTypes: true });
  const backupFolders = entries
    .filter((e) => e.isDirectory() && e.name.startsWith('backup-'))
    .map((e) => e.name)
    .sort()
    .reverse();

  if (backupFolders.length <= MAX_BACKUPS) return;

  const toDelete = backupFolders.slice(MAX_BACKUPS);
  for (const folder of toDelete) {
    const folderPath = path.join(BACKUP_DIR, folder);
    await fs.rm(folderPath, { recursive: true, force: true });
    console.log(`[${new Date().toISOString()}] pruneOldBackups: pruned old backup ${folder}`);
  }
}
