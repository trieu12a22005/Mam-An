import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/task.service';
import { CareTask } from '../types/task.type';

export const useTasks = () => {
  const qc = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getTasks,
    staleTime: 60_000,
  });

  /**
   * Hoàn thành task — optimistic update, rollback nếu API fail.
   * Trả về task đã complete để caller cập nhật cây ảo.
   */
  const completeTask = useCallback(
    async (taskId: string, virtualPlantId?: string): Promise<CareTask | null> => {
      const target = tasks.find((t) => t.id === taskId);
      if (!target || target.completedToday) return null;

      // Optimistic update
      qc.setQueryData<CareTask[]>(['tasks'], (prev = []) =>
        prev.map((t) => (t.id === taskId ? { ...t, completedToday: true } : t)),
      );

      try {
        await taskService.completeTask(taskId, virtualPlantId);
      } catch {
        // Rollback
        qc.setQueryData<CareTask[]>(['tasks'], (prev = []) =>
          prev.map((t) => (t.id === taskId ? { ...t, completedToday: false } : t)),
        );
        return null;
      }

      return { ...target, completedToday: true };
    },
    [tasks, qc],
  );

  const pendingTasks = tasks.filter((t) => !t.completedToday);
  const completedTasks = tasks.filter((t) => t.completedToday);

  return { tasks, pendingTasks, completedTasks, isLoading, completeTask };
};
