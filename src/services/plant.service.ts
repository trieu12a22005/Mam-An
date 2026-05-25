import axiosClient from '../api/axiosClient';
import { VirtualPlant, PlantUpdate } from '../types/plant.type';

export interface FlowerType {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  defaultDuration?: number;
}

export const plantService = {
  /** GET /flower-types — danh sách loại hoa (public, không cần auth) */
  getFlowerTypes: async (): Promise<FlowerType[]> => {
    const res = await axiosClient.get<{ data: FlowerType[] }>('/flower-types');
    return res.data.data;
  },

  /** POST /virtual-plants/start — tạo cây ảo mới */
  startVirtualPlant: async (
    flowerTypeId: string,
    nickname?: string,
  ): Promise<VirtualPlant> => {
    const res = await axiosClient.post<{ data: VirtualPlant }>('/virtual-plants/start', {
      flowerTypeId,
      nickname,
    });
    return res.data.data;
  },

  /** GET /virtual-plants/my — lấy cây ảo đầu tiên của user */
  getVirtualPlant: async (): Promise<VirtualPlant> => {
    const res = await axiosClient.get<{ data: VirtualPlant[] }>('/virtual-plants/my');
    const plants = res.data.data;
    if (!plants || plants.length === 0) {
      throw new Error('NO_PLANT');
    }
    return plants[0];
  },

  /** GET /virtual-plants/:id/timeline */
  getPlantUpdates: async (virtualPlantId: string): Promise<PlantUpdate[]> => {
    const res = await axiosClient.get<{ data: PlantUpdate[] }>(
      `/virtual-plants/${virtualPlantId}/timeline`,
    );
    return res.data.data;
  },
};
