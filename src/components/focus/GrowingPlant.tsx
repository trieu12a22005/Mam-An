import { AppText as Text } from '../common/AppText';
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { PlantAvatar } from '../plant/PlantAvatar';
import { PlantStatus } from '../../types/plant.type';
import { COLORS } from '../../constants/colors';

interface Props {
  progress: number; // 0–1
  status?: PlantStatus;
  flowerType?: {
    imageUrl?: string;
    stageImages?: Partial<Record<PlantStatus, string>>;
  };
}

export const GrowingPlant: React.FC<Props> = ({
  progress,
  status = 'GROWING',
  flowerType,
}) => {
  const scaleAnim = useRef(new Animated.Value(1.25)).current; // Bắt đầu to hơn 25%
  const glowOpacity = useRef(new Animated.Value(0.35)).current;
  const glowScale = useRef(new Animated.Value(1)).current;

  // Scale cây từ 1.25 lên 1.40 theo progress
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1.25 + progress * 0.15,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    }).start();
  }, [progress]);

  // Glow nhịp thở nhẹ
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowOpacity, { toValue: 0.6, duration: 2200, useNativeDriver: true }),
          Animated.timing(glowScale,   { toValue: 1.08, duration: 2200, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(glowOpacity, { toValue: 0.25, duration: 2200, useNativeDriver: true }),
          Animated.timing(glowScale,   { toValue: 0.96, duration: 2200, useNativeDriver: true }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={styles.wrapper}>
      {/* Glow aura — vòng mờ xanh nhịp thở */}
      <Animated.View
        style={[
          styles.glowRing,
          { opacity: glowOpacity, transform: [{ scale: glowScale }] },
        ]}
      />
      {/* Cây */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <PlantAvatar
          status={status}
          size="lg"
          flowerType={flowerType}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    // Đủ chỗ cho glow ring + cây to
    width: 240,
    height: 240,
  },
  glowRing: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: COLORS.green[200],
  },
});
