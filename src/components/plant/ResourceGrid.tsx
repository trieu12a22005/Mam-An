import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PlantResourceType } from '../../types/plant.type';
import { ResourceBadge } from './ResourceBadge';

interface ResourceGridProps {
  resources: Record<PlantResourceType, number>;
}

const RESOURCE_KEYS: PlantResourceType[] = [
  'WATER', 'SUNLIGHT', 'FERTILIZER', 'AIR', 'LOVE', 'DEW',
];

export const ResourceGrid: React.FC<ResourceGridProps> = ({ resources }) => {
  return (
    <View style={styles.grid}>
      {RESOURCE_KEYS.map((type) => (
        <ResourceBadge
          key={type}
          type={type}
          amount={resources[type] ?? 0}
          size="md"
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
});
