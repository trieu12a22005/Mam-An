import axiosClient from '../api/axiosClient';
import { CareTask, SelectedImage } from '../types/task.type';

interface ApiCareTask {
  id: string;
  title: string;
  description?: string;
  type: string;
  rewardResource: string;
  rewardAmount: number;
  growthReward: number;
  verifyType: CareTask['verifyType'];
  durationSeconds?: number;
  isActive: boolean;
  isShareable?: boolean;
  characterImageUrl?: string;
}

interface ApiCareTaskLog {
  careTaskId: string;
}

const mapTask = (apiTask: ApiCareTask, completedIds: Set<string>): CareTask => ({
  id: apiTask.id,
  title: apiTask.title,
  description: apiTask.description,
  rewardResource: apiTask.rewardResource as CareTask['rewardResource'],
  rewardAmount: apiTask.rewardAmount,
  growthReward: apiTask.growthReward,
  verifyType: apiTask.verifyType,
  durationSeconds: apiTask.durationSeconds,
  completedToday: completedIds.has(apiTask.id),
  isShareable: apiTask.isShareable ?? false,
  characterImageUrl: apiTask.characterImageUrl,
});

export interface CompleteTaskInput {
  careTaskId: string;
  virtualPlantId?: string;
  note?: string;
  photo?: SelectedImage;
  shareToCommunity?: boolean;
  visibility?: 'PUBLIC' | 'ANONYMOUS';
}

export interface CompleteTaskResponse {
  taskLog: any;
  updatedPlant: any;
  communityPost: any | null;
  shareBonus?: { resourceType: string; bonusAmount: number } | null;
}

export const taskService = {
  /** Lấy danh sách task + logs hôm nay, merge thành CareTask[] */
  getTasks: async (): Promise<CareTask[]> => {
    const [tasksRes, logsRes] = await Promise.all([
      axiosClient.get<{ data: ApiCareTask[] }>('/care-tasks'),
      axiosClient.get<{ data: ApiCareTaskLog[] }>('/care-tasks/logs/my'),
    ]);

    const completedIds = new Set(logsRes.data.data.map((l) => l.careTaskId));
    return tasksRes.data.data.map((t) => mapTask(t, completedIds));
  },

  /**
   * POST /care-tasks/logs — hoàn thành task (hỗ trợ ảnh + chia sẻ cộng đồng)
   * Gửi multipart/form-data nếu có ảnh, JSON thuần nếu không có.
   */
  completeTaskWithFormData: async (input: CompleteTaskInput): Promise<CompleteTaskResponse> => {
    const { careTaskId, virtualPlantId, note, photo, shareToCommunity, visibility } = input;

    const formData = new FormData();
    formData.append('careTaskId', careTaskId);
    if (virtualPlantId) formData.append('virtualPlantId', virtualPlantId);
    if (note) formData.append('note', note);
    if (shareToCommunity !== undefined) formData.append('shareToCommunity', String(shareToCommunity));
    if (visibility) formData.append('visibility', visibility);

    if (photo) {
      formData.append('photo', {
        uri: photo.uri,
        name: photo.name,
        type: photo.type,
      } as any);
    }

    const res = await axiosClient.post<{ message: string; metadata: CompleteTaskResponse }>(
      '/care-tasks/logs',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );

    return res.data.metadata;
  },

  /** Backward-compat: hoàn thành task đơn giản không có ảnh */
  completeTask: async (careTaskId: string, virtualPlantId?: string): Promise<CompleteTaskResponse> => {
    return taskService.completeTaskWithFormData({ careTaskId, virtualPlantId });
  },
};
