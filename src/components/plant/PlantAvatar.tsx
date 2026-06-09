import { AppText as Text } from '../common/AppText';
import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { PlantStatus } from '../../types/plant.type';
import { COLORS } from '../../constants/colors';
import { PLANT_STAGES } from '../../constants/plantStages';
import { useTimeTheme } from '../../contexts/TimeThemeContext';

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
  /** flowerType từ VirtualPlant — dùng để hiển thị ảnh riêng theo loài & giai đoạn */
  flowerType?: {
    imageUrl?: string;
    stageImages?: Partial<Record<PlantStatus, string>>;
  };
  onRename?: () => void;
}

const SIZES = {
  sm: { container: 72,  emoji: 36 },
  md: { container: 120, emoji: 60 },
  lg: { container: 160, emoji: 80 },
};

export const PlantAvatar: React.FC<PlantAvatarProps> = ({
  status,
  size = 'md',
  nickname,
  flowerType,
  onRename,
}) => {
  const dim = SIZES[size];
  const bg = STAGE_BG[status];
  const stageName = PLANT_STAGES[status]?.label ?? status;
  const { colors } = useTimeTheme();

  // Ưu tiên: ảnh giai đoạn riêng → ảnh chung của loài → emoji
  const imageUrl =
    flowerType?.stageImages?.[status] ??
    flowerType?.imageUrl ??
    null;

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
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{
              width: dim.emoji * 1.2,
              height: dim.emoji * 1.2,
              borderRadius: (dim.emoji * 1.2) / 2,
            }}
            resizeMode="cover"
          />
        ) : (
          <Text style={{ fontSize: dim.emoji * 0.7 }}>
            {STAGE_EMOJI[status]}
          </Text>
        )}
      </View>

      {/* Nickname & stage label */}
      {size !== 'sm' && (
        <View style={styles.labels}>
          {onRename ? (
            <TouchableOpacity onPress={onRename} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {nickname ? (
                <Text style={[styles.nickname, { color: colors.text }]}>{nickname} <Text style={{fontSize: 14, color: colors.primary}}>✏️</Text></Text>
              ) : (
                <Text style={[styles.nickname, { color: colors.primary, fontSize: 14 }]}>+ Đặt tên cây</Text>
              )}
            </TouchableOpacity>
          ) : (
            nickname ? <Text style={[styles.nickname, { color: colors.text }]}>{nickname}</Text> : null
          )}
          <Text style={[styles.stageLabel, { color: colors.textMuted }]}>{stageName}</Text>
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
    marginTop: 12, // Đẩy xuống để không đè lên vòng tròn
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
