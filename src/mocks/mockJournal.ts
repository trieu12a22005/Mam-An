import { MoodJournal } from '../types/journal.type';

export const mockJournals: MoodJournal[] = [
  {
    id: 'j_1',
    mood: 'HAPPY',
    note: 'Hôm nay trời đẹp, mình đã ra ngoài đi dạo.',
    aiReply: 'Cây nhận được một chút ánh sáng từ niềm vui của bạn.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'j_2',
    mood: 'NORMAL',
    note: 'Hơi mệt chút nhưng không sao.',
    aiReply: 'Một ngày bình thường cũng đáng được ghi nhận.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'j_3',
    mood: 'SAD',
    note: 'Buồn vì một chuyện ở trường.',
    aiReply: 'Buồn cũng không sao. Bạn không cần phải vượt qua mọi thứ một mình.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'j_4',
    mood: 'CALM',
    note: 'Ngồi nghe nhạc chill buổi tối.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'j_5',
    mood: 'ANXIOUS',
    note: 'Lo lắng về kỳ thi sắp tới.',
    aiReply: 'Hãy thử thở chậm lại một chút. Bạn đang làm tốt hơn bạn nghĩ.',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'j_6',
    mood: 'TIRED',
    note: 'Thức khuya quá, hôm nay kiệt sức.',
    aiReply: 'Cảm ơn bạn đã ghi lại cảm xúc của mình. Hôm nay chỉ cần một việc nhỏ thôi cũng đủ.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
