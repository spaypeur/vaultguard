import 'dotenv/config';

export default {
  expo: {
    name: 'VaultGuard',
    slug: 'vaultguard-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#030712'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.vaultguard.mobile'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#030712'
      },
      package: 'com.vaultguard.mobile'
    },
    web: {
      favicon: './assets/favicon.png'
    },
    extra: {
      API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001',
      WS_URL: process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3001',
    },
    plugins: [],
  }
};