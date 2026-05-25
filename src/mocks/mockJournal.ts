import { MoodJournal } from '../types/journal.type';

export const mockJournals: MoodJournal[] = [
  {
    id: 'j_1',
    mood: 'GOOD',
    note: 'Hôm nay trời đẹp, mình đã ra ngoài đi dạo.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'j_2',
    mood: 'NORMAL',
    note: 'Hơi mệt chút nhưng không sao.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];
