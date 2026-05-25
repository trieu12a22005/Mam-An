import { PlantStatus } from '../types/plant.type';

export const PLANT_STAGES: Record<PlantStatus, { label: string; description: string; threshold: number }> = {
  SEED: { label: 'Hạt giống', description: 'Hạt giống mới được gieo trồng', threshold: 0 },
  SPROUT: { label: 'Nảy mầm', description: 'Cây non bắt đầu nhú khỏi mặt đất', threshold: 100 },
  GROWING: { label: 'Đang lớn', description: 'Cây đang phát triển mạnh mẽ', threshold: 300 },
  BUDDING: { label: 'Ra nụ', description: 'Cây bắt đầu đơm nụ', threshold: 600 },
  BLOOMING: { label: 'Nở hoa', description: 'Hoa nở rực rỡ', threshold: 1000 },
  RESTING: { label: 'Nghỉ ngơi', description: 'Cây đang trong giai đoạn nghỉ ngơi', threshold: -1 },
};
