import { AppText as Text } from '../common/AppText';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PlantStatus } from '../../types/plant.type';
import { PLANT_STAGES } from '../../constants/plantStages';
import { COLORS } from '../../constants/colors';
import { StageProgress } from '../../hooks/usePlant';
import { useTimeTheme } from '../../contexts/TimeThemeContext';

interface PlantProgressProps {
  stage: PlantStatus;
  stageProgress: StageProgress;
  growthPoint?: number;
}

export const PlantProgress: React.FC<PlantProgressProps> = ({
  stage,
  stageProgress,
  growthPoint,
}) => {
  if (!stageProgress) return null;

  const { colors } = useTimeTheme();
  const stageInfo = PLANT_STAGES[stage];
  const { pct, daysLeft, daysInStage, daysTotal, nextStage } = stageProgress;

  const nextLabel = nextStage ? PLANT_STAGES[nextStage]?.label : null;

  // ── Thông điệp nhẹ nhàng theo ngữ cảnh ───────────────────────────────────
  const getMessage = (): string => {
    if (daysTotal === 0) return 'Cây đang phát triển theo nhịp riêng của mình 🌸';
    if (stage === 'SEED') return 'Cây vừa được gieo. Cho cây một chút nước hôm nay nhé 🌱';
    if (stage === 'SPROUT') return 'Mầm nhú lên rồi! Cây cần nhiều nắng hơn 🌿';
    if (stage === 'GROWING') return 'Cây đang lớn dần. Tiếp tục chăm sóc nhé 💪';
    if (stage === 'BUDDING') {
      if (daysLeft <= 2) return 'Sắp có nụ rồi! Thêm chút tình yêu thương nào 💚';
      return 'Cây sắp ra nụ. Hãy chăm chút hơn nhé 🌼';
    }
    if (stage === 'BLOOMING') return 'Cây đang nở hoa! Bạn đã làm tốt lắm 🌸';
    return '';
  };

  return (
    <View style={styles.container}>
      <View style={styles.primarySection}>
        {/* Stage label + thời gian còn lại */}
        <View style={styles.row}>
          <View style={[styles.stageBadge, { backgroundColor: colors.primarySoft }]}>
            <Text style={[styles.stageLabel, { color: colors.primary }]}>{stageInfo?.label ?? stage}</Text>
          </View>
          {daysTotal > 0 && nextLabel && (
            <Text style={[styles.daysText, { color: colors.textMuted }]}>
              {daysLeft > 0 ? `Còn ${daysLeft} ngày đến ${nextLabel}` : 'Sắp lên giai đoạn mới ✨'}
            </Text>
          )}
        </View>

        {/* Progress bar */}
        <View style={[styles.trackBg, { backgroundColor: colors.surfaceSoft }]}>
          <View style={[styles.trackFill, { width: `${Math.max(pct, 2)}%` as any, backgroundColor: colors.primary }]} />
        </View>
        
        {/* Phần trăm */}
        <Text style={[styles.pctLabel, { color: colors.text }]}>Progress {Math.round(pct)}%</Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.secondarySection}>
        {/* Điểm tích lũy */}
        {growthPoint !== undefined && (
          <Text style={[styles.growthPts, { color: colors.textMuted }]}>🌿 {growthPoint} điểm tích lũy</Text>
        )}
        {/* Thông điệp */}
        <Text style={[styles.message, { color: colors.textMuted }]}>{getMessage()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 8, width: '100%' },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageBadge: {
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  stageLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#143D25',
  },
  daysText: {
    fontSize: 12,
    color: '#6F8F78',
    fontWeight: '500',
  },

  // ── Progress bar ────────────────────────────────────────────────────────────
  trackBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E8F3E8',
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#7BBF8A',
  },

  // ── Text bên dưới bar ───────────────────────────────────────────────────────
  pctLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#143D25',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8F3E8',
    marginVertical: 4,
  },
  primarySection: {
    gap: 8,
  },
  secondarySection: {
    gap: 4,
    paddingTop: 4,
  },
  growthPts: {
    fontSize: 12,
    color: '#6F8F78',
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    color: '#6F8F78',
    textAlign: 'center',
    lineHeight: 18,
  },
});
