import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'Origin': window.location.origin,
  },
  withCredentials: true,
});

// Function to get the current access token from Zustand store only
const getAccessToken = () => {
  const token = useAuthStore.getState().accessToken;
  console.log('API Interceptor - Token from store:', !!token, 'Token length:', token?.length || 0);
  return token;
};

// Function to get the current refresh token from Zustand store only
const getRefreshToken = () => {
  const token = useAuthStore.getState().refreshToken;
  console.log('API Interceptor - Refresh token from store:', !!token, 'Refresh token length:', token?.length || 0);
  return token;
};

// Get CSRF token
const fetchCsrfToken = async () => {
  try {
    const { data } = await api.get('/csrf-token');
    return data.csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

// Store CSRF token
let csrfToken: string | null = null;

// Initialize CSRF token
fetchCsrfToken().then(token => {
  csrfToken = token;
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token if available
    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken;
    } else {
      // Try to fetch new CSRF token if not available
      const newToken = await fetchCsrfToken();
      if (newToken) {
        csrfToken = newToken;
        config.headers['x-csrf-token'] = newToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle CSRF token errors
    if (error.response?.status === 403 && error.response?.data?.code === 'EBADCSRFTOKEN') {
      try {
        const { data } = await api.get('/csrf-token');
        if (data.csrfToken) {
          originalRequest.headers['x-csrf-token'] = data.csrfToken;
          return api(originalRequest);
        }
      } catch (csrfError) {
        console.error('Failed to refresh CSRF token:', csrfError);
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Check if we have a refresh token before attempting refresh
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          console.warn('No refresh token available, redirecting to login');
          useAuthStore.getState().logout();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        console.log('Attempting token refresh...');

        // Try to refresh the token with timeout
        // Backend reads refresh token from cookies, so we don't need to send it in body
        const refreshResponse = await Promise.race([
          axios.post('/api/auth/refresh', {}, { withCredentials: true }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Refresh timeout')), 10000)
          )
        ]) as any;

        if (refreshResponse.data?.success) {
          const newToken = refreshResponse.data.data.accessToken;
          const newRefreshToken = refreshResponse.data.data.refreshToken;

          console.log('Token refresh successful');

          // Update the store with new tokens using the new updateTokens method
          useAuthStore.getState().updateTokens(newToken, newRefreshToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError: any) {
        console.error('Token refresh failed:', refreshError.message);

        // Only logout if it's a genuine auth failure, not a network issue
        if (refreshError.message === 'Refresh timeout' || refreshError.response?.status === 401) {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    // For other 401 errors (after retry), redirect to login
    if (error.response?.status === 401 && originalRequest._retry) {
      console.warn('Request failed after token refresh attempt');
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Lead Magnets API
export const leadMagnetsAPI = {
  // Capture lead magnet email
  captureLead: async (email: string, leadMagnet: string) => {
    const response = await api.post('/lead-magnets/capture', {
      email,
      leadMagnet
    });
    return response.data;
  },

  // Get all lead captures (admin only)
  getLeadCaptures: async () => {
    const response = await api.get('/lead-magnets/captures');
    return response.data;
  }
};

export default api;
