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
  return LOCAL_URL;
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

    // Nếu lỗi 401 và chưa retry, ĐỒNG THỜI không phải là các request liên quan đến auth
    const isAuthUrl = originalRequest.url?.includes('/auth/login') || 
                      originalRequest.url?.includes('/auth/refresh') ||
                      originalRequest.url?.includes('/auth/register');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthUrl) {
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

        // Sử dụng axios mặc định để tránh bị chặn lại bởi chính interceptor này
        const res = await axios.post<{ accessToken: string; refreshToken?: string }>(
          `${getBaseURL()}/auth/refresh`,
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
