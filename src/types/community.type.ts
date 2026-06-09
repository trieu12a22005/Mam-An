// ── Community types ────────────────────────────────────────────────────────────

export type CommunityPostVisibility = 'PUBLIC' | 'ANONYMOUS';
export type CommunityPostStatus = 'VISIBLE' | 'REPORTED' | 'HIDDEN' | 'REJECTED';
export type CommunityReactionType = 'LOVE' | 'LIGHT' | 'SPROUT' | 'HUG' | 'THANKS';

export interface CommunityReactionCounts {
  LOVE: number;
  LIGHT: number;
  SPROUT: number;
  HUG: number;
  THANKS: number;
}

export interface CommunityPost {
  id: string;
  content?: string | null;
  imageUrl?: string | null;
  visibility: CommunityPostVisibility;
  status?: CommunityPostStatus;
  displayName: string;
  avatarUrl?: string | null;
  taskTitle?: string | null;
  createdAt: string;
  reactionCounts: CommunityReactionCounts;
  myReactions?: CommunityReactionType[];
}

export interface CommunityFeedResponse {
  data: CommunityPost[];
  pagination: { page: number; limit: number; total: number };
}
