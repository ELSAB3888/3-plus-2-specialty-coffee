/* ─── Database Row Types ─── */

export interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  description_en: string | null;
  description_ar: string | null;
  image_url: string | null;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  image_url: string | null;
  display_order: number;
  is_visible: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductSize {
  id: string;
  product_id: string;
  label_en: string;
  label_ar: string;
  price: number;
  display_order: number;
  is_available: boolean;
  created_at: string;
}

export interface Extra {
  id: string;
  name_en: string;
  name_ar: string;
  price: number;
  is_available: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductExtra {
  id: string;
  product_id: string;
  extra_id: string;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  key: string;
  value_en: string | null;
  value_ar: string | null;
  updated_at: string;
}

/* ─── Insert Types (for forms) ─── */

export type CategoryInsert = Omit<Category, 'id' | 'created_at' | 'updated_at'>;
export type CategoryUpdate = Partial<CategoryInsert>;

export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
export type ProductUpdate = Partial<ProductInsert>;

export type ProductSizeInsert = Omit<ProductSize, 'id' | 'created_at'>;
export type ProductSizeUpdate = Partial<ProductSizeInsert>;

export type ExtraInsert = Omit<Extra, 'id' | 'created_at' | 'updated_at'>;
export type ExtraUpdate = Partial<ExtraInsert>;

/* ─── Joined / Enriched Types ─── */

export interface ProductWithSizes extends Product {
  product_sizes: ProductSize[];
}

export interface ProductWithDetails extends ProductWithSizes {
  category: Category;
  product_extras: (ProductExtra & { extra: Extra })[];
}

export interface CategoryWithProducts extends Category {
  products: ProductWithSizes[];
}

/* ─── UI / App Types ─── */

export type Language = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

export interface AppContextValue {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
}

/* ─── Form Schemas (mirrored from Zod for reference) ─── */

export interface CategoryFormData {
  name_en: string;
  name_ar: string;
  slug: string;
  description_en: string;
  description_ar: string;
  display_order: number;
  is_visible: boolean;
}

export interface ProductFormData {
  category_id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  display_order: number;
  is_visible: boolean;
  is_featured: boolean;
  sizes: ProductSizeFormData[];
}

export interface ProductSizeFormData {
  label_en: string;
  label_ar: string;
  price: number;
  display_order: number;
  is_available: boolean;
}

export interface ExtraFormData {
  name_en: string;
  name_ar: string;
  price: number;
  is_available: boolean;
  display_order: number;
}

export interface LoginFormData {
  email: string;
  password: string;
}
