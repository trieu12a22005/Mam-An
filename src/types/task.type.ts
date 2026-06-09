import { PlantResourceType } from "./plant.type";

export interface CareTask {
  id: string;
  title: string;
  description?: string;
  rewardResource: PlantResourceType;
  rewardAmount: number;
  growthReward: number;
  verifyType: "SELF_CONFIRM" | "TIMER" | "PHOTO_REQUIRED" | "PHOTO_OPTIONAL";
  durationSeconds?: number;
  completedToday: boolean;
  isShareable?: boolean;
  characterImageUrl?: string;
}

export interface CareTaskLog {
  id: string;
  careTaskId: string;
  note?: string;
  photoUrl?: string;
  sharedToCommunity: boolean;
  completedAt: string;
}

/** Ảnh user đã chọn / chụp */
export interface SelectedImage {
  uri: string;
  name: string;
  type: string; // "image/jpeg" | "image/png" | "image/webp"
}

