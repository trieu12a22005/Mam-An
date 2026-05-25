import { AppText as Text } from '../common/AppText';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PlantStatus } from '../../types/plant.type';
import { COLORS } from '../../constants/colors';
import { PLANT_STAGES } from '../../constants/plantStages';

const STAGE_EMOJI: Record<PlantStatus, string> = {
  SEED:     '🌰',
  SPROUT:   '🌱',
  GROWING:  '🌿',
  BUDDING:  '🌼',
  BLOOMING: '🌻',
  RESTING:  '🍂',
};

const STAGE_BG: Record<PlantStatus, string> = {
  SEED:     '#D4B48340',
  SPROUT:   '#86EFAC40',
  GROWING:  '#34C75940',
  BUDDING:  '#FCD34D40',
  BLOOMING: '#FCA5A540',
  RESTING:  '#9DB0A040',
};

interface PlantAvatarProps {
  status: PlantStatus;
  size?: 'sm' | 'md' | 'lg';
  nickname?: string;
}

const SIZES = {
  sm: { container: 72, emoji: 36 },
  md: { container: 120, emoji: 60 },
  lg: { container: 160, emoji: 80 },
};

export const PlantAvatar: React.FC<PlantAvatarProps> = ({
  status,
  size = 'md',
  nickname,
}) => {
  const dim = SIZES[size];
  const emoji = STAGE_EMOJI[status];
  const bg = STAGE_BG[status];
  const stageName = PLANT_STAGES[status]?.label ?? status;

  return (
    <View style={styles.wrapper}>
      {/* Glow ring */}
      <View
        style={[
          styles.ring,
          {
            width: dim.container + 24,
            height: dim.container + 24,
            borderRadius: (dim.container + 24) / 2,
            backgroundColor: bg,
          },
        ]}
      />
      {/* Main circle */}
      <View
        style={[
          styles.circle,
          {
            width: dim.container,
            height: dim.container,
            borderRadius: dim.container / 2,
            backgroundColor: bg,
          },
        ]}
      >
        <Text style={{ fontSize: dim.emoji, lineHeight: dim.emoji * 1.2 }}>
          {emoji}
        </Text>
      </View>

      {/* Nickname & stage label */}
      {size !== 'sm' && (
        <View style={styles.labels}>
          {nickname && <Text style={styles.nickname}>{nickname}</Text>}
          <Text style={styles.stageLabel}>{stageName}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 10,
  },
  ring: {
    position: 'absolute',
    alignSelf: 'center',
  },
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.green.light,
  },
  labels: {
    alignItems: 'center',
    gap: 2,
  },
  nickname: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  stageLabel: {
    fontSize: 13,
    color: COLORS.text.muted,
    fontStyle: 'italic',
  },
});
