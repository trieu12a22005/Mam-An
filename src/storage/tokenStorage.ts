import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'garden_access_token';
const REFRESH_TOKEN_KEY = 'garden_refresh_token';

export const tokenStorage = {
  // ── Getters ──────────────────────────────────────────────────────────────
  getAccessToken: (): Promise<string | null> =>
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),

  getRefreshToken: (): Promise<string | null> =>
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),

  // ── Setters ──────────────────────────────────────────────────────────────
  setAccessToken: (token: string): Promise<void> =>
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token),

  setRefreshToken: (token: string): Promise<void> =>
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token),

  /** Lưu cả 2 token cùng lúc */
  saveTokens: (accessToken: string, refreshToken: string): Promise<void[]> =>
    Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    ]),

  // ── Clear ─────────────────────────────────────────────────────────────────
  /** Xóa toàn bộ token (logout / session expired) */
  clearAll: (): Promise<void[]> =>
    Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]),
};
