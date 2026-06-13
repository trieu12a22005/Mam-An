import AsyncStorage from '@react-native-async-storage/async-storage';
import { AchievementStorage, StoredProgressMap, StoredUnlockMap } from '../types/achievement.types';

const STORAGE_KEY = '@mamAn:achievementData';

const DEFAULT_DATA: AchievementStorage = {
  progress: {},
  unlocked: {},
  lastUpdated: new Date().toISOString(),
};

export const achievementStorage = {
  /** Đọc toàn bộ dữ liệu achievement từ storage */
  load: async (): Promise<AchievementStorage> => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_DATA };
      const parsed = JSON.parse(raw) as Partial<AchievementStorage>;
      return {
        progress: parsed.progress ?? {},
        unlocked: parsed.unlocked ?? {},
        lastUpdated: parsed.lastUpdated ?? new Date().toISOString(),
      };
    } catch {
      return { ...DEFAULT_DATA };
    }
  },

  /** Lưu toàn bộ dữ liệu (im lặng nếu lỗi) */
  save: async (data: AchievementStorage): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...data,
        lastUpdated: new Date().toISOString(),
      }));
    } catch {
      // Không crash app
    }
  },

  /** Cập nhật 1 chỉ số tiến trình cụ thể */
  updateProgress: async (key: string, value: number): Promise<AchievementStorage> => {
    const data = await achievementStorage.load();
    data.progress[key] = value;
    await achievementStorage.save(data);
    return data;
  },

  /** Ghi nhận achievement đã unlock */
  markUnlocked: async (achievementId: string): Promise<void> => {
    const data = await achievementStorage.load();
    if (!data.unlocked[achievementId]) {
      data.unlocked[achievementId] = new Date().toISOString();
      await achievementStorage.save(data);
    }
  },

  /** Reset toàn bộ (chỉ dùng khi debug) */
  reset: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {}
  },
};
