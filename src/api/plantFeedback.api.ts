import axiosClient from './axiosClient';

export interface PlantReactionSummary {
  data: Record<string, number>; // { "❤️": 3, "🌸": 1 }
  myReaction: string | null;
  total: number;
}

export interface PlantComment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
}

export const plantFeedbackApi = {
  /** Lấy tổng hợp reactions của cây */
  getReactions: async (plantId: string): Promise<PlantReactionSummary> => {
    const res = await axiosClient.get<PlantReactionSummary>(`/real-plants/${plantId}/reactions`);
    return res.data;
  },

  /** Thả / đổi / bỏ cảm xúc */
  react: async (plantId: string, emoji: string) => {
    const res = await axiosClient.post(`/real-plants/${plantId}/react`, { emoji });
    return res.data;
  },

  /** Lấy danh sách bình luận */
  getComments: async (plantId: string, page = 1): Promise<{ data: PlantComment[]; meta: any }> => {
    const res = await axiosClient.get(`/real-plants/${plantId}/comments`, { params: { page, limit: 20 } });
    return res.data;
  },

  /** Gửi bình luận */
  addComment: async (plantId: string, content: string) => {
    const res = await axiosClient.post(`/real-plants/${plantId}/comments`, { content });
    return res.data;
  },
  deleteComment: async (plantId: string, commentId: string) => {
    const res = await axiosClient.delete(`/real-plants/${plantId}/comments/${commentId}`);
    return res.data;
  },
};
