import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'garden_access_token';
const REFRESH_TOKEN_KEY = 'garden_refresh_token';

export const tokenStorage = {
  getAccessToken: async () => {
    if (Platform.OS === 'web') return localStorage.getItem(ACCESS_TOKEN_KEY);
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },
  getRefreshToken: async () => {
    if (Platform.OS === 'web') return localStorage.getItem(REFRESH_TOKEN_KEY);
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  setAccessToken: async (token: string) => {
    if (Platform.OS === 'web') return localStorage.setItem(ACCESS_TOKEN_KEY, token);
    return SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  },
  setRefreshToken: async (token: string) => {
    if (Platform.OS === 'web') return localStorage.setItem(REFRESH_TOKEN_KEY, token);
    return SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },

  saveTokens: async (accessToken: string, refreshToken: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      return;
    }
    return Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  },

  clearAll: async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      return;
    }
    return Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  },
};
