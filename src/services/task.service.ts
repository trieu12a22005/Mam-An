import axiosClient from '../api/axiosClient';
import { CareTask } from '../types/task.type';

interface ApiCareTask {
  id: string;
  title: string;
  description?: string;
  type: string;
  rewardResource: string;
  rewardAmount: number;
  growthReward: number;
  verifyType: 'SELF_CONFIRM' | 'TIMER' | 'OPTIONAL_PHOTO';
  durationSeconds?: number;
  isActive: boolean;
}

interface CareTaskLog {
  careTaskId: string;
}

// Map backend response → mobile CareTask type với completedToday flag
const mapTask = (apiTask: ApiCareTask, completedIds: Set<string>): CareTask => ({
  id: apiTask.id,
  title: apiTask.title,
  description: apiTask.description,
  type: apiTask.type as CareTask['type'],
  rewardResource: apiTask.rewardResource as CareTask['rewardResource'],
  rewardAmount: apiTask.rewardAmount,
  growthReward: apiTask.growthReward,
  verifyType: apiTask.verifyType,
  durationSeconds: apiTask.durationSeconds,
  completedToday: completedIds.has(apiTask.id),
});

export const taskService = {
  /** Lấy danh sách task + logs hôm nay, merge thành CareTask[] */
  getTasks: async (): Promise<CareTask[]> => {
    const [tasksRes, logsRes] = await Promise.all([
      axiosClient.get<{ data: ApiCareTask[] }>('/care-tasks'),
      axiosClient.get<{ data: CareTaskLog[] }>('/care-tasks/logs/my'),
    ]);

    const completedIds = new Set(logsRes.data.data.map((l) => l.careTaskId));
    return tasksRes.data.data.map((t) => mapTask(t, completedIds));
  },

  /** POST /care-tasks/logs — hoàn thành task */
  completeTask: async (careTaskId: string, virtualPlantId?: string): Promise<void> => {
    await axiosClient.post('/care-tasks/logs', { careTaskId, virtualPlantId });
  },
};
