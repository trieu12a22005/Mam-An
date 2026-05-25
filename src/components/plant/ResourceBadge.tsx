import { AppText as Text } from '../common/AppText';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PlantResourceType } from '../../types/plant.type';
import { RESOURCES } from '../../constants/resources';
import { COLORS } from '../../constants/colors';

interface ResourceBadgeProps {
  type: PlantResourceType;
  amount: number;
  size?: 'sm' | 'md';
}

const RESOURCE_EMOJI: Record<PlantResourceType, string> = {
  WATER:      '💧',
  SUNLIGHT:   '☀️',
  FERTILIZER: '🌿',
  AIR:        '🌬️',
  LOVE:       '💚',
  DEW:        '✨',
};

export const ResourceBadge: React.FC<ResourceBadgeProps> = ({
  type,
  amount,
  size = 'md',
}) => {
  const resource = RESOURCES[type];
  const emoji = RESOURCE_EMOJI[type];
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        isSmall && styles.badgeSm,
        { backgroundColor: resource.color + '22' },
      ]}
    >
      <Text style={isSmall ? styles.emojiSm : styles.emoji}>{emoji}</Text>
      <Text
        style={[
          styles.amount,
          isSmall && styles.amountSm,
          { color: resource.color },
        ]}
      >
        {amount}
      </Text>
      {!isSmall && (
        <Text style={[styles.label, { color: resource.color }]}>
          {resource.label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 4,
    minWidth: 60,
  },
  badgeSm: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 4,
    minWidth: 0,
  },
  emoji: {
    fontSize: 22,
  },
  emojiSm: {
    fontSize: 14,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  amountSm: {
    fontSize: 13,
    fontWeight: '600',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
});
