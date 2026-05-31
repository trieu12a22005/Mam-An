import { MoodType } from '../types/journal.type';
import { ImageSourcePropType } from 'react-native';

export interface MoodOption {
  value: MoodType;
  label: string;
  description: string;
  icon: ImageSourcePropType;
  color: string;
  softMessage: string;
}

// Icon assets – nếu build báo lỗi "cannot find module", hãy đảm bảo
// các file .png tồn tại trong  assets/icon/  với đúng tên bên dưới.
const happyIcon = require('../../assets/icon/happy.png');
const calmIcon = require('../../assets/icon/calm.png');
const normalIcon = require('../../assets/icon/normal.png');
const sadIcon = require('../../assets/icon/sad.png');
// ⚠️ File hiện tại đặt tên "axious.png" (thiếu chữ n).
//    Nếu bạn đổi tên file thành anxious.png thì sửa dòng dưới lại.
const anxiousIcon = require('../../assets/icon/axious.png');
const tiredIcon = require('../../assets/icon/tired.png');

export const MOOD_OPTIONS: MoodOption[] = [
  {
    value: 'HAPPY',
    label: 'Vui',
    description: 'Hôm nay có điều gì đó làm bạn mỉm cười.',
    icon: happyIcon,
    color: '#FFD166',      // vàng ấm
    softMessage: 'Cây nhận được một chút ánh sáng từ niềm vui của bạn.',
  },
  {
    value: 'CALM',
    label: 'Bình yên',
    description: 'Bạn đang cảm thấy nhẹ nhàng hơn.',
    icon: calmIcon,
    color: '#83C5BE',      // xanh ngọc dịu
    softMessage: 'Một làn gió dịu đã ghé qua khu vườn nhỏ.',
  },
  {
    value: 'NORMAL',
    label: 'Bình thường',
    description: 'Một ngày không quá vui, không quá buồn.',
    icon: normalIcon,
    color: '#A8DADC',      // xanh pastel
    softMessage: 'Bình thường cũng là một cảm xúc đáng được ghi nhận.',
  },
  {
    value: 'SAD',
    label: 'Buồn',
    description: 'Hôm nay bạn thấy chùng xuống một chút.',
    icon: sadIcon,
    color: '#B5C9D5',      // xanh xám nhẹ
    softMessage: 'Buồn cũng không sao. Cây vẫn ở đây cùng bạn.',
  },
  {
    value: 'ANXIOUS',
    label: 'Lo lắng',
    description: 'Bạn thấy hơi bất an hoặc căng thẳng.',
    icon: anxiousIcon,
    color: '#E8C8A0',      // cam nhạt ấm
    softMessage: 'Hãy thử thở chậm lại một chút. Bạn không cần phải vội.',
  },
  {
    value: 'TIRED',
    label: 'Mệt mỏi',
    description: 'Bạn không còn nhiều năng lượng hôm nay.',
    icon: tiredIcon,
    color: '#C9B8D9',      // tím lavender nhẹ
    softMessage: 'Hôm nay nghỉ một chút cũng được. Cây vẫn đang chờ bạn.',
  },
];

/** Tìm nhanh MoodOption theo value */
export const getMoodOption = (mood: MoodType): MoodOption | undefined =>
  MOOD_OPTIONS.find((m) => m.value === mood);
