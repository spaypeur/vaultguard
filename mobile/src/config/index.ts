import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};

export const API_URL = (extra.API_URL as string) || 'http://localhost:3001';
export const WS_URL = (extra.WS_URL as string) || 'ws://localhost:3001';