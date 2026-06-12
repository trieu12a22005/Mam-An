export type PlanCode =
  | "FREE"
  | "VIRTUAL_PLUS"
  | "SUNFLOWER_COMPANION"
  | "SUNFLOWER_PREMIUM_GIFT";

export type PlanType = "FREE" | "SUBSCRIPTION" | "ONE_TIME";

export type PlantMode = "VIRTUAL" | "REAL";

export interface ServicePlan {
  id: string;
  code: PlanCode;
  name: string;
  description?: string;
  type: PlanType;
  plantMode: PlantMode;
  price: number;
  durationDays?: number;

  includedSongs: number;
  maxRedeemSongs: number;

  hasAiJournalReply: boolean;
  hasMoodAnalytics: boolean;
  hasMoodTaskSuggest: boolean;
  hasRealPlant: boolean;
  hasFarmerUpdates: boolean;
  updateIntervalDays?: number;
  includesShipping: boolean;
  hasPotCustom: boolean;
  hasGiftCard: boolean;
  hasGiftPackaging: boolean;

  isActive: boolean;
  sortOrder: number;
}

export interface UserEntitlements {
  planCode: PlanCode;
  planName: string;
  subscriptionEndsAt: string | null;
  hasRealPlantOrder: boolean;
  
  canUseAiJournalReply: boolean;
  canViewMoodAnalytics: boolean;
  canUseMoodTaskSuggest: boolean;
  includedSongs: number;
  maxRedeemSongs: number;
  hasRealPlant: boolean;
  hasFarmerUpdates: boolean;
  includesShipping: boolean;
  hasPotCustom: boolean;
  hasGiftCard: boolean;
  hasGiftPackaging: boolean;
}
