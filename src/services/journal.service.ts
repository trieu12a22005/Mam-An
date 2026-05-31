import axiosClient from '../api/axiosClient';
import { MoodJournal, MoodType } from '../types/journal.type';

export const journalService = {
  /** Lấy danh sách nhật ký từ server */
  getMyJournals: async (page = 1, limit = 20): Promise<MoodJournal[]> => {
    const response = await axiosClient.get('/mood-journals/my', {
      params: { page, limit }
    });
    // Response từ paginated route sẽ có dạng: { data: [...], meta: {...} }
    return response.data?.data || response.data || [];
  },

  /** Tạo nhật ký mới với AI reply từ server */
  createJournal: async (mood: MoodType, note: string): Promise<MoodJournal> => {
    const response = await axiosClient.post('/mood-journals', {
      mood,
      note: note.trim() || undefined,
    });
    // API trả về { message: "...", metadata: { id, mood, note, aiReply, createdAt } }
    return response.data?.metadata || response.data;
  },
};
