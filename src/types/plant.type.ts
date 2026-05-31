export type PlantStatus = "SEED" | "SPROUT" | "GROWING" | "BUDDING" | "BLOOMING" | "RESTING";

export type PlantResourceType = "WATER" | "SUNLIGHT" | "FERTILIZER" | "AIR" | "LOVE" | "DEW";

export interface VirtualPlant {
  id: string;
  nickname?: string;
  status: PlantStatus;       // Trạng thái backend (do farmer cập nhật)
  growthPoint: number;       // Tích lũy cho thành tích / streak
  streakCount: number;
  createdAt: string;         // Dùng để tính giai đoạn ảo theo thời gian
  lastCaredAt?: string;      // Lần chăm sóc gần nhất

  // ── Tài nguyên tích lũy (không reset theo ngày) ──────────────────────────
  waterAmount: number;
  sunlightAmount: number;
  fertilizerAmount: number;
  airAmount: number;
  loveAmount: number;
  dewAmount: number;

  // Computed by service — for backward compat with ResourceGrid
  resources: Record<PlantResourceType, number>;

  flowerType: {
    id: string;
    name: string;
    imageUrl?: string;
    stageImages?: Partial<Record<PlantStatus, string>>;   // Ảnh riêng theo giai đoạn
    stageDurations?: Partial<Record<PlantStatus, number>>; // Số ngày mỗi giai đoạn
  };
  realPlant?: {
    id: string;
    code: string;
    status: PlantStatus;
  };
}

export interface PlantUpdate {
  id: string;
  imageUrl: string;
  status: PlantStatus;
  note?: string;
  healthNote?: string;
  createdAt: string;
}
