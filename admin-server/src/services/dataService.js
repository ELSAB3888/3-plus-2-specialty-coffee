/**
 * dataService.js — Read/write JSON data files atomically
 * Writes to public/data/ (runtime for static site) AND mirrors to data/
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root is three levels up from src/services/
const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const PUBLIC_DATA_DIR = path.resolve(PROJECT_ROOT, 'public', 'data');
const ROOT_DATA_DIR = path.resolve(PROJECT_ROOT, 'data');

/**
 * Read and parse a JSON file from public/data/.
 * @param {string} filename  e.g. 'products.json'
 * @returns {Promise<any>}
 */
export async function readJSON(filename) {
  const filePath = path.join(PUBLIC_DATA_DIR, filename);
  const raw = await fs.readFile(filePath, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON in ${filename}: ${err.message}`);
  }
}

/**
 * Write data to a JSON file atomically (write .tmp then rename).
 * Updates both public/data/ and mirrors to data/.
 * @param {string} filename  e.g. 'products.json'
 * @param {any} data
 */
export async function writeJSON(filename, data) {
  const json = JSON.stringify(data, null, 2);

  // Validate JSON serialization before writing
  try {
    JSON.parse(json);
  } catch (err) {
    throw new Error(`Data failed JSON validation before write: ${err.message}`);
  }

  // 1. Write to public/data/ atomically
  const publicPath = path.join(PUBLIC_DATA_DIR, filename);
  const publicTmp = publicPath + '.tmp';
  await fs.writeFile(publicTmp, json, 'utf-8');
  await fs.rename(publicTmp, publicPath);

  // 2. Mirror to data/ atomically if directory exists
  try {
    const rootPath = path.join(ROOT_DATA_DIR, filename);
    const rootTmp = rootPath + '.tmp';
    await fs.writeFile(rootTmp, json, 'utf-8');
    await fs.rename(rootTmp, rootPath);
  } catch (err) {
    console.warn(`[${new Date().toISOString()}] Warning: mirroring to data/${filename} skipped:`, err.message);
  }

  console.log(`[${new Date().toISOString()}] writeJSON: atomically saved ${filename}`);
}

// ── Typed helpers ─────────────────────────────────────────────────────────────

export async function getCategories() {
  return readJSON('categories.json');
}

export async function saveCategories(data) {
  return writeJSON('categories.json', data);
}

export async function getProducts() {
  return readJSON('products.json');
}

export async function saveProducts(data) {
  return writeJSON('products.json', data);
}

export async function getExtras() {
  return readJSON('extras.json');
}

export async function saveExtras(data) {
  return writeJSON('extras.json', data);
}

/**
 * Validate referential integrity across the three data files.
 * @param {Array} categories
 * @param {Array} products
 * @param {Array} extras
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateDataIntegrity(categories, products, extras) {
  const errors = [];
  const categoryIds = new Set((categories || []).map((c) => c.id));

  for (const product of products || []) {
    if (product.category_id && !categoryIds.has(product.category_id)) {
      errors.push(
        `Product "${product.name_en || product.name_ar}" (id: ${product.id}) references missing category_id: ${product.category_id}`
      );
    }
    const sizes = product.sizes || product.product_sizes || [];
    if (!Array.isArray(sizes) || sizes.length === 0) {
      errors.push(`Product "${product.name_en || product.name_ar}" (id: ${product.id}) has no sizes`);
    }
  }

  for (const extra of extras || []) {
    if (!extra.id || (!extra.name_en && !extra.name_ar)) {
      errors.push(`Extra with id "${extra.id}" is missing required fields`);
    }
  }

  return { valid: errors.length === 0, errors };
}
