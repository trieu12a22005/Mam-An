import axiosClient from '../api/axiosClient';
import { VirtualPlant, PlantUpdate, PlantResourceType } from '../types/plant.type';

export interface FlowerTypeGarden {
  id: string;
  name: string;
  address?: string | null;
}

export interface FlowerType {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  defaultDuration?: number;
  stageDurations?: Partial<Record<string, number>>;
  stageImages?: Partial<Record<string, string>>;
  availableCount: number;       // Số cây SEED chưa được gắn
  gardens: FlowerTypeGarden[];  // Nhà vườn đang có cây loại này
}

/** Map flat resource fields → Record cho ResourceGrid */
const mapResources = (p: any): Record<PlantResourceType, number> => ({
  WATER:      p.waterAmount      ?? 0,
  SUNLIGHT:   p.sunlightAmount   ?? 0,
  FERTILIZER: p.fertilizerAmount ?? 0,
  AIR:        p.airAmount        ?? 0,
  LOVE:       p.loveAmount       ?? 0,
  DEW:        p.dewAmount        ?? 0,
});

/** Map raw API response → VirtualPlant với resources computed */
const mapPlant = (raw: any): VirtualPlant => ({
  ...raw,
  waterAmount:      raw.waterAmount      ?? 0,
  sunlightAmount:   raw.sunlightAmount   ?? 0,
  fertilizerAmount: raw.fertilizerAmount ?? 0,
  airAmount:        raw.airAmount        ?? 0,
  loveAmount:       raw.loveAmount       ?? 0,
  dewAmount:        raw.dewAmount        ?? 0,
  resources: mapResources(raw),
});

export const plantService = {
  /** GET /flower-types — danh sách loại hoa (public) */
  getFlowerTypes: async (): Promise<FlowerType[]> => {
    const res = await axiosClient.get<{ data: FlowerType[] }>('/flower-types');
    return res.data.data;
  },

  /** POST /virtual-plants/start — tạo cây ảo mới */
  startVirtualPlant: async (
    flowerTypeId: string,
    nickname?: string,
  ): Promise<VirtualPlant> => {
    const res = await axiosClient.post<{ data: any }>('/virtual-plants/start', {
      flowerTypeId,
      nickname,
    });
    return mapPlant(res.data.data);
  },

  /** GET /virtual-plants/my — lấy cây ảo đầu tiên của user */
  getVirtualPlant: async (): Promise<VirtualPlant> => {
    const res = await axiosClient.get<{ data: any[] }>('/virtual-plants/my');
    const plants = res.data.data;
    if (!plants || plants.length === 0) {
      throw new Error('NO_PLANT');
    }
    return mapPlant(plants[0]);
  },

  /** GET /virtual-plants/:id/timeline */
  getPlantUpdates: async (virtualPlantId: string): Promise<PlantUpdate[]> => {
    const res = await axiosClient.get<{ data: PlantUpdate[] }>(
      `/virtual-plants/${virtualPlantId}/timeline`,
    );
    return res.data.data;
  },

  /** POST /virtual-plants/:id/care — dùng tài nguyên chăm cây */
  carePlant: async (
    virtualPlantId: string,
    resourceType: PlantResourceType,
    amount: number = 5,
  ): Promise<{ plant: VirtualPlant; aiMessage?: string }> => {
    const res = await axiosClient.post<{ data: any; aiMessage?: string }>(
      `/virtual-plants/${virtualPlantId}/care`,
      { resourceType, amount },
    );
    return {
      plant: mapPlant(res.data.data),
      aiMessage: res.data.aiMessage,
    };
  },

  /** PATCH /virtual-plants/:id — cập nhật nickname */
  updateNickname: async (
    virtualPlantId: string,
    nickname: string,
  ): Promise<void> => {
    await axiosClient.patch(`/virtual-plants/${virtualPlantId}`, { nickname });
  },
};
