import { AppText as Text } from '../common/AppText';
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import { PlantStatus } from '../../types/plant.type';
import { COLORS } from '../../constants/colors';

const PLANT_SIZE = 200; // Kích thước cây lớn hơn (lg = 160 → 200)

interface Props {
  progress: number; // 0–1
  status?: PlantStatus;
  flowerType?: {
    imageUrl?: string;
    stageImages?: Partial<Record<PlantStatus, string>>;
  };
}

const STAGE_EMOJI: Partial<Record<PlantStatus, string>> = {
  SEED: '🌰', SPROUT: '🌱', GROWING: '🌿', BUDDING: '🌼', BLOOMING: '🌻',
};

export const GrowingPlant: React.FC<Props> = ({
  progress,
  status = 'GROWING',
  flowerType,
}) => {
  // Animation nhịp thở — scale cây + glow cùng nhau
  const breathAnim = useRef(new Animated.Value(1.0)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(breathAnim,  { toValue: 1.13, duration: 2200, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.7,  duration: 2200, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(breathAnim,  { toValue: 1.0,  duration: 2200, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.2,  duration: 2200, useNativeDriver: true }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breathAnim, glowOpacity]);

  // Ảnh hiển thị: ưu tiên stageImages → imageUrl → emoji
  const imageUrl =
    flowerType?.stageImages?.[status] ??
    flowerType?.imageUrl ??
    null;

  const CONTAINER = PLANT_SIZE + 48; // thêm chỗ cho glow

  return (
    <View style={[styles.wrapper, { width: CONTAINER + 20, height: CONTAINER + 20 }]}>
      {/* Toàn bộ (glow + ảnh) scale cùng nhau — giống zen-setup */}
      <Animated.View
        style={{
          width: CONTAINER,
          height: CONTAINER,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: breathAnim }],
        }}
      >
        {/* Glow ring */}
        <Animated.View
          style={{
            position: 'absolute',
            width: CONTAINER,
            height: CONTAINER,
            borderRadius: CONTAINER / 2,
            backgroundColor: COLORS.green[200],
            opacity: glowOpacity,
          }}
        />

        {/* Ảnh hoặc emoji */}
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{
              width: PLANT_SIZE,
              height: PLANT_SIZE,
              borderRadius: PLANT_SIZE / 2,
              borderWidth: 3,
              borderColor: 'rgba(255,255,255,0.6)',
            }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: PLANT_SIZE,
              height: PLANT_SIZE,
              borderRadius: PLANT_SIZE / 2,
              backgroundColor: COLORS.green[50],
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 3,
              borderColor: COLORS.green.light,
            }}
          >
            <Text style={{ fontSize: PLANT_SIZE * 0.42 }}>
              {STAGE_EMOJI[status] ?? '🌿'}
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
