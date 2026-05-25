export type PlantStatus = "SEED" | "SPROUT" | "GROWING" | "BUDDING" | "BLOOMING" | "RESTING";

export type PlantResourceType = "WATER" | "SUNLIGHT" | "FERTILIZER" | "AIR" | "LOVE" | "DEW";

export interface VirtualPlant {
  id: string;
  nickname?: string;
  status: PlantStatus;
  growthPoint: number;
  maxGrowthPoint: number;
  streakCount: number;
  resources: Record<PlantResourceType, number>;
  flowerType: {
    id: string;
    name: string;
    imageUrl?: string;
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
