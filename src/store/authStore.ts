import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminProfile } from '@/services/auth/auth.types';

interface AuthState {
  token: string | null;
  user: AdminProfile | null;
  setAuth: (token: string, user: AdminProfile) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        set({ token, user });
      },
      clearAuth: () => {
        set({ token: null, user: null });
      },
    }),
    {
      name: 'admin-auth',
    }
  )
);
