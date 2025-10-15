import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

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
  refreshUser: () => Promise<void>;
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
          const { data } = await api.post('/auth/login', { code });

          if (data.success) {
            set({
              user: data.data.user,
              accessToken: data.data.accessToken,
              refreshToken: data.data.refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(data.message || 'Login failed');
          }
        } catch (error: any) {
          set({ isLoading: false });
          const errorMessage = error.response?.data?.message ||
                              error.response?.data?.error ||
                              error.message ||
                              'Login failed';
          throw new Error(errorMessage);
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

      refreshUser: async () => {
        try {
          const currentState = get();
          if (!currentState.isAuthenticated || !currentState.accessToken) {
            return;
          }

          const { data } = await api.get('/user/me');
          if (data.success) {
            set({
              user: data.data,
              isLoading: false
            });
          }
        } catch (error: any) {
          console.error('Failed to refresh user data:', error);
          // If refresh fails due to auth issues, logout
          if (error.response?.status === 401) {
            get().logout();
          }
        }
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
