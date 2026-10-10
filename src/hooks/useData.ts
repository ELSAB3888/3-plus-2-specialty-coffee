import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  Category,
  Product,
  ProductWithSizes,
  CategoryWithProducts,
  Extra,
  ProductSize,
} from '@/types';

/* ─── Categories ─── */

export function useCategories(visibleOnly = false) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (visibleOnly) {
        query = query.eq('is_visible', true);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setCategories(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [visibleOnly]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
}

/* ─── Products ─── */

export function useProducts(categoryId?: string, visibleOnly = false) {
  const [products, setProducts] = useState<ProductWithSizes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          product_sizes (*)
        `)
        .order('display_order', { ascending: true });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (visibleOnly) {
        query = query.eq('is_visible', true);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      // Sort sizes within each product
      const productsWithSortedSizes = (data ?? []).map((product: ProductWithSizes) => ({
        ...product,
        product_sizes: [...(product.product_sizes || [])].sort(
          (a: ProductSize, b: ProductSize) => (a.display_order ?? 0) - (b.display_order ?? 0)
        ),
      })) as ProductWithSizes[];

      setProducts(productsWithSortedSizes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [categoryId, visibleOnly]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}

/* ─── Menu Data (categories with products, public) ─── */

export function useMenuData() {
  const [menuData, setMenuData] = useState<CategoryWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select(`
          *,
          products (
            *,
            product_sizes (*)
          )
        `)
        .eq('is_visible', true)
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      const sorted = (data ?? []).map((cat: any) => ({
        ...cat,
        products: [...(cat.products || [])]
          .filter((p: Product) => p.is_visible)
          .sort((a: Product, b: Product) => a.display_order - b.display_order)
          .map((p: any) => ({
            ...p,
            product_sizes: [...(p.product_sizes || [])].sort(
              (a: ProductSize, b: ProductSize) => a.display_order - b.display_order
            ),
          })),
      })) as CategoryWithProducts[];

      setMenuData(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch menu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMenu();
  }, [fetchMenu]);

  return { menuData, loading, error, refetch: fetchMenu };
}

/* ─── Extras ─── */

export function useExtras(availableOnly = false) {
  const [extras, setExtras] = useState<Extra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExtras = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('extras')
        .select('*')
        .order('display_order', { ascending: true });

      if (availableOnly) {
        query = query.eq('is_available', true);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setExtras(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch extras');
    } finally {
      setLoading(false);
    }
  }, [availableOnly]);

  useEffect(() => {
    void fetchExtras();
  }, [fetchExtras]);

  return { extras, loading, error, refetch: fetchExtras };
}

/* ─── Featured Products ─── */

export function useFeaturedProducts() {
  const [products, setProducts] = useState<ProductWithSizes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('products')
        .select(`*, product_sizes (*)`)
        .eq('is_visible', true)
        .eq('is_featured', true)
        .order('display_order', { ascending: true })
        .limit(6);

      const sorted = (data ?? []).map((p: any) => ({
        ...p,
        product_sizes: [...(p.product_sizes || [])].sort(
          (a: ProductSize, b: ProductSize) => a.display_order - b.display_order
        ),
      })) as ProductWithSizes[];

      setProducts(sorted);
      setLoading(false);
    };
    void fetch();
  }, []);

  return { products, loading };
}

/* ─── Dashboard Stats ─── */

export interface DashboardStats {
  totalCategories: number;
  totalProducts: number;
  totalExtras: number;
  visibleProducts: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCategories: 0,
    totalProducts: 0,
    totalExtras: 0,
    visibleProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    const [cats, prods, extras, visibleProds] = await Promise.all([
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('extras').select('id', { count: 'exact', head: true }),
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('is_visible', true),
    ]);

    setStats({
      totalCategories: cats.count ?? 0,
      totalProducts: prods.count ?? 0,
      totalExtras: extras.count ?? 0,
      visibleProducts: visibleProds.count ?? 0,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}
