import { FocusSessionOption, FocusSessionType } from '../types/focusSession.type';

export const FOCUS_SESSION_OPTIONS: FocusSessionOption[] = [
  {
    type: 'BREATHING',
    label: 'Thở cùng cây',
    description: 'Một phút để thở chậm lại.',
    durations: [60, 180],
    rewardResource: 'AIR',
    rewardAmount: 10,
    growthReward: 5,
  },
  {
    type: 'RELAX',
    label: 'Thư giãn',
    description: 'Ngồi yên cùng cây và nghe một bản nhạc nhẹ.',
    durations: [300, 600],
    rewardResource: 'DEW',
    rewardAmount: 15,
    growthReward: 8,
  },
  {
    type: 'STUDY',
    label: 'Học cùng cây',
    description: 'Tập trung học hoặc làm việc trong một khoảng thời gian nhỏ.',
    durations: [900, 1500, 3000],
    rewardResource: 'SUNLIGHT',
    rewardAmount: 25,
    growthReward: 15,
  },
];

const DURATION_LABELS: Record<number, string> = {
  60:   '1 phút',
  180:  '3 phút',
  300:  '5 phút',
  600:  '10 phút',
  900:  '15 phút',
  1500: '25 phút',
  3000: '50 phút',
};

export function formatDurationLabel(seconds: number): string {
  return DURATION_LABELS[seconds] ?? `${Math.floor(seconds / 60)} phút`;
}

export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const SESSION_MESSAGES: Record<FocusSessionType, string[]> = {
  BREATHING: [
    'Hít vào thật chậm, thở ra nhẹ nhàng. Cây đang ở đây cùng bạn.',
    'Chỉ cần thở. Không cần nghĩ gì thêm.',
    'Mỗi hơi thở nhẹ đều đưa bạn về gần hiện tại hơn.',
    'Cây đang lắng nghe nhịp thở của bạn đấy.',
  ],
  RELAX: [
    'Không cần vội. Chỉ cần ngồi cùng cây một chút thôi.',
    'Khoảng lặng này cũng là một dạng chăm sóc bản thân.',
    'Cứ ngồi yên. Cây đang ở bên cạnh bạn.',
    'Không cần làm gì. Chỉ cần ở đây thôi cũng đủ rồi.',
  ],
  STUDY: [
    'Tập trung từng chút một. Cây sẽ lớn lên cùng thời gian bạn dành cho mình.',
    'Không cần hoàn hảo, chỉ cần ở lại với việc đang làm thêm một chút.',
    'Mỗi phút bạn tập trung, cây cũng nhận thêm một tia sáng nhỏ.',
    'Mình cùng đi chậm thôi, từng phút một cũng đáng quý.',
    'Cây đang ở đây cùng bạn trong phiên tập trung này.',
  ],
};

/** Lấy message ngẫu nhiên cho từng chế độ */
export function getRandomFocusMessage(type: FocusSessionType): string {
  const pool = SESSION_MESSAGES[type];
  return pool[Math.floor(Math.random() * pool.length)]!;
}

/** Backward-compat */
export function getFocusSessionMessage(type: FocusSessionType): string {
  return getRandomFocusMessage(type);
}

const COMPLETION_MESSAGES: Record<FocusSessionType, string> = {
  BREATHING: 'Cảm ơn bạn đã dành một phút để thở chậm lại. Cây nhận được một làn không khí dịu nhẹ.',
  RELAX:     'Khoảng lặng nhỏ này cũng rất đáng quý. Cây nhận được một giọt sương bình yên.',
  STUDY:     'Bạn đã tập trung cùng cây thêm một chút. Cây nhận được ánh sáng từ sự cố gắng của bạn.',
};

export function getCompletionMessage(type: FocusSessionType): string {
  return COMPLETION_MESSAGES[type];
}

const TYPE_EMOJIS: Record<FocusSessionType, string> = {
  BREATHING: '🌬️',
  RELAX:     '🌿',
  STUDY:     '☀️',
};

export function getFocusSessionEmoji(type: FocusSessionType): string {
  return TYPE_EMOJIS[type];
}

/** Ví dụ: "Phiên thở cùng cây 3 phút" */
export function formatSessionTitle(type: FocusSessionType, durationSeconds: number): string {
  const label = FOCUS_SESSION_OPTIONS.find((o) => o.type === type)?.label ?? type;
  return `Phiên ${label.toLowerCase()} · ${formatDurationLabel(durationSeconds)}`;
}
