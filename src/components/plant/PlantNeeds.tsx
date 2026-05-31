import { AppText as Text } from '../common/AppText';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PlantNeed } from '../../hooks/usePlant';
import { COLORS } from '../../constants/colors';

const RESOURCE_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  WATER:      { emoji: '💧', label: 'Nước',     color: '#3B82F6' },
  SUNLIGHT:   { emoji: '☀️', label: 'Ánh sáng', color: '#F59E0B' },
  FERTILIZER: { emoji: '🌿', label: 'Phân bón', color: '#10B981' },
  AIR:        { emoji: '🌬️', label: 'Không khí', color: '#60A5FA' },
  LOVE:       { emoji: '💚', label: 'Tình yêu', color: '#EC4899' },
  DEW:        { emoji: '✨', label: 'Sương mai', color: '#8B5CF6' },
};

interface PlantNeedsProps {
  needs: PlantNeed[];
}

export const PlantNeeds: React.FC<PlantNeedsProps> = ({ needs }) => {
  if (needs.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌱 Cây đang cần</Text>
      <View style={styles.row}>
        {needs.map((need) => {
          const config = RESOURCE_CONFIG[need.type];
          if (!config) return null;
          return (
            <View
              key={need.type}
              style={[styles.needBadge, { borderColor: config.color + '60' }]}
            >
              <Text style={styles.needEmoji}>{config.emoji}</Text>
              <Text style={[styles.needLabel, { color: config.color }]}>
                {config.label}
              </Text>
              <Text style={styles.needAmount}>{need.amount}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 10 },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  needBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: '#fff',
  },
  needEmoji: { fontSize: 14 },
  needLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  needAmount: {
    fontSize: 11,
    color: COLORS.text.muted,
  },
});
