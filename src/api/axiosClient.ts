import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '../storage/tokenStorage';
import { Platform } from 'react-native';

// ── Base URL ─────────────────────────────────────────────────────────────────
// ✅ KHUYẾN NGHỊ: Deploy backend lên Railway/Render để có URL cố định
// Không cần đổi IP mỗi khi chuyển WiFi

// URL cloud cố định (sau khi deploy) — dùng cho cả dev lẫn prod
const CLOUD_URL = 'https://garden-be.vercel.app/api/v1';

// URL local (chỉ dùng khi debug trên máy, phải cùng WiFi)
const LOCAL_URL = 'http://192.168.1.199:3000/api/v1';

const getBaseURL = () => {
  if (CLOUD_URL) return CLOUD_URL;      // ← ưu tiên cloud nếu đã có
  if (__DEV__) return LOCAL_URL;        // ← fallback local khi dev
  return 'https://garden-be.vercel.app/api/v1';
};

const axiosClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 8_000, // 8s — đủ cho mạng chậm, không spin mãi khi backend sập
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — đính kèm accessToken ───────────────────────────────
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err),
);

// ── Response interceptor — auto refresh token ────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Đang refresh — thêm vào hàng chờ
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Lấy refreshToken từ SecureStore để gửi trong body
        // (React Native không tự gửi cookie như browser)
        const storedRefreshToken = await tokenStorage.getRefreshToken();
        if (!storedRefreshToken) throw new Error('No refresh token stored');

        const res = await axiosClient.post<{ accessToken: string; refreshToken?: string }>(
          '/auth/refresh',
          { refreshToken: storedRefreshToken },
        );
        const { accessToken: newToken, refreshToken: newRefreshToken } = res.data;
        await tokenStorage.setAccessToken(newToken);
        // Nếu backend cấp refreshToken mới (rotation), lưu lại
        if (newRefreshToken) await tokenStorage.setRefreshToken(newRefreshToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await tokenStorage.clearAll();
        // Tại đây có thể dispatch logout event nếu cần
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
