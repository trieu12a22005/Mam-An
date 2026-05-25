import axiosClient from '../api/axiosClient';
import { tokenStorage } from '../storage/tokenStorage';
import { AuthUser } from '../types/auth.type';

// ── Response shapes từ backend ────────────────────────────────────────────────
// POST /auth/login  → { message, accessToken, user }
interface LoginResponse {
  message: string;
  accessToken: string;
  user: AuthUser;
}

// GET /auth/me  → { user }
interface MeResponse {
  user: AuthUser;
}

// POST /auth/register → { message, user }
interface RegisterResponse {
  message: string;
  user: AuthUser;
}

export const authService = {
  /** POST /auth/login — lưu accessToken vào SecureStore */
  login: async (email: string, password: string): Promise<AuthUser> => {
    const res = await axiosClient.post<LoginResponse>('/auth/login', { email, password });
    const { accessToken, user } = res.data;
    if (!accessToken) throw new Error('No access token in login response');
    await tokenStorage.setAccessToken(accessToken);
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
  restoreSession: async (): Promise<AuthUser | null> => {
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

  /** POST /auth/logout — xóa token local */
  logout: async (): Promise<void> => {
    try {
      await axiosClient.post('/auth/logout');
    } finally {
      await tokenStorage.clearAll();
    }
  },
};
