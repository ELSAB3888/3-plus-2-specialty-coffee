import { useState, useEffect, useCallback } from 'react';
import type { AuthState } from '@/types';

const STORAGE_KEY = '3plus2_admin_session_token';

export function isLocalAdminEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    userId: null,
    token: null,
  });

  useEffect(() => {
    // Check local session token in sessionStorage
    const token = sessionStorage.getItem(STORAGE_KEY);
    const isLocal = isLocalAdminEnvironment();

    setState({
      isAuthenticated: Boolean(token && isLocal),
      isLoading: false,
      userId: token ? 'local-admin' : null,
      token: token || null,
    });
  }, []);

  const loginWithToken = useCallback((token: string) => {
    sessionStorage.setItem(STORAGE_KEY, token);
    setState({
      isAuthenticated: true,
      isLoading: false,
      userId: 'local-admin',
      token,
    });
  }, []);

  const signOut = useCallback(async () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setState({
      isAuthenticated: false,
      isLoading: false,
      userId: null,
      token: null,
    });
  }, []);

  // For compatibility with any legacy signature
  const signIn = useCallback(
    async (_email: string, password: string) => {
      loginWithToken(password);
      return { user: { id: 'local-admin', email: 'admin@local' } as any, error: null };
    },
    [loginWithToken]
  );

  return {
    ...state,
    isLocal: isLocalAdminEnvironment(),
    loginWithToken,
    signIn,
    signOut,
  };
}
