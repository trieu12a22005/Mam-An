import { PlantResourceType } from "./plant.type";

export interface CareTask {
  id: string;
  title: string;
  description?: string;
  rewardResource: PlantResourceType;
  rewardAmount: number;
  growthReward: number;
  verifyType: "SELF_CONFIRM" | "TIMER" | "OPTIONAL_PHOTO";
  durationSeconds?: number;
  completedToday: boolean;
  characterImageUrl?: string;   // URL ảnh nhân vật riêng của task (Cloudinary)
}
