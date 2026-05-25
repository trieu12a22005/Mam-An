import { CareTask } from '../types/task.type';

export const SAMPLE_TASKS: CareTask[] = [
  {
    id: 't1',
    title: 'Uống nước',
    description: 'Uống 1 ly nước đầy để nạp năng lượng',
    rewardResource: 'WATER',
    rewardAmount: 1,
    growthReward: 5,
    verifyType: 'SELF_CONFIRM',
    completedToday: false,
  },
  {
    id: 't2',
    title: 'Phơi nắng 15p',
    description: 'Ra ngoài đi dạo và hít thở',
    rewardResource: 'SUNLIGHT',
    rewardAmount: 1,
    growthReward: 10,
    verifyType: 'TIMER',
    durationSeconds: 900,
    completedToday: false,
  },
  {
    id: 't3',
    title: 'Nấu ăn',
    description: 'Nấu một bữa ăn thật ngon',
    rewardResource: 'FERTILIZER',
    rewardAmount: 1,
    growthReward: 15,
    verifyType: 'OPTIONAL_PHOTO',
    completedToday: false,
  },
];
