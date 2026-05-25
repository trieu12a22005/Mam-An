import axiosClient from '../api/axiosClient';
import { MoodJournal, MoodLevel } from '../types/journal.type';

export const journalService = {
  /** GET /mood-journals/my */
  getMyJournals: async (): Promise<MoodJournal[]> => {
    const res = await axiosClient.get<{ data: MoodJournal[] }>('/mood-journals/my');
    return res.data.data;
  },

  /** POST /mood-journals */
  createJournal: async (mood: MoodLevel, note: string): Promise<MoodJournal> => {
    const res = await axiosClient.post<{ data: MoodJournal }>('/mood-journals', {
      mood,
      note: note.trim() || undefined,
    });
    return res.data.data;
  },
};
