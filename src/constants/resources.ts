import { PlantResourceType } from '../types/plant.type';

export const RESOURCES: Record<PlantResourceType, { label: string; icon: string; color: string }> = {
  WATER: { label: 'Nước', icon: 'droplet', color: '#3B82F6' },
  SUNLIGHT: { label: 'Ánh sáng', icon: 'sun', color: '#F59E0B' },
  FERTILIZER: { label: 'Phân bón', icon: 'leaf', color: '#8B5CF6' },
  AIR: { label: 'Không khí', icon: 'wind', color: '#06B6D4' },
  LOVE: { label: 'Yêu thương', icon: 'heart', color: '#EC4899' },
  DEW: { label: 'Sương mai', icon: 'cloud-rain', color: '#10B981' },
};
