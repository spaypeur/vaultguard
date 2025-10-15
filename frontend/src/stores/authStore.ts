import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status?: string;
  jurisdiction?: string;
  subscription?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (code: string) => Promise<void>;
  setAuth: (user: User, accessToken: string, refreshToken?: string) => void;
  updateTokens: (accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (code: string) => {
        set({ isLoading: true });
        try {
          const apiUrl = import.meta.env.VITE_API_URL || '/api';
          const response = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Origin': window.location.origin,
            },
            body: JSON.stringify({ code }),
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Invalid credentials');
          }

          const data = await response.json();
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setAuth: (user, accessToken, refreshToken) => {
        console.log('Setting auth:', { user: user.email, hasToken: !!accessToken });
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false
        });
      },

      updateTokens: (accessToken, refreshToken) => {
        const currentState = get();
        console.log('Updating tokens:', { hasNewToken: !!accessToken, hasNewRefresh: !!refreshToken });
        set({
          accessToken,
          refreshToken: refreshToken || currentState.refreshToken,
          isLoading: false
        });
      },

      logout: () => {
        console.log('Logging out user');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'vaultguard-auth',
      // Only persist essential auth data, not loading states
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
