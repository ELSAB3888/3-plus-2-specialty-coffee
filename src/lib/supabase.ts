import { createClient } from '@supabase/supabase-js';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_EXTRAS,
} from './mockData';
import type { Category, ProductWithSizes, Extra } from '@/types';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const hasValidSupabaseConfig = Boolean(
  rawUrl &&
    rawKey &&
    rawUrl.startsWith('https://') &&
    !rawUrl.includes('placeholder') &&
    rawKey.length > 20
);

// Helper for local mock persistence
const STORAGE_PREFIX = '3plus2_mock_';
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// In-memory/localStorage stores for demo mode
let mockCategories = getStored<Category[]>('categories', INITIAL_CATEGORIES);
let mockProducts = getStored<ProductWithSizes[]>('products', INITIAL_PRODUCTS);
let mockExtras = getStored<Extra[]>('extras', INITIAL_EXTRAS);

function persistMock() {
  setStored('categories', mockCategories);
  setStored('products', mockProducts);
  setStored('extras', mockExtras);
}

// Mock query builder mimicking Supabase client interface
class MockQueryBuilder {
  private tableName: string;
  private filters: Array<(item: any) => boolean> = [];
  private orderField: string | null = null;
  private orderAsc = true;
  private limitCount: number | null = null;
  private isHead = false;

  constructor(table: string) {
    this.tableName = table;
  }

  select(_columns = '*', options?: { count?: string; head?: boolean }) {
    if (options?.head) {
      this.isHead = true;
    }
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item) => item[column] === value);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderField = column;
    this.orderAsc = options?.ascending ?? true;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  private getSourceData(): any[] {
    switch (this.tableName) {
      case 'categories':
        return mockCategories;
      case 'products':
        return mockProducts;
      case 'extras':
        return mockExtras;
      default:
        return [];
    }
  }

  async then(resolve: (res: { data: any; error: any; count?: number }) => void) {
    await new Promise((r) => setTimeout(r, 80)); // realistic tiny latency
    let dataset = [...this.getSourceData()];

    for (const filter of this.filters) {
      dataset = dataset.filter(filter);
    }

    if (this.orderField) {
      const field = this.orderField;
      const asc = this.orderAsc;
      dataset.sort((a, b) => {
        if (a[field] < b[field]) return asc ? -1 : 1;
        if (a[field] > b[field]) return asc ? 1 : -1;
        return 0;
      });
    }

    const totalCount = dataset.length;

    if (this.limitCount !== null) {
      dataset = dataset.slice(0, this.limitCount);
    }

    if (this.isHead) {
      resolve({ data: null, count: totalCount, error: null });
      return;
    }

    // Deep copy to prevent mutation issues
    resolve({ data: JSON.parse(JSON.stringify(dataset)), count: totalCount, error: null });
  }

  async insert(rows: any | any[]) {
    await new Promise((r) => setTimeout(r, 80));
    const toInsert = Array.isArray(rows) ? rows : [rows];
    const created: any[] = [];

    for (const row of toInsert) {
      const newRow = {
        id: row.id || `mock-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...row,
      };

      if (this.tableName === 'categories') {
        mockCategories.push(newRow);
      } else if (this.tableName === 'products') {
        const product = {
          ...newRow,
          product_sizes: newRow.product_sizes || [],
        };
        mockProducts.push(product);
      } else if (this.tableName === 'extras') {
        mockExtras.push(newRow);
      }
      created.push(newRow);
    }

    persistMock();
    return { data: created, error: null };
  }

  async update(updates: any) {
    await new Promise((r) => setTimeout(r, 80));
    const now = new Date().toISOString();

    if (this.tableName === 'categories') {
      mockCategories = mockCategories.map((c) => {
        if (this.filters.every((f) => f(c))) {
          return { ...c, ...updates, updated_at: now };
        }
        return c;
      });
    } else if (this.tableName === 'products') {
      mockProducts = mockProducts.map((p) => {
        if (this.filters.every((f) => f(p))) {
          return { ...p, ...updates, updated_at: now };
        }
        return p;
      });
    } else if (this.tableName === 'extras') {
      mockExtras = mockExtras.map((e) => {
        if (this.filters.every((f) => f(e))) {
          return { ...e, ...updates, updated_at: now };
        }
        return e;
      });
    }

    persistMock();
    return { data: updates, error: null };
  }

  async delete() {
    await new Promise((r) => setTimeout(r, 80));

    if (this.tableName === 'categories') {
      mockCategories = mockCategories.filter((c) => !this.filters.every((f) => f(c)));
    } else if (this.tableName === 'products') {
      mockProducts = mockProducts.filter((p) => !this.filters.every((f) => f(p)));
    } else if (this.tableName === 'extras') {
      mockExtras = mockExtras.filter((e) => !this.filters.every((f) => f(e)));
    }

    persistMock();
    return { data: null, error: null };
  }
}

// Mock auth client
const mockAuth = {
  async getSession() {
    const isOwner = localStorage.getItem('3plus2_auth_session') === 'true';
    if (!isOwner) return { data: { session: null }, error: null };
    return {
      data: {
        session: {
          user: { id: 'owner-uuid-3plus2', email: 'owner@3plus2coffee.com' },
          access_token: 'mock_token',
        },
      },
      error: null,
    };
  },
  onAuthStateChange(callback: (event: string, session: any) => void) {
    const handler = () => {
      const isOwner = localStorage.getItem('3plus2_auth_session') === 'true';
      const session = isOwner
        ? {
            user: { id: 'owner-uuid-3plus2', email: 'owner@3plus2coffee.com' },
          }
        : null;
      callback('SIGNED_IN', session);
    };
    window.addEventListener('storage', handler);
    return {
      data: {
        subscription: {
          unsubscribe: () => window.removeEventListener('storage', handler),
        },
      },
    };
  },
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    await new Promise((r) => setTimeout(r, 150));
    // Support demo owner login or actual credentials
    if (password.length >= 6) {
      localStorage.setItem('3plus2_auth_session', 'true');
      return {
        data: {
          user: { id: 'owner-uuid-3plus2', email },
          session: { access_token: 'mock_token' },
        },
        error: null,
      };
    }
    return {
      data: { user: null, session: null },
      error: { message: 'Invalid credentials. Password must be at least 6 characters.' },
    };
  },
  async signOut() {
    localStorage.removeItem('3plus2_auth_session');
    return { error: null };
  },
};

// Mock storage client
const mockStorage = {
  from(_bucket: string) {
    return {
      async upload(path: string, file: File) {
        return new Promise<{ data: { path: string } | null; error: any }>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            // Save data url
            const dataUrl = reader.result as string;
            sessionStorage.setItem('mock_img_' + path, dataUrl);
            resolve({ data: { path }, error: null });
          };
          reader.readAsDataURL(file);
        });
      },
      getPublicUrl(path: string) {
        const stored = sessionStorage.getItem('mock_img_' + path);
        return {
          data: {
            publicUrl: stored || `https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80`,
          },
        };
      },
      async remove(_paths: string[]) {
        return { data: null, error: null };
      },
    };
  },
};

// Choose real Supabase or fallback mock
export const supabase: any = hasValidSupabaseConfig
  ? createClient(rawUrl!, rawKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : {
      from: (table: string) => new MockQueryBuilder(table),
      auth: mockAuth,
      storage: mockStorage,
    };
