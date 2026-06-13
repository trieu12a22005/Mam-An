// ── Danh mục achievement ──────────────────────────────────────────────────────
export type AchievementCategory =
  | 'TREE_CARE'  // Chăm sóc cây
  | 'WELLNESS'   // Sức khỏe tinh thần
  | 'JOURNAL'    // Nhật ký cảm xúc
  | 'JOURNEY';   // Hành trình đồng hành

// ── Khóa chỉ số tiến trình — dùng để gọi updateProgress ─────────────────────
export type ProgressKey =
  | 'carePlantCount'    // TREE_CARE: số lần tưới/chăm cây
  | 'resourceFeedCount' // TREE_CARE: số lần bón tài nguyên
  | 'zenSessionCount'   // WELLNESS:  số phiên Vườn Yên hoàn thành
  | 'zenTotalMinutes'   // WELLNESS:  tổng phút thư giãn
  | 'journalCount'      // JOURNAL:   số nhật ký đã viết
  | 'journalDays'       // JOURNAL:   số ngày duy nhất có ghi nhật ký
  | 'streakDays';       // JOURNEY:   số ngày liên tiếp dùng app

// ── Achievement đơn lẻ ───────────────────────────────────────────────────────
export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: AchievementCategory;
  requirement: string;        // Mô tả điều kiện ngắn gọn (dùng khi chưa unlock)
  progressKey: ProgressKey;   // Khóa map với chỉ số nào của user
  currentProgress: number;    // Giá trị hiện tại
  targetProgress: number;     // Ngưỡng để mở khóa
  unlocked: boolean;
  unlockedAt?: string;        // ISO date — có khi đã unlock
}

// ── Dữ liệu tiến trình lưu trong AsyncStorage ────────────────────────────────
export interface StoredProgressMap {
  [progressKey: string]: number; // ví dụ: { carePlantCount: 12, zenSessionCount: 5 }
}

export interface StoredUnlockMap {
  [achievementId: string]: string; // id → ISO date khi unlock
}

export interface AchievementStorage {
  progress: StoredProgressMap;
  unlocked: StoredUnlockMap;
  lastUpdated: string;
}

// ── Thông báo khi unlock ─────────────────────────────────────────────────────
export interface UnlockNotification {
  achievementId: string;
  emoji: string;
  title: string;
  message: string; // ví dụ: "🌱 Bạn vừa mở khóa Hạt giống bình yên"
}
