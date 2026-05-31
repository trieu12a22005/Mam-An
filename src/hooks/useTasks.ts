import { useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/task.service';
import { CareTask } from '../types/task.type';

export const useTasks = () => {
  const qc = useQueryClient();
  /** Set các taskId đang trong quá trình xử lý — chặn gọi song song */
  const processingIds = useRef<Set<string>>(new Set());

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', new Date().toDateString()], // key đổi mỗi ngày → tự invalidate
    queryFn: taskService.getTasks,
    staleTime: (() => {
      // Cache hết hạn đúng lúc 0:00 ngày hôm sau
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      return midnight.getTime() - now.getTime();
    })(),
  });

  /**
   * Hoàn thành task — optimistic update, rollback nếu API fail.
   * Trả về task đã complete để caller cập nhật cây ảo.
   * Chặn chạy song song: nếu task đang được xử lý → bỏ qua ngay.
   */
  const completeTask = useCallback(
    async (taskId: string, virtualPlantId?: string): Promise<CareTask | null> => {
      const target = tasks.find((t) => t.id === taskId);
      // Bỏ qua nếu đã hoàn thành hoặc đang trong quá trình xử lý
      if (!target || target.completedToday) return null;
      if (processingIds.current.has(taskId)) return null;

      processingIds.current.add(taskId);

      // Optimistic update
      const queryKey = ['tasks', new Date().toDateString()];
      qc.setQueryData<CareTask[]>(queryKey, (prev = []) =>
        prev.map((t) => (t.id === taskId ? { ...t, completedToday: true } : t)),
      );

      try {
        await taskService.completeTask(taskId, virtualPlantId);
        return { ...target, completedToday: true };
      } catch {
        // Rollback nếu API fail
        qc.setQueryData<CareTask[]>(queryKey, (prev = []) =>
          prev.map((t) => (t.id === taskId ? { ...t, completedToday: false } : t)),
        );
        return null;
      } finally {
        // Luôn giải phóng lock sau khi xong (dù thành công hay thất bại)
        processingIds.current.delete(taskId);
      }
    },
    [tasks, qc],
  );

  const pendingTasks = tasks.filter((t) => !t.completedToday);
  const completedTasks = tasks.filter((t) => t.completedToday);

  return { tasks, pendingTasks, completedTasks, isLoading, completeTask };
};
