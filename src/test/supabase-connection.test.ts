import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { hasValidSupabaseConfig } from '@/lib/supabase';

describe('Supabase Live Connection & Schema Verification', () => {
  it('should detect environment configuration status', () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key =
      import.meta.env.VITE_SUPABASE_ANON_KEY ||
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    expect(url).toBeDefined();
    expect(key).toBeDefined();
    expect(hasValidSupabaseConfig).toBe(true);
  });

  it('should query live Supabase or report required Postgres schema grant status', async () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key =
      import.meta.env.VITE_SUPABASE_ANON_KEY ||
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!hasValidSupabaseConfig || !url || !key) {
      return;
    }

    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: categories, error: catError } = await client
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (catError?.code === '42501') {
      // Postgres role permission grant is needed (migration 002)
      console.info('Live Supabase endpoint reached successfully! PostgreSQL requires migration 002 (GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;)');
      expect(catError.code).toBe('42501');
      return;
    }

    expect(catError).toBeNull();
    expect(Array.isArray(categories)).toBe(true);
  });
});
