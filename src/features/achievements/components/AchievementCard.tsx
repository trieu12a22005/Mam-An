import { AppText as Text } from '../../../components/common/AppText';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Achievement } from '../types/achievement.types';
import { AchievementBadge } from './AchievementBadge';
import { COLORS } from '../../../constants/colors';
import { useTimeTheme } from '../../../contexts/TimeThemeContext';

interface Props {
  achievement: Achievement;
}

export const AchievementCard: React.FC<Props> = ({ achievement }) => {
  const { colors } = useTimeTheme();
  const { emoji, title, description, requirement, unlocked, currentProgress, targetProgress } = achievement;

  const pct = Math.min((currentProgress / targetProgress) * 100, 100);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: unlocked ? colors.surface : colors.background,
          borderColor: unlocked ? COLORS.green[200] : colors.border,
          opacity: unlocked ? 1 : 0.75,
        },
      ]}
    >
      <AchievementBadge emoji={emoji} isUnlocked={unlocked} size={52} />

      <View style={styles.content}>
        {/* Title + pill */}
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: unlocked ? colors.text : colors.textMuted }]}>
            {title}
          </Text>
          {unlocked && (
            <View style={styles.unlockedPill}>
              <Text style={styles.unlockedText}>✓ Đạt được</Text>
            </View>
          )}
        </View>

        {/* Description or requirement */}
        <Text style={[styles.description, { color: colors.textMuted }]} numberOfLines={2}>
          {unlocked ? description : requirement}
        </Text>

        {/* Progress bar — chỉ hiện khi chưa mở khóa */}
        {!unlocked && (
          <View style={styles.progressWrap}>
            <View style={[styles.progressBg, { backgroundColor: COLORS.green[100] }]}>
              <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
            </View>
            <Text style={styles.progressLabel}>
              {currentProgress}/{targetProgress}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  content: { flex: 1, gap: 3 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  title: { fontSize: 15, fontWeight: '600', flexShrink: 1 },
  description: { fontSize: 12, lineHeight: 18 },

  unlockedPill: {
    backgroundColor: COLORS.green[100],
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  unlockedText: { fontSize: 10, color: COLORS.green.dark, fontWeight: '600' },

  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  progressBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: COLORS.green[300],
    minWidth: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: COLORS.text.muted,
    fontWeight: '500',
    minWidth: 32,
    textAlign: 'right',
  },
});
