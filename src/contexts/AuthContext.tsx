import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { User } from '../types/auth.type';
import { authService } from '../services/auth.service';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount — 8s timeout để không spin mãi nếu backend sập
  const restoreSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const restoredUser = await Promise.race([
        authService.restoreSession(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
      ]);
      setUser(restoredUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loggedUser = await authService.login(email, password);
      setUser(loggedUser); // authService.login trả về AuthUser trực tiếp
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // register không auto-login — chỉ tạo tài khoản, redirect về login
      await authService.register(email, password, fullName);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

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
