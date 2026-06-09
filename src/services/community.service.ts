import axiosClient from '../api/axiosClient';
import {
  CommunityPost,
  CommunityFeedResponse,
  CommunityReactionType,
} from '../types/community.type';

// Re-export legacy type so old import `CommunityPost` from community.service still works
export type { CommunityPost };
export type ReactionType = CommunityReactionType;

export const communityService = {
  /** GET /community/posts */
  getPosts: async (page = 1, limit = 20): Promise<CommunityFeedResponse> => {
    const res = await axiosClient.get<{ message: string; metadata: CommunityFeedResponse }>(
      '/community/posts',
      { params: { page, limit } },
    );
    // Support both response shapes (old: { data, pagination } / new: { metadata: { data, pagination } })
    const body = res.data;
    if ((body as any).metadata) return (body as any).metadata as CommunityFeedResponse;
    return body as any as CommunityFeedResponse;
  },

  /** POST /community/posts/:id/reactions — toggle */
  toggleReaction: async (
    postId: string,
    type: CommunityReactionType,
  ): Promise<{ toggled: boolean; reactionCounts: CommunityPost['reactionCounts']; myReactions: CommunityReactionType[] }> => {
    const res = await axiosClient.post<{ message: string; metadata: any }>(
      `/community/posts/${postId}/reactions`,
      { type },
    );
    return res.data.metadata ?? {};
  },

  /** POST /community/posts/:id/report */
  reportPost: async (postId: string, input: { reason: string; note?: string }): Promise<void> => {
    await axiosClient.post(`/community/posts/${postId}/report`, input);
  },

  /** DELETE /community/posts/:id (owner soft-delete) */
  deletePost: async (postId: string): Promise<void> => {
    await axiosClient.delete(`/community/posts/${postId}`);
  },
};
