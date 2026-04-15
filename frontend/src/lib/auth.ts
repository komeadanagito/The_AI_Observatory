'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  UserBasicInfo,
  authApi,
  clearStoredTokens,
  getAccessToken,
  getRefreshToken,
  setStoredTokens,
} from './api';

interface AuthState {
  user: UserBasicInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  setHydrated: (hydrated: boolean) => void;
}

async function authenticate(
  method: 'login' | 'register',
  email: string,
  password: string,
  set: (partial: Partial<AuthState>) => void,
) {
  set({ isLoading: true, error: null });

  try {
    const response = await authApi[method](email, password);
    setStoredTokens(response.access_token, response.refresh_token);

    set({
      user: response.user ?? null,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  } catch (error) {
    clearStoredTokens();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: error instanceof Error ? error.message : '认证失败',
    });
    throw error;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      login: async (email, password) => authenticate('login', email, password, set),

      register: async (email, password) => authenticate('register', email, password, set),

      logout: () => {
        clearStoredTokens();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      setHydrated: (hydrated) => set({ _hasHydrated: hydrated }),

      checkAuth: async () => {
        set({ isLoading: true, error: null });

        const accessToken = getAccessToken();
        const refreshToken = getRefreshToken();

        if (!accessToken && !refreshToken) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        try {
          const user = await authApi.me();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch {
          clearStoredTokens();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },
    }),
    {
      name: 'ai-observatory-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!hasHydrated || isLoading) {
      return;
    }

    if (!isAuthenticated) {
      const redirect = pathname && pathname !== '/' ? `?redirect=${encodeURIComponent(pathname)}` : '';
      router.replace(`/login${redirect}`);
    }
  }, [hasHydrated, isAuthenticated, isLoading, pathname, router]);

  return {
    isReady: hasHydrated && isAuthenticated,
    isLoading: !hasHydrated || isLoading,
  };
}
