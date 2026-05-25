import { VirtualPlant, PlantUpdate } from '../types/plant.type';

export const mockVirtualPlant: VirtualPlant = {
  id: 'vp_1',
  nickname: 'Sunny',
  status: 'GROWING',
  growthPoint: 350,
  maxGrowthPoint: 1000,
  streakCount: 5,
  resources: {
    WATER: 10,
    SUNLIGHT: 5,
    FERTILIZER: 2,
    AIR: 0,
    LOVE: 8,
    DEW: 3,
  },
  flowerType: {
    id: 'ft_1',
    name: 'Hướng dương',
    imageUrl: 'https://example.com/sunflower.png',
  },
  realPlant: {
    id: 'rp_1',
    code: 'SUN-001',
    status: 'GROWING',
  },
};

export const mockPlantUpdates: PlantUpdate[] = [
  {
    id: 'pu_2',
    imageUrl: 'https://example.com/update2.jpg',
    status: 'GROWING',
    note: 'Cây đang vươn lên đón nắng rực rỡ',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pu_1',
    imageUrl: 'https://example.com/update1.jpg',
    status: 'SPROUT',
    note: 'Đã nảy mầm lá non',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
