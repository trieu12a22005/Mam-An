import axiosClient from './axiosClient';

export interface CalmMusicTrack {
  id: string;
  titleVi: string;        // Tên tiếng Việt hiển thị
  hasLyrics: boolean;     // true = có lời, false = không lời
  category: string;       // rain | nature | piano | lofi | general
  publicUrl: string;      // URL stream trực tiếp
  storagePath: string;
  originalName?: string;
  isFree: boolean;        // true = nghe tự do; false = cần đổi điểm
  pointCost: number;      // Số điểm cần (mặc định 50)
  isUnlocked: boolean;    // true nếu user đã unlock hoặc bài là free
  createdAt: string;
}

export interface UserPointsInfo {
  totalPoints: number;
  spentPoints: number;
  availablePoints: number;
  unlockedCount: number;
  maxRedeemSongs: number;
  currentPlan: { name: string; code: string; maxRedeemSongs: number } | null;
  recentUnlocks: Array<{
    id: string;
    pointsSpent: number;
    unlockedAt: string;
    track: { id: string; titleVi: string; category: string };
  }>;
}

// ── Lấy danh sách nhạc (kèm isUnlocked của user hiện tại) ─────────────────────
export async function fetchCalmMusicTracks(params?: {
  category?: string;
  hasLyrics?: boolean;
}): Promise<CalmMusicTrack[]> {
  const { data } = await axiosClient.get<{ data: CalmMusicTrack[]; total: number }>(
    '/calm-music',
    { params }
  );
  return data.data ?? [];
}

// ── Lấy thông tin điểm của user đang đăng nhập ────────────────────────────────
export async function fetchMyPoints(): Promise<UserPointsInfo> {
  const { data } = await axiosClient.get<{ data: UserPointsInfo }>('/points/me');
  return data.data;
}

// ── Mở khóa bài hát bằng điểm ──────────────────────────────────────────────────
export async function unlockTrack(trackId: string): Promise<{
  remainingPoints: number;
}> {
  const { data } = await axiosClient.post(`/points/unlock/${trackId}`);
  return data.data;
}
