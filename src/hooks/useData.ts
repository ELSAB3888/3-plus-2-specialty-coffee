import { useState, useEffect, useCallback } from 'react';
import {
  getCategories,
  getProducts,
  getExtras,
  getMenuData,
} from '@/lib/dataService';
import type {
  Category,
  Product,
  CategoryWithProducts,
  Extra,
  DashboardStats,
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
      let data = await getCategories();
      data = [...data].sort((a, b) => a.display_order - b.display_order);
      if (visibleOnly) data = data.filter((c) => c.is_visible);
      setCategories(data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to fetch categories');
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data = await getProducts();
      if (categoryId) data = data.filter((p) => p.category_id === categoryId);
      if (visibleOnly) data = data.filter((p) => p.is_visible);
      data = [...data]
        .sort((a, b) => a.display_order - b.display_order)
        .map((p) => ({
          ...p,
          sizes: [...p.sizes].sort((a, b) => a.display_order - b.display_order),
        }));
      setProducts(data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [categoryId, visibleOnly]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}

/* ─── Menu Data (categories with products, customer view) ─── */

export function useMenuData() {
  const [menuData, setMenuData] = useState<CategoryWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMenuData();
      setMenuData(data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to fetch menu');
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
      let data = await getExtras();
      if (availableOnly) data = data.filter((e) => e.is_available);
      data = [...data].sort((a, b) => a.display_order - b.display_order);
      setExtras(data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to fetch extras');
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getProducts();
        const featured = data
          .filter((p) => p.is_visible && p.is_featured)
          .sort((a, b) => a.display_order - b.display_order)
          .slice(0, 6)
          .map((p) => ({
            ...p,
            sizes: [...p.sizes].sort((a, b) => a.display_order - b.display_order),
          }));
        setProducts(featured);
      } catch {
        // silently fail for featured products on home page
      } finally {
        setLoading(false);
      }
    };
    void fetch();
  }, []);

  return { products, loading };
}

/* ─── Dashboard Stats ─── */

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
    try {
      const [cats, prods, exts] = await Promise.all([
        getCategories(),
        getProducts(),
        getExtras(),
      ]);
      setStats({
        totalCategories: cats.length,
        totalProducts: prods.length,
        totalExtras: exts.length,
        visibleProducts: prods.filter((p) => p.is_visible).length,
      });
    } catch {
      // keep zeroed stats
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}
