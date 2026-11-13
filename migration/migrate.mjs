/**
 * 3+2 Specialty Coffee — One-Time Supabase → Local JSON Migration Script
 *
 * This script:
 *  1. Connects to the existing Supabase project (READ-ONLY via anon key)
 *  2. Inspects schema and record counts
 *  3. Extracts categories, products, product_sizes, extras
 *  4. Downloads product images from Supabase Storage bucket "menu-images"
 *  5. Saves raw backup of all extracted data
 *  6. Transforms into new JSON format (categories.json / products.json / extras.json)
 *  7. Validates record counts against known reference (4 cats / 10 products / 5 extras)
 *  8. Reports any missing, duplicate, or incompatible records
 *
 * READ-ONLY — does NOT modify, pause, delete, or reset the Supabase project.
 */

import { createClient } from '../node_modules/@supabase/supabase-js/dist/index.cjs';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Configuration ────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://saxnhzpfwdhkpkmffbiy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_J8M-2XnS6PqGisja_umXLA_FvsJIFJs';
const STORAGE_BUCKET = 'menu-images';

// Expected counts (from diagnostic report)
const EXPECTED = { categories: 4, products: 10, extras: 5 };

// Output directories
const MIGRATION_DIR = __dirname;
const BACKUP_DIR = join(MIGRATION_DIR, 'backup');
const OUTPUT_DATA_DIR = join(__dirname, '..', 'data');
const OUTPUT_IMAGES_DIR = join(__dirname, '..', 'public', 'images', 'products');

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    console.log(`  ✅ Created directory: ${dir}`);
  }
}

function saveJSON(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`  💾 Saved: ${filePath} (${Array.isArray(data) ? data.length + ' records' : 'object'})`);
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    const request = proto.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlinkSync(destPath);
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        if (existsSync(destPath)) fs.unlinkSync(destPath);
        return reject(new Error(`HTTP ${response.statusCode} for ${url}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(destPath);
      });
    });
    request.on('error', (err) => {
      if (existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
    file.on('error', (err) => {
      if (existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

function getImageExtension(url) {
  if (!url) return '.jpg';
  const urlWithoutQuery = url.split('?')[0];
  const ext = urlWithoutQuery.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(ext)) return '.' + ext;
  return '.jpg';
}

// ─── Main Migration ───────────────────────────────────────────────────────────
async function runMigration() {
  console.log('\n' + '═'.repeat(70));
  console.log('  3+2 Specialty Coffee — Supabase → Local JSON Migration');
  console.log('  READ-ONLY extraction — Supabase project will NOT be modified');
  console.log('═'.repeat(70) + '\n');

  // ── Step 0: Setup directories ──────────────────────────────────────────────
  console.log('📁 STEP 0: Creating output directories...');
  ensureDir(BACKUP_DIR);
  ensureDir(OUTPUT_DATA_DIR);
  ensureDir(OUTPUT_IMAGES_DIR);

  // ── Step 1: Connect to Supabase ────────────────────────────────────────────
  console.log('\n🔌 STEP 1: Connecting to Supabase...');
  console.log(`  URL: ${SUPABASE_URL}`);
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // ── Step 2: Schema inspection (count records per table) ───────────────────
  console.log('\n🔍 STEP 2: Inspecting database schema and record counts...');
  
  const tables = ['categories', 'products', 'product_sizes', 'extras', 'product_extras', 'site_settings'];
  const counts = {};
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`  ⚠️  Table "${table}": ${error.message}`);
      counts[table] = null;
    } else {
      console.log(`  📊 Table "${table}": ${count} records`);
      counts[table] = count;
    }
  }

  // Validate against expected counts
  console.log('\n  📋 Count Validation:');
  const validation = {
    categories: { expected: EXPECTED.categories, actual: counts.categories },
    products:   { expected: EXPECTED.products,   actual: counts.products },
    extras:     { expected: EXPECTED.extras,      actual: counts.extras },
  };
  
  let hasCountMismatch = false;
  for (const [table, v] of Object.entries(validation)) {
    const match = v.actual === v.expected ? '✅' : '⚠️ MISMATCH';
    console.log(`    ${match} ${table}: expected ${v.expected}, actual ${v.actual}`);
    if (v.actual !== v.expected) hasCountMismatch = true;
  }

  if (hasCountMismatch) {
    console.log('\n  ⚠️  Count mismatches detected. Migration will proceed but validate carefully.');
  }

  // ── Step 3: Extract raw data ──────────────────────────────────────────────
  console.log('\n📥 STEP 3: Extracting all data from Supabase...');

  // Categories (all, including hidden)
  const { data: rawCategories, error: catErr } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });
  
  if (catErr) throw new Error(`Failed to fetch categories: ${catErr.message}`);
  console.log(`  ✅ Categories extracted: ${rawCategories.length}`);

  // Products (all, including hidden)
  const { data: rawProducts, error: prodErr } = await supabase
    .from('products')
    .select('*')
    .order('display_order', { ascending: true });
  
  if (prodErr) throw new Error(`Failed to fetch products: ${prodErr.message}`);
  console.log(`  ✅ Products extracted: ${rawProducts.length}`);

  // Product sizes (all)
  const { data: rawSizes, error: sizesErr } = await supabase
    .from('product_sizes')
    .select('*')
    .order('product_id')
    .order('display_order', { ascending: true });
  
  if (sizesErr) throw new Error(`Failed to fetch product_sizes: ${sizesErr.message}`);
  console.log(`  ✅ Product sizes extracted: ${rawSizes.length}`);

  // Extras (all)
  const { data: rawExtras, error: extErr } = await supabase
    .from('extras')
    .select('*')
    .order('display_order', { ascending: true });
  
  if (extErr) throw new Error(`Failed to fetch extras: ${extErr.message}`);
  console.log(`  ✅ Extras extracted: ${rawExtras.length}`);

  // Product-Extras junction (if any)
  const { data: rawProductExtras, error: peErr } = await supabase
    .from('product_extras')
    .select('*');
  
  if (peErr) {
    console.log(`  ⚠️  product_extras: ${peErr.message} (may not exist or may be empty)`);
  } else {
    console.log(`  ✅ Product-extras relationships: ${rawProductExtras?.length ?? 0}`);
  }

  // Site Settings
  const { data: rawSettings, error: settErr } = await supabase
    .from('site_settings')
    .select('*');
  
  if (settErr) {
    console.log(`  ⚠️  site_settings: ${settErr.message}`);
  } else {
    console.log(`  ✅ Site settings extracted: ${rawSettings?.length ?? 0}`);
  }

  // ── Step 4: Save raw backup ───────────────────────────────────────────────
  console.log('\n💾 STEP 4: Saving raw backup of extracted data...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupData = {
    exported_at: new Date().toISOString(),
    supabase_url: SUPABASE_URL,
    record_counts: counts,
    categories: rawCategories,
    products: rawProducts,
    product_sizes: rawSizes,
    extras: rawExtras,
    product_extras: rawProductExtras ?? [],
    site_settings: rawSettings ?? [],
  };
  
  saveJSON(join(BACKUP_DIR, `raw-backup-${timestamp}.json`), backupData);
  saveJSON(join(BACKUP_DIR, 'raw-backup-latest.json'), backupData);

  // ── Step 5: Inspect Supabase Storage ─────────────────────────────────────
  console.log('\n🖼️  STEP 5: Inspecting Supabase Storage (menu-images bucket)...');
  
  const { data: storageFiles, error: storageErr } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list('', { limit: 200, sortBy: { column: 'name', order: 'asc' } });
  
  let storageFileList = [];
  if (storageErr) {
    console.log(`  ⚠️  Storage bucket "${STORAGE_BUCKET}": ${storageErr.message}`);
    console.log('  ℹ️  Images may not exist in Storage, or bucket may be private.');
  } else {
    storageFileList = storageFiles ?? [];
    console.log(`  ✅ Storage files found: ${storageFileList.length}`);
    if (storageFileList.length > 0) {
      storageFileList.forEach(f => console.log(`     📄 ${f.name} (${f.metadata?.size ?? 'unknown size'})`));
    }
  }

  // Also list subdirectories in storage
  const { data: storageFolders } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list('products', { limit: 200 });
  
  let productStorageFiles = [];
  if (storageFolders && storageFolders.length > 0) {
    productStorageFiles = storageFolders;
    console.log(`  📁 Files in products/ subfolder: ${productStorageFiles.length}`);
    productStorageFiles.forEach(f => console.log(`     📄 products/${f.name}`));
  }

  // ── Step 6: Download images ───────────────────────────────────────────────
  console.log('\n⬇️  STEP 6: Downloading product images...');

  const imageMap = {}; // maps original URL → local path
  const imageResults = [];

  // Helper: download image from URL and save locally
  async function downloadAndMapImage(originalUrl, localFileName) {
    if (!originalUrl || originalUrl.includes('placeholder')) {
      return null;
    }

    const ext = getImageExtension(originalUrl);
    const safeFileName = localFileName + ext;
    const localPath = join(OUTPUT_IMAGES_DIR, safeFileName);
    const publicPath = `/images/products/${safeFileName}`;

    try {
      await downloadFile(originalUrl, localPath);
      imageMap[originalUrl] = publicPath;
      imageResults.push({ status: 'ok', url: originalUrl, local: publicPath });
      console.log(`  ✅ Downloaded: ${safeFileName}`);
      return publicPath;
    } catch (err) {
      console.log(`  ❌ Failed to download: ${originalUrl} — ${err.message}`);
      imageResults.push({ status: 'error', url: originalUrl, error: err.message });
      return originalUrl; // keep original URL as fallback
    }
  }

  // Download category images
  for (const cat of rawCategories) {
    if (cat.image_url) {
      const localName = `cat-${slugify(cat.name_en)}`;
      await downloadAndMapImage(cat.image_url, localName);
    }
  }

  // Download product images
  for (const prod of rawProducts) {
    if (prod.image_url) {
      const localName = `prod-${slugify(prod.name_en)}`;
      await downloadAndMapImage(prod.image_url, localName);
    }
  }

  // Also download any files found in Supabase Storage
  const allStorageFiles = [...storageFileList, ...productStorageFiles.map(f => ({ ...f, name: `products/${f.name}` }))];
  for (const file of allStorageFiles) {
    if (!file.name.endsWith('/')) { // skip folders
      const { data: publicUrlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(file.name);
      
      if (publicUrlData?.publicUrl) {
        const baseName = file.name.replace(/^products\//, '').split('.')[0];
        await downloadAndMapImage(publicUrlData.publicUrl, `storage-${baseName}`);
      }
    }
  }

  console.log(`\n  📊 Image download summary: ${imageResults.filter(r => r.status === 'ok').length} ok, ${imageResults.filter(r => r.status === 'error').length} failed`);

  // ── Step 7: Transform to new JSON format ──────────────────────────────────
  console.log('\n🔄 STEP 7: Transforming data to new JSON format...');

  // Build size map grouped by product_id
  const sizesByProductId = {};
  for (const size of rawSizes) {
    if (!sizesByProductId[size.product_id]) sizesByProductId[size.product_id] = [];
    sizesByProductId[size.product_id].push(size);
  }

  // Build product_extras map grouped by product_id
  const extrasByProductId = {};
  for (const pe of (rawProductExtras ?? [])) {
    if (!extrasByProductId[pe.product_id]) extrasByProductId[pe.product_id] = [];
    extrasByProductId[pe.product_id].push(pe.extra_id);
  }

  // Transform categories
  const newCategories = rawCategories.map(cat => ({
    id: cat.id,
    name_en: cat.name_en,
    name_ar: cat.name_ar,
    slug: cat.slug,
    description_en: cat.description_en ?? null,
    description_ar: cat.description_ar ?? null,
    image: imageMap[cat.image_url] ?? cat.image_url ?? null,
    image_url_original: cat.image_url ?? null,
    display_order: cat.display_order,
    is_visible: cat.is_visible,
    created_at: cat.created_at,
    updated_at: cat.updated_at,
  }));

  // Transform products (with nested sizes)
  const newProducts = rawProducts.map(prod => {
    const sizes = (sizesByProductId[prod.id] ?? [])
      .sort((a, b) => a.display_order - b.display_order)
      .map(s => ({
        id: s.id,
        label_en: s.label_en,
        label_ar: s.label_ar,
        price: parseFloat(s.price),
        display_order: s.display_order,
        is_available: s.is_available,
        created_at: s.created_at,
      }));

    return {
      id: prod.id,
      category_id: prod.category_id,
      name_en: prod.name_en,
      name_ar: prod.name_ar,
      description_en: prod.description_en ?? null,
      description_ar: prod.description_ar ?? null,
      image: imageMap[prod.image_url] ?? prod.image_url ?? null,
      image_url_original: prod.image_url ?? null,
      display_order: prod.display_order,
      is_visible: prod.is_visible,
      is_featured: prod.is_featured,
      sizes,
      extra_ids: extrasByProductId[prod.id] ?? [],
      created_at: prod.created_at,
      updated_at: prod.updated_at,
    };
  });

  // Transform extras
  const newExtras = rawExtras.map(ex => ({
    id: ex.id,
    name_en: ex.name_en,
    name_ar: ex.name_ar,
    price: parseFloat(ex.price),
    is_available: ex.is_available,
    display_order: ex.display_order,
    created_at: ex.created_at,
    updated_at: ex.updated_at,
  }));

  // ── Step 8: Save transformed JSON files ───────────────────────────────────
  console.log('\n💾 STEP 8: Saving transformed JSON files to /data directory...');
  
  saveJSON(join(OUTPUT_DATA_DIR, 'categories.json'), newCategories);
  saveJSON(join(OUTPUT_DATA_DIR, 'products.json'), newProducts);
  saveJSON(join(OUTPUT_DATA_DIR, 'extras.json'), newExtras);

  // Save site settings too
  if (rawSettings && rawSettings.length > 0) {
    const settingsObj = {};
    for (const s of rawSettings) {
      settingsObj[s.key] = { en: s.value_en, ar: s.value_ar };
    }
    saveJSON(join(OUTPUT_DATA_DIR, 'site_settings.json'), settingsObj);
  }

  // Save image map for reference
  saveJSON(join(BACKUP_DIR, 'image-map.json'), imageMap);
  saveJSON(join(BACKUP_DIR, 'image-results.json'), imageResults);

  // ── Step 9: Validation ────────────────────────────────────────────────────
  console.log('\n✅ STEP 9: Validating migrated data...');

  const validationReport = {
    timestamp: new Date().toISOString(),
    counts: {
      categories:    { expected: EXPECTED.categories,  migrated: newCategories.length, match: newCategories.length === EXPECTED.categories },
      products:      { expected: EXPECTED.products,    migrated: newProducts.length,   match: newProducts.length === EXPECTED.products },
      extras:        { expected: EXPECTED.extras,      migrated: newExtras.length,     match: newExtras.length === EXPECTED.extras },
      product_sizes: { expected: 'n/a',                migrated: rawSizes.length,      match: true },
    },
    products_without_sizes: newProducts.filter(p => p.sizes.length === 0).map(p => ({ id: p.id, name_en: p.name_en })),
    products_without_category: newProducts.filter(p => !rawCategories.find(c => c.id === p.category_id)).map(p => ({ id: p.id, name_en: p.name_en, category_id: p.category_id })),
    duplicate_product_ids: (() => {
      const ids = newProducts.map(p => p.id);
      return ids.filter((id, i) => ids.indexOf(id) !== i);
    })(),
    duplicate_category_ids: (() => {
      const ids = newCategories.map(c => c.id);
      return ids.filter((id, i) => ids.indexOf(id) !== i);
    })(),
    products_with_local_images:   newProducts.filter(p => p.image && p.image.startsWith('/images')).length,
    products_with_external_images: newProducts.filter(p => p.image && p.image.startsWith('http')).length,
    products_without_images:       newProducts.filter(p => !p.image).length,
    categories_with_local_images:  newCategories.filter(c => c.image && c.image.startsWith('/images')).length,
    image_download_ok:    imageResults.filter(r => r.status === 'ok').length,
    image_download_failed: imageResults.filter(r => r.status === 'error').length,
    all_counts_match: newCategories.length === EXPECTED.categories && newProducts.length === EXPECTED.products && newExtras.length === EXPECTED.extras,
  };

  // Print validation report
  console.log('\n  ┌─ VALIDATION REPORT ───────────────────────────────────────────┐');
  for (const [table, v] of Object.entries(validationReport.counts)) {
    const icon = v.match ? '✅' : '❌';
    console.log(`  │ ${icon} ${table}: expected ${v.expected}, migrated ${v.migrated}`);
  }
  console.log('  ├───────────────────────────────────────────────────────────────┤');
  console.log(`  │ Products without sizes:    ${validationReport.products_without_sizes.length}`);
  console.log(`  │ Products missing category: ${validationReport.products_without_category.length}`);
  console.log(`  │ Duplicate product IDs:     ${validationReport.duplicate_product_ids.length}`);
  console.log(`  │ Duplicate category IDs:    ${validationReport.duplicate_category_ids.length}`);
  console.log('  ├───────────────────────────────────────────────────────────────┤');
  console.log(`  │ Images → local path:       ${validationReport.products_with_local_images}`);
  console.log(`  │ Images → external URL:     ${validationReport.products_with_external_images}`);
  console.log(`  │ Images → none:             ${validationReport.products_without_images}`);
  console.log(`  │ Image downloads OK:        ${validationReport.image_download_ok}`);
  console.log(`  │ Image downloads FAILED:    ${validationReport.image_download_failed}`);
  console.log('  ├───────────────────────────────────────────────────────────────┤');

  if (validationReport.products_without_sizes.length > 0) {
    console.log(`  │ ⚠️  Products without sizes:`);
    validationReport.products_without_sizes.forEach(p => console.log(`  │     - ${p.name_en} (${p.id})`));
  }
  if (validationReport.products_without_category.length > 0) {
    console.log(`  │ ❌ Products with missing category:`);
    validationReport.products_without_category.forEach(p => console.log(`  │     - ${p.name_en} → category_id: ${p.category_id}`));
  }
  if (validationReport.duplicate_product_ids.length > 0) {
    console.log(`  │ ❌ Duplicate product IDs: ${validationReport.duplicate_product_ids.join(', ')}`);
  }

  const overallStatus = validationReport.all_counts_match ? '✅ MIGRATION SUCCESSFUL' : '⚠️  MIGRATION COMPLETED WITH WARNINGS';
  console.log(`  │`);
  console.log(`  │ Overall: ${overallStatus}`);
  console.log('  └───────────────────────────────────────────────────────────────┘');

  // Save validation report
  saveJSON(join(BACKUP_DIR, 'validation-report.json'), validationReport);

  // ── Step 10: Print final summary ──────────────────────────────────────────
  console.log('\n' + '═'.repeat(70));
  console.log('  MIGRATION COMPLETE — OUTPUT FILES:');
  console.log('═'.repeat(70));
  console.log(`  📄 data/categories.json    — ${newCategories.length} categories`);
  console.log(`  📄 data/products.json      — ${newProducts.length} products (with nested sizes)`);
  console.log(`  📄 data/extras.json        — ${newExtras.length} extras`);
  console.log(`  📄 data/site_settings.json — site configuration`);
  console.log(`  🖼️  public/images/products/ — downloaded images`);
  console.log(`  📦 migration/backup/       — raw backup + validation report`);
  console.log('═'.repeat(70));
  console.log('  ⚠️  The Supabase project has NOT been modified.');
  console.log('  ⚠️  All data was extracted READ-ONLY.');
  console.log('═'.repeat(70) + '\n');

  return validationReport;
}

runMigration().catch(err => {
  console.error('\n❌ MIGRATION FAILED:', err.message);
  console.error(err.stack);
  process.exit(1);
});

