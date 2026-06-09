import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { AppText as Text } from '../common/AppText';
import { PlantResourceType } from '../../types/plant.type';
import { RESOURCES } from '../../constants/resources';
import { COLORS } from '../../constants/colors';
import { useTimeTheme } from '../../contexts/TimeThemeContext';

interface ResourceGridProps {
  resources: Record<PlantResourceType, number>;
}

const RESOURCE_KEYS: PlantResourceType[] = [
  'WATER', 'SUNLIGHT', 'FERTILIZER', 'AIR', 'LOVE', 'DEW',
];

const RESOURCE_EMOJI: Record<PlantResourceType, string> = {
  WATER: '💧', SUNLIGHT: '☀️', FERTILIZER: '🌿',
  AIR: '🌬️', LOVE: '💚', DEW: '✨',
};

export const ResourceGrid: React.FC<ResourceGridProps> = ({ resources }) => {
  const safeResources = resources ?? ({} as Record<PlantResourceType, number>);
  const { colors } = useTimeTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {RESOURCE_KEYS.map((type, idx) => {
        const amount = safeResources[type] ?? 0;
        const resource = RESOURCES[type];
        return (
          <View key={type} style={[styles.item, idx < 3 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={[styles.iconWrapper, { backgroundColor: resource.color + '15' }]}>
              {type === 'FERTILIZER' ? (
                <Image source={require('../../../assets/phan_bon.png')} style={styles.imageIcon} />
              ) : type === 'DEW' ? (
                <Image source={require('../../../assets/suong_mai.png')} style={styles.imageIcon} />
              ) : type === 'SUNLIGHT' ? (
                <Image source={require('../../../assets/mat_troi.png')} style={styles.imageIcon} />
              ) : type === 'LOVE' ? (
                <Image source={require('../../../assets/yeu_thuong.png')} style={styles.imageIcon} />
              ) : (
                <Text style={styles.emoji}>{RESOURCE_EMOJI[type]}</Text>
              )}
            </View>
            <View style={styles.info}>
              <Text style={[styles.amount, { color: colors.text }]}>{amount}</Text>
              <Text style={[styles.label, { color: colors.textMuted }]}>{resource.label}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E8F3E8',
  },
  item: {
    width: '33.33%',
    alignItems: 'center',
    paddingVertical: 14,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0FAF0',
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  emoji: { fontSize: 22 },
  imageIcon: { width: 46, height: 46, borderRadius: 23 },
  info: { alignItems: 'center' },
  amount: { fontSize: 16, fontWeight: '700', color: COLORS.text.primary },
  label: { fontSize: 12, fontWeight: '500', color: '#8BAF97', marginTop: 2 },
});
