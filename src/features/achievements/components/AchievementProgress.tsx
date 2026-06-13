import { AppText as Text } from '../../../components/common/AppText';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/colors';

interface Props {
  current: number;
  target: number;
  isUnlocked: boolean;
}

export const AchievementProgress: React.FC<Props> = ({ current, target, isUnlocked }) => {
  const pct = Math.min(current / target, 1);
  const displayPct = Math.round(pct * 100);

  if (isUnlocked) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.trackBg}>
        <View style={[styles.trackFill, { width: `${displayPct}%` as any }]} />
      </View>
      <Text style={styles.label}>
        {current}/{target}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  trackBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.green[100],
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: COLORS.green[300],
  },
  label: {
    fontSize: 11,
    color: COLORS.text.muted,
    fontWeight: '500',
    minWidth: 32,
    textAlign: 'right',
  },
});
