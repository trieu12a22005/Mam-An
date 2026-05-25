import { AppText as Text } from '../common/AppText';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PlantStatus } from '../../types/plant.type';
import { PLANT_STAGES } from '../../constants/plantStages';
import { COLORS } from '../../constants/colors';

interface PlantProgressProps {
  growthPoint: number;
  maxGrowthPoint: number;
  status: PlantStatus;
}

export const PlantProgress: React.FC<PlantProgressProps> = ({
  growthPoint,
  maxGrowthPoint,
  status,
}) => {
  const percentage = Math.min((growthPoint / maxGrowthPoint) * 100, 100);
  const stageInfo = PLANT_STAGES[status];
  const stageColor = COLORS.stages[status] ?? COLORS.green.main;

  // Determine next stage label
  const stageOrder: PlantStatus[] = ['SEED', 'SPROUT', 'GROWING', 'BUDDING', 'BLOOMING'];
  const currentIdx = stageOrder.indexOf(status);
  const nextStage = stageOrder[currentIdx + 1];
  const nextLabel = nextStage ? PLANT_STAGES[nextStage]?.label : null;
  const pointsToNext = nextStage
    ? Math.max(0, PLANT_STAGES[nextStage].threshold - growthPoint)
    : 0;

  return (
    <View style={styles.container}>
      {/* Stage label row */}
      <View style={styles.row}>
        <Text style={styles.stageLabel}>{stageInfo?.label ?? status}</Text>
        <Text style={styles.points}>
          {growthPoint.toLocaleString('vi-VN')} / {maxGrowthPoint.toLocaleString('vi-VN')} điểm
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.trackBg}>
        <View
          style={[
            styles.trackFill,
            { width: `${percentage}%` as any, backgroundColor: stageColor },
          ]}
        />
      </View>

      {/* Next stage hint */}
      {nextLabel && pointsToNext > 0 && (
        <Text style={styles.nextHint}>
          Còn {pointsToNext} điểm để đạt giai đoạn "{nextLabel}" 🌟
        </Text>
      )}
      {!nextLabel && (
        <Text style={styles.nextHint}>Cây đã phát triển tối đa! 🎉</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  points: {
    fontSize: 12,
    color: COLORS.text.muted,
  },
  trackBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.green.light,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 5,
    minWidth: 8,
  },
  nextHint: {
    fontSize: 12,
    color: COLORS.text.muted,
    textAlign: 'center',
  },
});
