import axiosClient from '../api/axiosClient';
import { tokenStorage } from '../storage/tokenStorage';
import type { User } from '../types/auth.type';

// ── Response shapes từ backend ────────────────────────────────────────────────
// POST /auth/login  → { message, accessToken, refreshToken, user }
interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

// GET /auth/me  → { user }
interface MeResponse {
  user: User;
}

// POST /auth/register → { message, user }
interface RegisterResponse {
  message: string;
  user: User;
}

export const authService = {
  /** POST /auth/login — lưu accessToken vào SecureStore */
  login: async (email: string, password: string): Promise<User> => {
    const res = await axiosClient.post<LoginResponse>('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = res.data;
    if (!accessToken) throw new Error('No access token in login response');
    // Lưu cả accessToken lẫn refreshToken để interceptor có thể refresh sau
    await tokenStorage.saveTokens(accessToken, refreshToken ?? '');
    return user;
  },

  /** POST /auth/register — chỉ tạo tài khoản, không auto-login */
  register: async (email: string, password: string, fullName: string): Promise<void> => {
    await axiosClient.post<RegisterResponse>('/auth/register', {
      email,
      password,
      fullName,
    });
    // Không auto-login — caller redirect về màn login
  },

  /** GET /auth/me — khôi phục session từ token đã lưu */
  restoreSession: async (): Promise<User | null> => {
    const token = await tokenStorage.getAccessToken();
    if (!token) return null;
    try {
      const res = await axiosClient.get<MeResponse>('/auth/me');
      return res.data.user; // backend trả { user: {...} }
    } catch {
      await tokenStorage.clearAll();
      return null;
    }
  },

  /** POST /auth/logout — xóa token local và invalidate refreshToken trên server */
  logout: async (): Promise<void> => {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      // Gửi refreshToken trong body vì mobile không gửi cookie
      await axiosClient.post('/auth/logout', refreshToken ? { refreshToken } : {});
    } finally {
      await tokenStorage.clearAll();
    }
  },
};
