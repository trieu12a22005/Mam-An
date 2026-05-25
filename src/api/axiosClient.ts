import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '../storage/tokenStorage';
import { Platform } from 'react-native';

// ── Base URL ─────────────────────────────────────────────────────────────────
// Bắt buộc dùng IP của máy tính trong cùng WiFi với điện thoại
// Chạy `ipconfig` để lấy IPv4 Address rồi điền vào đây
const DEV_BASE_URL = 'http://192.168.1.199:3000/api/v1'; // ← đổi IP nếu cần

const getBaseURL = () => {
  if (__DEV__) return DEV_BASE_URL;
  return 'https://your-production-api.com/api/v1';
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
        // POST /auth/refresh — dùng cookie refreshToken (withCredentials)
        const res = await axiosClient.post<{ accessToken: string }>('/auth/refresh');
        const newToken = res.data.accessToken;
        await tokenStorage.setAccessToken(newToken);
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
