/**
 * dataService.ts — Fetches data from static JSON files in /public/data/
 * No Supabase, no localStorage. Pure static JSON serving.
 */
import type { Category, Product, Extra, CategoryWithProducts } from '@/types';

// ─── Base path (Vite injects this at build time) ─────────────────────────────
const BASE = import.meta.env.BASE_URL; // e.g. '/' locally, '/repo-name/' on GH Pages

// ─── Simple in-memory cache ───────────────────────────────────────────────────

let _categories: Category[] | null = null;
let _products: Product[] | null = null;
let _extras: Extra[] | null = null;

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  if (_categories) return _categories;
  _categories = await fetchJSON<Category[]>(`${BASE}data/categories.json`);
  return _categories;
}

export async function getProducts(): Promise<Product[]> {
  if (_products) return _products;
  _products = await fetchJSON<Product[]>(`${BASE}data/products.json`);
  return _products;
}

export async function getExtras(): Promise<Extra[]> {
  if (_extras) return _extras;
  _extras = await fetchJSON<Extra[]>(`${BASE}data/extras.json`);
  return _extras;
}

/**
 * Returns categories (visible only) with their visible products sorted by
 * display_order. Sizes within each product are also sorted by display_order.
 * Categories with zero visible products are excluded.
 */
export async function getMenuData(): Promise<CategoryWithProducts[]> {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  const visibleCategories = categories
    .filter((c) => c.is_visible)
    .sort((a, b) => a.display_order - b.display_order);

  const visibleProducts = products
    .filter((p) => p.is_visible)
    .map((p) => ({
      ...p,
      sizes: [...p.sizes].sort((a, b) => a.display_order - b.display_order),
    }));

  return visibleCategories
    .map((cat) => ({
      ...cat,
      products: visibleProducts
        .filter((p) => p.category_id === cat.id)
        .sort((a, b) => a.display_order - b.display_order),
    }))
    .filter((cat) => cat.products.length > 0);
}
