import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { QueryClient } from '@tanstack/react-query';
import { User } from '../types/auth.type';
import { authService } from '../services/auth.service';
import { syncPushTokenToServer } from '../services/pushNotification.service';

// ─── Types ──────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: React.ReactNode;
  queryClient: QueryClient; // Nhận vào để clear cache khi đổi tài khoản
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, queryClient }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Flag: đã login thành công rồi, không cho restoreSession ghi đè user=null
  const loggedInRef = useRef(false);

  // Restore session on mount — 8s timeout để không spin mãi nếu backend sập
  const restoreSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const restoredUser = await Promise.race([
        authService.restoreSession(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
      ]);
      // Nếu login() đã chạy xong trước, không overwrite user đã set
      if (!loggedInRef.current) {
        setUser(restoredUser);
        // Sync push token lên server sau khi khôi phục session thành công
        if (restoredUser) {
          syncPushTokenToServer().catch((e) =>
            console.error('[AuthContext] syncPushTokenToServer error:', e)
          );
        }
      }
    } catch {
      if (!loggedInRef.current) {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (email: string, password: string) => {
    // KHÔNG set isLoading ở đây — isLoading chỉ dành cho restoreSession (app boot)
    // Nếu set isLoading=true rồi false, có thể gây race condition:
    //   isLoading=false + user chưa được set → tabs/_layout redirect về login
    queryClient.clear();
    const loggedUser = await authService.login(email, password);
    loggedInRef.current = true;
    setUser(loggedUser);
    // Sync push token lên server sau khi login thành công
    syncPushTokenToServer().catch((e) =>
      console.error('[AuthContext] syncPushTokenToServer error:', e)
    );
  }, [queryClient]);

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    await authService.register(email, password, fullName);
  }, []);

  const logout = useCallback(async () => {
    loggedInRef.current = false; // reset để restoreSession hoạt động bình thường sau
    // Set user=null ngay lập tức để UI phản hồi nhanh
    setUser(null);
    queryClient.clear();
    // Gọi API logout sau (best-effort, không cần await)
    authService.logout().catch(() => {});
  }, [queryClient]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    restoreSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
