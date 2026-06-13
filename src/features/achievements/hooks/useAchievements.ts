import { useState, useEffect, useCallback, useRef } from 'react';
import { Achievement, UnlockNotification } from '../types/achievement.types';
import { achievementApi, mapApiToAchievement } from '../../../services/achievement.service';

// ── Hook chính — connect với backend ─────────────────────────────────────────
export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [notification, setNotification] = useState<UnlockNotification | null>(null);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [totalCount, setTotalCount]       = useState(0);

  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Auto-dismiss notification sau 4 giây ─────────────────────────────────
  useEffect(() => {
    if (!notification) return;
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    notifTimerRef.current = setTimeout(() => setNotification(null), 4000);
    return () => {
      if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    };
  }, [notification]);

  // ── Hàm cập nhật state từ danh sách achievements ─────────────────────────
  const applyAchievements = useCallback((items: Achievement[]) => {
    const sorted = [...items].sort((a, b) =>
      (b.unlocked ? 1 : 0) - (a.unlocked ? 1 : 0),
    );
    setAchievements(sorted);
    setUnlockedCount(sorted.filter((a) => a.unlocked).length);
    setTotalCount(sorted.length);
  }, []);

  // ── Load dữ liệu từ backend khi mount ────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    achievementApi.getMyAchievements()
      .then((res) => {
        if (cancelled) return;
        applyAchievements(res.data.map(mapApiToAchievement));
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [applyAchievements]);

  // ── getAchievements ───────────────────────────────────────────────────────
  const getAchievements = useCallback(() => achievements, [achievements]);

  // ── getUnlockedAchievements ───────────────────────────────────────────────
  const getUnlockedAchievements = useCallback((): Achievement[] => {
    return achievements
      .filter((a) => a.unlocked)
      .sort((a, b) => {
        if (!a.unlockedAt || !b.unlockedAt) return 0;
        return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
      });
  }, [achievements]);

  // ── refreshFromServer ─────────────────────────────────────────────────────
  /**
   * Gọi POST /achievements/progress → backend tính lại từ DB.
   * Nếu có achievement mới được mở khóa → trigger notification.
   * Client không tự unlock — server quyết định.
   */
  const refreshFromServer = useCallback(async (): Promise<void> => {
    try {
      const res = await achievementApi.refreshProgress();

      applyAchievements(res.data.map(mapApiToAchievement));

      // Hiển thị toast nếu có achievement mới
      if (res.newlyUnlocked.length > 0) {
        const first = res.newlyUnlocked[0]!;
        setNotification({
          achievementId: first.id,
          emoji: first.emoji,
          title: first.title,
          message: `${first.emoji} Bạn vừa mở khóa "${first.title}"`,
        });
      }
    } catch (err) {
      // Im lặng — không crash UI nếu refresh thất bại
      console.warn('[useAchievements] refreshFromServer failed:', err);
    }
  }, [applyAchievements]);

  // ── checkUnlock (alias cho refreshFromServer — server kiểm tra) ───────────
  const checkUnlock = useCallback(() => refreshFromServer(), [refreshFromServer]);

  // ── Giữ lại updateProgress API nhưng map sang refreshFromServer ──────────
  // Các màn hình khác gọi updateProgress(key, value) sau action
  // → chỉ trigger server refresh, không tự tính
  const updateProgress = useCallback(
    async (_key: string, _value: number): Promise<UnlockNotification | null> => {
      await refreshFromServer();
      return notification;
    },
    [refreshFromServer, notification],
  );

  const incrementProgress = useCallback(
    async (_key: string, _delta?: number): Promise<UnlockNotification | null> => {
      await refreshFromServer();
      return notification;
    },
    [refreshFromServer, notification],
  );

  // ── dismissNotification ───────────────────────────────────────────────────
  const dismissNotification = useCallback(() => {
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    setNotification(null);
  }, []);

  return {
    achievements,
    isLoading,
    notification,

    // Getters
    getAchievements,
    getUnlockedAchievements,

    // Server-driven mutators
    refreshFromServer,
    updateProgress,
    incrementProgress,
    checkUnlock,

    // UI
    dismissNotification,

    // Stats
    unlockedCount,
    totalCount,
  };
}
