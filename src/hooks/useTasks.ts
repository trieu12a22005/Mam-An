import { useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService, CompleteTaskResponse } from '../services/task.service';
import { CareTask, SelectedImage } from '../types/task.type';
import { ShareBonusInfo } from '../components/task/TaskCompleteModal';

export const useTasks = () => {
  const qc = useQueryClient();
  const processingIds = useRef<Set<string>>(new Set());

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', new Date().toDateString()],
    queryFn: taskService.getTasks,
    staleTime: (() => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      return midnight.getTime() - now.getTime();
    })(),
  });

  /**
   * Hoàn thành task có hỗ trợ ảnh và chia sẻ cộng đồng.
   * - PHOTO_REQUIRED: bắt buộc có photo, ném lỗi nếu thiếu.
   * - PHOTO_OPTIONAL: ảnh là tùy chọn.
   * - SELF_CONFIRM / TIMER: không cần ảnh.
   * Nếu share có ảnh → backend tự cộng +5 tài nguyên và trả shareBonus.
   * Trả về { response, shareBonus } hoặc null.
   */
  const completeTask = useCallback(
    async (input: {
      task: CareTask;
      note?: string;
      photo?: SelectedImage;
      shareToCommunity?: boolean;
      visibility?: 'PUBLIC' | 'ANONYMOUS';
      virtualPlantId?: string;
    }): Promise<{ response: CompleteTaskResponse; shareBonus?: ShareBonusInfo } | null> => {
      const { task, note, photo, shareToCommunity, visibility, virtualPlantId } = input;

      if (task.completedToday) return null;
      if (processingIds.current.has(task.id)) return null;

      // Kiểm tra ảnh bắt buộc
      if (task.verifyType === 'PHOTO_REQUIRED' && !photo) {
        throw new Error('Nhiệm vụ này cần một bức ảnh để hoàn thành.');
      }

      processingIds.current.add(task.id);

      // Optimistic update — đánh dấu đã hoàn thành ngay lập tức
      const queryKey = ['tasks', new Date().toDateString()];
      qc.setQueryData<CareTask[]>(queryKey, (prev = []) =>
        prev.map((t) => (t.id === task.id ? { ...t, completedToday: true } : t)),
      );

      try {
        const result = await taskService.completeTaskWithFormData({
          careTaskId: task.id,
          virtualPlantId,
          note,
          photo,
          shareToCommunity,
          visibility,
        });

        // Làm mới dữ liệu liên quan
        qc.invalidateQueries({ queryKey: ['virtualPlant'] });
        qc.invalidateQueries({ queryKey: ['plantUpdates'] });
        if (result.communityPost) {
          qc.invalidateQueries({ queryKey: ['communityPosts'] });
        }

        // Lấy shareBonus trực tiếp từ response backend (backend đã tự cộng tài nguyên)
        const shareBonus: ShareBonusInfo | undefined = result.shareBonus
          ? { resourceType: result.shareBonus.resourceType as any, bonusAmount: result.shareBonus.bonusAmount }
          : undefined;

        return { response: result, shareBonus };
      } catch (err) {
        // Rollback nếu API fail
        qc.setQueryData<CareTask[]>(queryKey, (prev = []) =>
          prev.map((t) => (t.id === task.id ? { ...t, completedToday: false } : t)),
        );
        throw err;
      } finally {
        processingIds.current.delete(task.id);
      }
    },
    [tasks, qc],
  );

  const pendingTasks = tasks.filter((t) => !t.completedToday);
  const completedTasks = tasks.filter((t) => t.completedToday);

  return { tasks, pendingTasks, completedTasks, isLoading, completeTask };
};
