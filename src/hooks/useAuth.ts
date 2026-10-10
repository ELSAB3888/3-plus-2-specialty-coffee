import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { AuthState } from '@/types';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    userId: null,
  });

  useEffect(() => {
    // Check current session
    void supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setState({
        isAuthenticated: !!data?.session?.user,
        isLoading: false,
        userId: data?.session?.user?.id ?? null,
      });
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setState({
          isAuthenticated: !!session?.user,
          isLoading: false,
          userId: session?.user?.id ?? null,
        });
      }
    );

    return () => {
      subscription?.unsubscribe?.();
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return { user: null, error: error.message };
      }
      return { user: data.user, error: null };
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { ...state, signIn, signOut };
}
