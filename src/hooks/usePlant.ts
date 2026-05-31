import { useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plantService } from '../services/plant.service';
import { VirtualPlant, PlantResourceType, PlantStatus } from '../types/plant.type';
import { CareTask } from '../types/task.type';

// ── Thứ tự giai đoạn ──────────────────────────────────────────────────────────
const STAGE_ORDER: PlantStatus[] = ['SEED', 'SPROUT', 'GROWING', 'BUDDING', 'BLOOMING'];

// ── Tỷ lệ mặc định khi stageDurations = null ─────────────────────────────────
// Dựa trên defaultDuration của FlowerType, chia theo tỷ lệ:
// SEED 10% | SPROUT 20% | GROWING 35% | BUDDING 25% | BLOOMING 10%
const STAGE_RATIOS: Record<PlantStatus, number> = {
  SEED:     0.10,
  SPROUT:   0.20,
  GROWING:  0.35,
  BUDDING:  0.25,
  BLOOMING: 0.10,
  RESTING:  0,
};

const DEFAULT_TOTAL_DAYS = 30; // Dùng nếu cả stageDurations lẫn defaultDuration đều null

/**
 * Lấy stageDurations thực tế.
 * Nếu null: tạo từ defaultDuration theo tỷ lệ cố định.
 */
function resolveStageDurations(
  durations: Partial<Record<PlantStatus, number>> | null | undefined,
  defaultDuration?: number | null,
): Record<PlantStatus, number> {
  if (durations) {
    // Điền 0 cho stage nào chưa có
    return {
      SEED:     durations.SEED     ?? 0,
      SPROUT:   durations.SPROUT   ?? 0,
      GROWING:  durations.GROWING  ?? 0,
      BUDDING:  durations.BUDDING  ?? 0,
      BLOOMING: durations.BLOOMING ?? 0,
      RESTING:  durations.RESTING  ?? 0,
    };
  }

  // Tạo từ defaultDuration (hoặc fallback 30 ngày)
  const total = defaultDuration ?? DEFAULT_TOTAL_DAYS;
  return {
    SEED:     Math.round(total * STAGE_RATIOS.SEED),
    SPROUT:   Math.round(total * STAGE_RATIOS.SPROUT),
    GROWING:  Math.round(total * STAGE_RATIOS.GROWING),
    BUDDING:  Math.round(total * STAGE_RATIOS.BUDDING),
    BLOOMING: Math.round(total * STAGE_RATIOS.BLOOMING),
    RESTING:  0,
  };
}

// ── Tính giai đoạn từ ngày user bắt đầu (plant.createdAt) ────────────────────
export const computeStage = (plant: VirtualPlant): PlantStatus => {
  const durations = resolveStageDurations(
    plant.flowerType?.stageDurations,
    (plant.flowerType as any)?.defaultDuration,
  );

  // Số ngày kể từ khi USER bắt đầu nhận hạt (plant.createdAt)
  const daysAlive =
    (Date.now() - new Date(plant.createdAt).getTime()) / (1000 * 60 * 60 * 24);

  let cumDays = 0;
  for (const stage of STAGE_ORDER) {
    cumDays += durations[stage] ?? 0;
    if (daysAlive < cumDays) return stage;
  }
  return 'BLOOMING'; // đã qua tất cả giai đoạn
};

// ── Tiến độ trong giai đoạn hiện tại ─────────────────────────────────────────
export interface StageProgress {
  pct: number;          // 0–100
  daysLeft: number;     // Số ngày còn lại
  daysInStage: number;  // Số ngày đã ở trong giai đoạn này
  daysTotal: number;    // Tổng ngày của giai đoạn
  nextStage: PlantStatus | null;
}

export const computeStageProgress = (plant: VirtualPlant): StageProgress => {
  const durations = resolveStageDurations(
    plant.flowerType?.stageDurations,
    (plant.flowerType as any)?.defaultDuration,
  );
  const currentStage = computeStage(plant);

  // Số ngày kể từ khi USER bắt đầu
  const daysAlive =
    (Date.now() - new Date(plant.createdAt).getTime()) / (1000 * 60 * 60 * 24);

  let stageStart = 0;
  for (let i = 0; i < STAGE_ORDER.length; i++) {
    const stage = STAGE_ORDER[i]!;
    const stageDuration = durations[stage] ?? 0;
    const stageEnd = stageStart + stageDuration;

    if (stage === currentStage) {
      const daysInStage = Math.max(0, daysAlive - stageStart);
      const pct = stageDuration > 0
        ? Math.min((daysInStage / stageDuration) * 100, 100)
        : 100;
      const daysLeft = Math.max(0, Math.ceil(stageEnd - daysAlive));
      const nextStage = (STAGE_ORDER[i + 1] ?? null) as PlantStatus | null;
      return { pct, daysLeft, daysInStage, daysTotal: stageDuration, nextStage };
    }
    stageStart = stageEnd;
  }

  // BLOOMING đã qua tất cả → progress 100%
  return { pct: 100, daysLeft: 0, daysInStage: 0, daysTotal: 0, nextStage: null };
};

// ── Tính nhu cầu của cây (3 tài nguyên thấp nhất) ────────────────────────────
export interface PlantNeed {
  type: PlantResourceType;
  amount: number;
}

export const computePlantNeeds = (plant: VirtualPlant): PlantNeed[] => {
  const all: PlantNeed[] = [
    { type: 'WATER',      amount: plant.waterAmount      ?? 0 },
    { type: 'SUNLIGHT',   amount: plant.sunlightAmount   ?? 0 },
    { type: 'FERTILIZER', amount: plant.fertilizerAmount ?? 0 },
    { type: 'AIR',        amount: plant.airAmount        ?? 0 },
    { type: 'LOVE',       amount: plant.loveAmount       ?? 0 },
    { type: 'DEW',        amount: plant.dewAmount        ?? 0 },
  ];
  return all.sort((a, b) => a.amount - b.amount).slice(0, 3);
};

// ── Lời cảm ơn random (dùng khi không có RewardModal) ───────────────────────
const RESOURCE_THANKS: Record<PlantResourceType, string[]> = {
  WATER:      ["Cảm ơn bạn đã tưới nước cho mình, hôm nay mình thấy dễ chịu hơn nhiều rồi 💧","Một chút nước từ bạn làm mình tỉnh táo hơn hẳn đó 🌱","Mình nhận được nước rồi nè, cảm ơn bạn đã nhớ đến mình 💚","Nhờ bạn tưới nước, mình có thêm sức để lớn lên từng chút một.","Giọt nước hôm nay thật mát lành, cảm ơn bạn nhé 💧","Bạn vừa cho mình một chút dịu mát, mình vui lắm.","Cảm ơn bạn, mình sẽ dùng giọt nước này để lớn thêm một chút.","Nước đã tới rồi, hôm nay mình thấy được chăm sóc nhiều hơn 🌿"],
  SUNLIGHT:   ["Cảm ơn bạn đã mang ánh sáng đến cho mình, mình thấy ấm áp hơn rồi ☀️","Một chút ánh sáng hôm nay làm mình muốn vươn cao hơn.","Nhờ ánh sáng của bạn, khu vườn nhỏ sáng lên một chút rồi đó 🌼","Mình nhận được nắng rồi, cảm ơn bạn đã tiếp thêm năng lượng cho mình.","Ánh sáng này dịu quá, mình sẽ lớn lên thật chậm rãi cùng bạn.","Cảm ơn bạn, hôm nay mình thấy có thêm hy vọng để nở hoa.","Bạn vừa gửi cho mình một tia nắng nhỏ, mình quý lắm ☀️","Mình sẽ giữ lại ánh sáng này cho hành trình hôm nay nhé."],
  FERTILIZER: ["Cảm ơn bạn đã bón phân cho mình, mình có thêm dinh dưỡng rồi 🌱","Mình nhận được phân bón rồi nè, rễ của mình sẽ khỏe hơn từng chút.","Nhờ bạn chăm sóc, mình có thêm sức để phát triển mạnh mẽ hơn.","Một chút phân bón hôm nay giúp mình lớn lên vững vàng hơn.","Cảm ơn bạn, mình sẽ dùng nguồn dinh dưỡng này thật tốt.","Bạn vừa tiếp thêm cho mình một nền tảng thật ấm áp để lớn lên.","Mình thấy khỏe hơn rồi, cảm ơn bạn đã chăm mình kỹ như vậy.","Phân bón đã tới rồi, mình sẽ cố gắng ra thêm lá mới nhé 🌿"],
  AIR:        ["Cảm ơn bạn đã mang không khí trong lành đến cho mình 🍃","Một làn gió nhẹ làm mình thấy dễ thở hơn rồi.","Mình nhận được không khí rồi, hôm nay mọi thứ nhẹ nhàng hơn một chút.","Nhờ bạn, mình có thêm một khoảng thở thật dịu.","Không khí này trong lành quá, cảm ơn bạn đã chia sẻ với mình.","Mình sẽ hít thở thật chậm cùng bạn nhé 🍃","Bạn vừa gửi cho mình một làn gió nhỏ, mình thấy bình yên hơn.","Cảm ơn bạn, mình thấy khu vườn hôm nay thoáng đãng hơn rồi."],
  LOVE:       ["Cảm ơn bạn đã gửi yêu thương cho mình, mình thấy ấm lòng lắm 💚","Mình nhận được yêu thương rồi nè, hôm nay mình vui hơn một chút.","Một chút yêu thương từ bạn làm mình muốn nở hoa thật đẹp.","Cảm ơn bạn đã dịu dàng với mình và với chính bạn hôm nay.","Yêu thương này quý lắm, mình sẽ giữ thật kỹ trong khu vườn nhỏ.","Nhờ bạn, mình thấy mình không lớn lên một mình nữa.","Bạn vừa gửi cho mình một điều rất ấm áp, cảm ơn bạn nhé.","Mình nhận được trái tim nhỏ của bạn rồi, hôm nay thật đáng nhớ 💚"],
  DEW:        ["Cảm ơn bạn đã gửi giọt sương mai cho mình, thật dịu dàng quá 🌿","Một chút sương mai làm mình thấy ngày mới nhẹ hơn nhiều.","Mình nhận được sương rồi nè, cảm xúc của bạn cũng được mình trân trọng.","Giọt sương hôm nay trong veo quá, cảm ơn bạn đã chia sẻ với mình.","Cảm ơn bạn, mình sẽ giữ giọt sương này như một điều nhỏ bình yên.","Sương mai đã chạm vào lá rồi, mình thấy mát lành hơn.","Bạn vừa cho mình một khoảnh khắc thật nhẹ, mình biết ơn lắm.","Mình nhận được giọt sương từ bạn rồi, hôm nay cứ chậm rãi thôi nhé."],
};

const pickLocalThankYou = (type: PlantResourceType): string => {
  const msgs = RESOURCE_THANKS[type];
  return msgs[Math.floor(Math.random() * msgs.length)]!;
};
const RESOURCE_FIELD: Record<PlantResourceType, keyof VirtualPlant> = {
  WATER:      'waterAmount',
  SUNLIGHT:   'sunlightAmount',
  FERTILIZER: 'fertilizerAmount',
  AIR:        'airAmount',
  LOVE:       'loveAmount',
  DEW:        'dewAmount',
};

// ── Hook: cây ảo ──────────────────────────────────────────────────────────────
export const useVirtualPlant = () => {
  const qc = useQueryClient();
  /** Chặn gọi song song cùng 1 resource type */
  const processingResources = useRef<Set<PlantResourceType>>(new Set());

  const { data: plant, isLoading, error } = useQuery({
    queryKey: ['virtualPlant'],
    queryFn: plantService.getVirtualPlant,
    staleTime: 5 * 60 * 1000,
    retry: (failCount, err: Error) => {
      if (err.message === 'NO_PLANT') return false;
      return failCount < 2;
    },
  });

  /** Optimistic update: tăng resource */
  const addResource = useCallback(
    (resourceType: PlantResourceType, amount: number) => {
      qc.setQueryData<VirtualPlant>(['virtualPlant'], (prev) => {
        if (!prev) return prev;
        const field = RESOURCE_FIELD[resourceType];
        const currentVal = (prev[field] as number) ?? 0;
        const prevResources = prev.resources ?? ({} as Record<PlantResourceType, number>);
        return {
          ...prev,
          [field]: currentVal + amount,
          resources: { ...prevResources, [resourceType]: (prevResources[resourceType] ?? 0) + amount },
        };
      });
    },
    [qc],
  );

  /**
   * Optimistic update: giảm resource khi user dùng để chăm cây.
   * Trả về true nếu đủ tài nguyên, false nếu không đủ.
   */
  const spendResource = useCallback(
    (
      resourceType: PlantResourceType,
      cost: number,
      onSuccess?: (aiMsg?: string) => void,
      onError?: (errMsg: string) => void
    ): boolean => {
      if (!plant) return false;
      // Chặn gọi song song cùng resource (double-tap)
      if (processingResources.current.has(resourceType)) return false;

      const current = plant.resources?.[resourceType] ?? 0;
      if (current < cost) return false;

      processingResources.current.add(resourceType);

      qc.setQueryData<VirtualPlant>(['virtualPlant'], (prev) => {
        if (!prev) return prev;
        const field = RESOURCE_FIELD[resourceType];
        const currentVal = (prev[field] as number) ?? 0;
        const prevResources = prev.resources ?? ({} as Record<PlantResourceType, number>);
        return {
          ...prev,
          [field]: Math.max(0, currentVal - cost),
          resources: {
            ...prevResources,
            [resourceType]: Math.max(0, (prevResources[resourceType] ?? 0) - cost),
          },
        };
      });

      // Fire API call ngầm (nếu lỗi sẽ tự invalidate cache để sync lại)
      plantService.carePlant(plant.id, resourceType, cost)
        .then(() => {
          // Sync lại data thật từ server sau khi API thành công
          qc.invalidateQueries({ queryKey: ['virtualPlant'] });
          // Dùng lời cảm ơn random thay vì chờ AI từ backend
          const localMsg = pickLocalThankYou(resourceType);
          if (onSuccess) {
            onSuccess(localMsg);
          } else {
            Alert.alert('Cây cảm ơn bạn 🌿', localMsg);
          }
        })
        .catch((err: any) => {
          // Reload data từ server để sync lại tài nguyên thực tế
          qc.invalidateQueries({ queryKey: ['virtualPlant'] });
          
          const status = err.response?.status;
          const backendMsg: string = err.response?.data?.message || err.message || '';
          
          // Chỉ hiển thị thông báo giới hạn chăm sóc (rate limit), ẩn lỗi kỹ thuật
          const isRateLimit = status === 400 && (
            backendMsg.includes('đủ rồi') || 
            backendMsg.includes('tiêu hóa') ||
            backendMsg.includes('4 giờ') ||
            backendMsg.includes('ngày mai')
          );
          
          if (isRateLimit) {
            if (onError) {
              onError(backendMsg);
            } else {
              Alert.alert("Chưa thể chăm cây lúc này", backendMsg);
            }
          } else if (status !== 400) {
            // Lỗi mạng hoặc server — log ra console để debug
            console.error('[carePlant] Unexpected error:', err);
          }
          // Lỗi 400 khác ("not enough") → im lặng, data đã được sync lại rồi
        })
        .finally(() => {
          // Luôn giải phóng lock sau khi xong
          processingResources.current.delete(resourceType);
        });

      return true;
    },
    [qc, plant],
  );

  /** Gọi sau khi hoàn thành task — chỉ cộng tài nguyên */
  const updatePlantAfterTask = useCallback(
    (task: CareTask) => {
      addResource(task.rewardResource, task.rewardAmount);
    },
    [addResource],
  );

  const renamePlantMutation = useMutation({
    mutationFn: (nickname: string) => plantService.updateNickname(plant!.id, nickname),
    onSuccess: (_, nickname) => {
      qc.setQueryData<VirtualPlant>(['virtualPlant'], (old) => {
        if (!old) return old;
        return { ...old, nickname };
      });
    },
  });

  const renamePlant = async (newNickname: string) => {
    if (!plant) return;
    await renamePlantMutation.mutateAsync(newNickname);
  };

  const hasNoPlant = !isLoading && !plant;
  const stage = plant ? computeStage(plant) : undefined;
  const stageProgress = plant ? computeStageProgress(plant) : undefined;
  const plantNeeds = plant ? computePlantNeeds(plant) : [];

  return {
    plant,
    stage,
    stageProgress,
    plantNeeds,
    isLoading,
    hasNoPlant,
    addResource,
    spendResource,
    updatePlantAfterTask,
    renamePlant,
  };
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
