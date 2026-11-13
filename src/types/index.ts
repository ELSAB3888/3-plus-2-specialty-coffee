/* ─────────────────────────────────────────────────────────────────────────
 * 3+2 Specialty Coffee — Shared TypeScript Types
 * Source of truth: public/data/*.json (local files, no external database)
 * ───────────────────────────────────────────────────────────────────────── */

/* ─── Core Database Types (matches public/data/*.json) ─── */

export interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  description_en: string | null;
  description_ar: string | null;
  /** Local image path e.g. /images/products/cat-xxx.jpg, or null */
  image?: string | null;
  image_url?: string | null;
  image_url_original?: string | null;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductSize {
  id: string;
  label_en: string;
  label_ar: string;
  price: number;
  display_order: number;
  is_available: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  category_id: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  /** Local image path e.g. /images/products/storage-xxx.jpg, or null */
  image?: string | null;
  image_url?: string | null;
  image_url_original?: string | null;
  display_order: number;
  is_visible: boolean;
  is_featured: boolean;
  sizes: ProductSize[];
  product_sizes?: ProductSize[];
  /** IDs of extras that can be added to this product (optional relationship) */
  extra_ids?: string[];
  created_at: string;
  updated_at: string;
}

export type ProductWithSizes = Product;

export interface Extra {
  id: string;
  name_en: string;
  name_ar: string;
  price: number;
  is_available: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

/* ─── Joined / Enriched Types ─── */

export interface CategoryWithProducts extends Category {
  products: Product[];
}

/* ─── Insert / Update Types ─── */

export type CategoryInsert = Omit<Category, 'id' | 'created_at' | 'updated_at' | 'image_url_original'>;
export type CategoryUpdate = Partial<CategoryInsert>;

export type ProductSizeInsert = Omit<ProductSize, 'id' | 'created_at'>;
export type ProductSizeUpdate = Partial<ProductSizeInsert>;

export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'image_url_original'> & {
  sizes: ProductSizeInsert[];
};
export type ProductUpdate = Partial<Omit<ProductInsert, 'sizes'>> & {
  sizes?: ProductSizeInsert[];
};

export type ExtraInsert = Omit<Extra, 'id' | 'created_at' | 'updated_at'>;
export type ExtraUpdate = Partial<ExtraInsert>;

/* ─── UI / App Types ─── */

export type Language = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

export interface AppContextValue {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
}

export interface DashboardStats {
  totalCategories: number;
  totalProducts: number;
  totalExtras: number;
  visibleProducts: number;
}

/* ─── Admin API Types ─── */

export interface AdminApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface BackupInfo {
  id: string;
  label: string;
  timestamp: string;
  counts: {
    categories: number;
    products: number;
    extras: number;
  };
}

export interface GitStatus {
  hasChanges: boolean;
  modifiedFiles: string[];
  branch: string;
}

export interface GitResult {
  success: boolean;
  commitHash?: string;
  error?: string;
}

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  dataFiles: {
    categories: number;
    products: number;
    extras: number;
  };
}

export interface PublishingStatus {
  state: 'idle' | 'saving' | 'pushing' | 'success' | 'failed';
  message?: string;
  timestamp?: string;
  commitHash?: string;
}

/* ─── Form Types ─── */

export interface CategoryFormData {
  name_en: string;
  name_ar: string;
  slug: string;
  description_en: string;
  description_ar: string;
  display_order: number;
  is_visible: boolean;
}

export interface ProductSizeFormData {
  id?: string;
  label_en: string;
  label_ar: string;
  price: number;
  display_order: number;
  is_available: boolean;
}

export interface ProductFormData {
  category_id: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  display_order: number;
  is_visible: boolean;
  is_featured: boolean;
  image: string | null;
  sizes: ProductSizeFormData[];
  extra_ids: string[];
}

export interface ExtraFormData {
  name_en: string;
  name_ar: string;
  price: number;
  is_available: boolean;
  display_order: number;
}

/* ─── Auth Types ─── */

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  token?: string | null;
}
