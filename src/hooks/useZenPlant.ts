import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { plantService, FlowerType } from '../services/plant.service';

const ZEN_PLANT_KEY = '@garden_zen_plant_id';

export function useZenPlant() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: flowerTypes = [] } = useQuery({
    queryKey: ['zenFlowers'],
    queryFn: plantService.getZenFlowers,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    AsyncStorage.getItem(ZEN_PLANT_KEY).then(id => {
      if (id) {
        setSelectedId(id);
      } else if (flowerTypes.length > 0) {
        // Mặc định chọn cây đầu tiên nếu chưa có
        setSelectedId(flowerTypes[0].id);
      }
    });
  }, [flowerTypes]);

  const selectZenPlant = async (id: string) => {
    setSelectedId(id);
    await AsyncStorage.setItem(ZEN_PLANT_KEY, id);
  };

  const selectedFlowerType = flowerTypes.find(f => f.id === selectedId) || flowerTypes[0];

  return {
    selectedFlowerType,
    flowerTypes,
    selectZenPlant,
  };
}
