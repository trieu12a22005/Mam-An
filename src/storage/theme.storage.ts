import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimeThemeSettings } from '../types/theme.type';

const STORAGE_KEY = '@mamAn:themeSettings';

export const DEFAULT_THEME_SETTINGS: TimeThemeSettings = {
  themeMode: 'AUTO',
  enableTimeTheme: true,
  enableNightEffects: true,
};

export const themeStorage = {
  /** Lấy settings từ AsyncStorage. Trả default nếu chưa có hoặc lỗi. */
  getThemeSettings: async (): Promise<TimeThemeSettings> => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_THEME_SETTINGS };
      const parsed = JSON.parse(raw) as Partial<TimeThemeSettings>;
      // Merge với default để đảm bảo đủ field khi thêm field mới
      return { ...DEFAULT_THEME_SETTINGS, ...parsed };
    } catch {
      return { ...DEFAULT_THEME_SETTINGS };
    }
  },

  /** Lưu settings vào AsyncStorage. Im lặng nếu lỗi. */
  saveThemeSettings: async (settings: TimeThemeSettings): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Không crash app nếu storage lỗi
    }
  },

  /** Xóa settings (reset về default). */
  clearThemeSettings: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // Im lặng
    }
  },
};
