import axiosClient from '../../api/axiosClient';
import { Achievement } from '../features/achievements/types/achievement.types';

export interface AchievementApiItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  emoji: string;
  category: 'TREE_CARE' | 'WELLNESS' | 'JOURNAL' | 'JOURNEY';
  requirement: string;
  progressKey: string;
  targetProgress: number;
  currentProgress: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface AchievementMeta {
  total: number;
  unlockedCount: number;
  lockedCount: number;
}

export interface AchievementsResponse {
  data: AchievementApiItem[];
  meta: AchievementMeta;
}

export interface ProgressRefreshResponse {
  data: AchievementApiItem[];
  newlyUnlocked: AchievementApiItem[];
  meta: {
    refreshed: boolean;
    newlyUnlockedCount: number;
  };
}

export const achievementApi = {
  /** GET /achievements/me — lấy achievements + tiến trình của user */
  getMyAchievements: async (): Promise<AchievementsResponse> => {
    const res = await axiosClient.get<AchievementsResponse>('/achievements/me');
    return res.data;
  },

  /** POST /achievements/progress — trigger server recalculate */
  refreshProgress: async (): Promise<ProgressRefreshResponse> => {
    const res = await axiosClient.post<ProgressRefreshResponse>('/achievements/progress');
    return res.data;
  },
};

/** Map API item → internal Achievement type */
export function mapApiToAchievement(item: AchievementApiItem): Achievement {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    emoji: item.emoji,
    category: item.category,
    requirement: item.requirement,
    progressKey: item.progressKey as any,
    currentProgress: item.currentProgress,
    targetProgress: item.targetProgress,
    unlocked: item.unlocked,
    unlockedAt: item.unlockedAt ?? undefined,
  };
}
