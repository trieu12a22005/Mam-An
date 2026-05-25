import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { plantService } from '../services/plant.service';
import { VirtualPlant, PlantResourceType, PlantStatus } from '../types/plant.type';
import { CareTask } from '../types/task.type';
import { PLANT_STAGES } from '../constants/plantStages';

// ── Stage auto-detection ─────────────────────────────────────────────────────
const deriveStage = (growthPoint: number): PlantStatus => {
  const stages: { status: PlantStatus; threshold: number }[] = [
    { status: 'BLOOMING', threshold: PLANT_STAGES.BLOOMING.threshold },
    { status: 'BUDDING',  threshold: PLANT_STAGES.BUDDING.threshold },
    { status: 'GROWING',  threshold: PLANT_STAGES.GROWING.threshold },
    { status: 'SPROUT',   threshold: PLANT_STAGES.SPROUT.threshold },
    { status: 'SEED',     threshold: PLANT_STAGES.SEED.threshold },
  ];
  for (const s of stages) {
    if (growthPoint >= s.threshold) return s.status;
  }
  return 'SEED';
};

// ── Hook: cây ảo ─────────────────────────────────────────────────────────────
export const useVirtualPlant = () => {
  const qc = useQueryClient();

  const { data: plant, isLoading, error } = useQuery({
    queryKey: ['virtualPlant'],
    queryFn: plantService.getVirtualPlant,
    staleTime: 5 * 60 * 1000,
    retry: (failCount, err: Error) => {
      if (err.message === 'NO_PLANT') return false; // Không retry nếu chưa có cây
      return failCount < 2;
    },
  });

  /** Tăng tài nguyên (optimistic update) */
  const addResource = useCallback(
    (resourceType: PlantResourceType, amount: number) => {
      qc.setQueryData<VirtualPlant>(['virtualPlant'], (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          resources: {
            ...prev.resources,
            [resourceType]: (prev.resources[resourceType] ?? 0) + amount,
          },
        };
      });
    },
    [qc],
  );

  /** Tăng growthPoint, cap tại max, tự đổi stage */
  const addGrowthPoint = useCallback(
    (points: number) => {
      qc.setQueryData<VirtualPlant>(['virtualPlant'], (prev) => {
        if (!prev) return prev;
        const newPoints = Math.min(prev.growthPoint + points, prev.maxGrowthPoint);
        return {
          ...prev,
          growthPoint: newPoints,
          status: deriveStage(newPoints),
        };
      });
    },
    [qc],
  );

  /** Gọi sau khi hoàn thành task */
  const updatePlantAfterTask = useCallback(
    (task: CareTask) => {
      addResource(task.rewardResource, task.rewardAmount);
      addGrowthPoint(task.growthReward);
    },
    [addResource, addGrowthPoint],
  );

  const hasNoPlant = error instanceof Error && error.message === 'NO_PLANT';

  return { plant, isLoading, hasNoPlant, addResource, addGrowthPoint, updatePlantAfterTask };
};

// ── Hook: timeline cây thật ───────────────────────────────────────────────────
export const usePlantUpdates = () => {
  const { data: plant } = useQuery({
    queryKey: ['virtualPlant'],
    queryFn: plantService.getVirtualPlant,
    staleTime: 5 * 60 * 1000,
  });

  return useQuery({
    queryKey: ['plantUpdates', plant?.id],
    queryFn: () => plantService.getPlantUpdates(plant!.id),
    enabled: !!plant?.id,
    staleTime: 2 * 60 * 1000,
  });
};
