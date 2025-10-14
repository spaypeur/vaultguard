import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// API configuration
const API_URL = __DEV__ ? 'http://localhost:3001' : 'https://api.vaultguard.io';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Check network connectivity
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      throw new Error('No internet connection');
    }

    // Get access token from secure storage
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Get device info for security tracking
    const deviceId = await AsyncStorage.getItem('deviceId');
    if (deviceId) {
      config.headers['X-Device-ID'] = deviceId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle offline mode
    if (!error.response) {
      // Store failed request in queue for retry
      await storeFailedRequest(originalRequest);
      throw new Error('Request failed. It will be retried when online.');
    }

    // Handle token refresh
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect to login
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        throw new Error('Session expired. Please login again.');
      }
    }

    // Handle rate limiting
    if (error.response.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 60;
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

// Queue failed requests for offline mode
const storeFailedRequest = async (request: any) => {
  try {
    const failedRequests = JSON.parse(await AsyncStorage.getItem('failedRequests') || '[]');
    failedRequests.push(request);
    await AsyncStorage.setItem('failedRequests', JSON.stringify(failedRequests));
  } catch (error) {
    console.error('Failed to store failed request:', error);
  }
};

// Retry failed requests when back online
export const retryFailedRequests = async () => {
  try {
    const failedRequests = JSON.parse(await AsyncStorage.getItem('failedRequests') || '[]');
    if (failedRequests.length === 0) return;

    await AsyncStorage.removeItem('failedRequests');
    
    for (const request of failedRequests) {
      try {
        await api(request);
      } catch (error) {
        console.error('Failed to retry request:', error);
      }
    }
  } catch (error) {
    console.error('Failed to process failed requests:', error);
  }
};

// Setup push notifications
export const setupPushNotifications = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      throw new Error('Permission not granted for push notifications');
    }

    const token = await Notifications.getExpoPushTokenAsync();
    
    // Register push token with backend
    await api.post('/notifications/register-device', {
      token: token.data,
      deviceId: await AsyncStorage.getItem('deviceId'),
      platform: Platform.OS,
    });
  } catch (error) {
    console.error('Failed to setup push notifications:', error);
  }
};

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default api;