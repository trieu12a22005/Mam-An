import { Achievement, AchievementCategory, ProgressKey } from '../types/achievement.types';

// ── Định nghĩa tĩnh — chưa có currentProgress/unlocked/unlockedAt ────────────
export type AchievementDefinition = Omit<Achievement, 'currentProgress' | 'unlocked' | 'unlockedAt'>;

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TREE_CARE — Chăm sóc cây
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'tc_first_water',
    emoji: '💧',
    title: 'Giọt nước đầu tiên',
    description: 'Lần đầu tiên bạn tưới nước cho cây',
    category: 'TREE_CARE',
    progressKey: 'carePlantCount',
    requirement: 'Chăm sóc cây 1 lần',
    targetProgress: 1,
  },
  {
    id: 'tc_care_10',
    emoji: '🌿',
    title: 'Người làm vườn nhỏ',
    description: 'Kiên trì chăm sóc cây qua 10 lần',
    category: 'TREE_CARE',
    progressKey: 'carePlantCount',
    requirement: 'Chăm sóc cây 10 lần',
    targetProgress: 10,
  },
  {
    id: 'tc_care_30',
    emoji: '🌳',
    title: 'Bàn tay xanh',
    description: 'Đã dành 30 lần yêu thương cho khu vườn',
    category: 'TREE_CARE',
    progressKey: 'carePlantCount',
    requirement: 'Chăm sóc cây 30 lần',
    targetProgress: 30,
  },
  {
    id: 'tc_care_100',
    emoji: '🌲',
    title: 'Người thầy của cây',
    description: 'Một trăm lần đồng hành cùng mảnh vườn nhỏ',
    category: 'TREE_CARE',
    progressKey: 'carePlantCount',
    requirement: 'Chăm sóc cây 100 lần',
    targetProgress: 100,
  },
  {
    id: 'tc_resource_5',
    emoji: '🌾',
    title: 'Người nông dân tập sự',
    description: 'Đã bón tài nguyên cho cây 5 lần',
    category: 'TREE_CARE',
    progressKey: 'resourceFeedCount',
    requirement: 'Bón tài nguyên 5 lần',
    targetProgress: 5,
  },
  {
    id: 'tc_resource_20',
    emoji: '🧑‍🌾',
    title: 'Người nông dân thực thụ',
    description: 'Đã bón đủ loại tài nguyên 20 lần',
    category: 'TREE_CARE',
    progressKey: 'resourceFeedCount',
    requirement: 'Bón tài nguyên 20 lần',
    targetProgress: 20,
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // WELLNESS — Phiên Vườn Yên
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'wl_first_zen',
    emoji: '🌱',
    title: 'Hạt giống bình yên',
    description: 'Hoàn thành phiên Vườn Yên đầu tiên',
    category: 'WELLNESS',
    progressKey: 'zenSessionCount',
    requirement: 'Hoàn thành 1 phiên Vườn Yên',
    targetProgress: 1,
  },
  {
    id: 'wl_zen_5',
    emoji: '🍃',
    title: 'Khoảng lặng quen thuộc',
    description: 'Đã thực hành Vườn Yên 5 lần',
    category: 'WELLNESS',
    progressKey: 'zenSessionCount',
    requirement: 'Hoàn thành 5 phiên Vườn Yên',
    targetProgress: 5,
  },
  {
    id: 'wl_zen_20',
    emoji: '🧘',
    title: 'Người thực hành',
    description: 'Kiên trì thực hành qua 20 phiên Vườn Yên',
    category: 'WELLNESS',
    progressKey: 'zenSessionCount',
    requirement: 'Hoàn thành 20 phiên Vườn Yên',
    targetProgress: 20,
  },
  {
    id: 'wl_zen_50',
    emoji: '🌸',
    title: 'Khu vườn trong tâm trí',
    description: 'Đã dành 50 phiên thư giãn cùng Vườn Yên',
    category: 'WELLNESS',
    progressKey: 'zenSessionCount',
    requirement: 'Hoàn thành 50 phiên Vườn Yên',
    targetProgress: 50,
  },
  {
    id: 'wl_minutes_60',
    emoji: '⏳',
    title: 'Một giờ bình yên',
    description: 'Tích lũy đủ 60 phút thư giãn cùng cây',
    category: 'WELLNESS',
    progressKey: 'zenTotalMinutes',
    requirement: 'Tích lũy 60 phút thư giãn',
    targetProgress: 60,
  },
  {
    id: 'wl_minutes_300',
    emoji: '🌙',
    title: 'Người bạn của sự yên tĩnh',
    description: 'Đã dành 300 phút sống chậm cùng khu vườn',
    category: 'WELLNESS',
    progressKey: 'zenTotalMinutes',
    requirement: 'Tích lũy 300 phút thư giãn',
    targetProgress: 300,
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // JOURNAL — Nhật ký cảm xúc
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'jn_first',
    emoji: '✨',
    title: 'Lắng nghe bản thân',
    description: 'Lần đầu tiên ghi lại cảm xúc của mình',
    category: 'JOURNAL',
    progressKey: 'journalCount',
    requirement: 'Viết 1 nhật ký',
    targetProgress: 1,
  },
  {
    id: 'jn_7',
    emoji: '📝',
    title: 'Người viết nhật ký',
    description: 'Đã ghi lại 7 khoảnh khắc cảm xúc',
    category: 'JOURNAL',
    progressKey: 'journalCount',
    requirement: 'Viết 7 nhật ký',
    targetProgress: 7,
  },
  {
    id: 'jn_30',
    emoji: '📖',
    title: 'Người quan sát nội tâm',
    description: 'Kiên trì viết 30 trang nhật ký',
    category: 'JOURNAL',
    progressKey: 'journalCount',
    requirement: 'Viết 30 nhật ký',
    targetProgress: 30,
  },
  {
    id: 'jn_days_7',
    emoji: '🌅',
    title: 'Một tuần ghi nhận',
    description: 'Ghi nhận cảm xúc trong 7 ngày khác nhau',
    category: 'JOURNAL',
    progressKey: 'journalDays',
    requirement: 'Ghi nhật ký trong 7 ngày',
    targetProgress: 7,
  },
  {
    id: 'jn_days_30',
    emoji: '🌻',
    title: 'Người bạn đồng hành cảm xúc',
    description: 'Đã ghi nhận cảm xúc trong 30 ngày',
    category: 'JOURNAL',
    progressKey: 'journalDays',
    requirement: 'Ghi nhật ký trong 30 ngày',
    targetProgress: 30,
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // JOURNEY — Hành trình đồng hành
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'jy_streak_3',
    emoji: '🌤',
    title: 'Ba ngày đầu tiên',
    description: 'Đồng hành cùng khu vườn 3 ngày liên tiếp',
    category: 'JOURNEY',
    progressKey: 'streakDays',
    requirement: 'Dùng app 3 ngày liên tiếp',
    targetProgress: 3,
  },
  {
    id: 'jy_streak_7',
    emoji: '⭐',
    title: 'Một tuần đồng hành',
    description: 'Đã không bỏ lỡ một ngày nào trong tuần',
    category: 'JOURNEY',
    progressKey: 'streakDays',
    requirement: 'Dùng app 7 ngày liên tiếp',
    targetProgress: 7,
  },
  {
    id: 'jy_streak_30',
    emoji: '🌕',
    title: 'Người bạn đồng hành',
    description: 'Trọn một tháng không rời khu vườn',
    category: 'JOURNEY',
    progressKey: 'streakDays',
    requirement: 'Dùng app 30 ngày liên tiếp',
    targetProgress: 30,
  },
  {
    id: 'jy_streak_100',
    emoji: '🏡',
    title: 'Khu vườn là nhà',
    description: '100 ngày — khu vườn đã trở thành một phần của bạn',
    category: 'JOURNEY',
    progressKey: 'streakDays',
    requirement: 'Dùng app 100 ngày liên tiếp',
    targetProgress: 100,
  },
];

// ── Labels hiển thị ───────────────────────────────────────────────────────────
export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  TREE_CARE: 'Chăm sóc cây',
  WELLNESS:  'Vườn Yên',
  JOURNAL:   'Nhật ký',
  JOURNEY:   'Hành trình',
};

export const CATEGORY_EMOJIS: Record<AchievementCategory, string> = {
  TREE_CARE: '🌿',
  WELLNESS:  '🧘',
  JOURNAL:   '📝',
  JOURNEY:   '🌟',
};
