import { AppText as Text } from '../../../components/common/AppText';
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../../../constants/colors';

interface Props {
  emoji: string;
  unlocked: boolean;
  size?: number;
}

export const AchievementBadge: React.FC<Props> = ({ emoji, unlocked, size = 52 }) => {
  const scaleAnim = useRef(new Animated.Value(unlocked ? 1 : 0.92)).current;
  const glowAnim = useRef(new Animated.Value(unlocked ? 0.6 : 0)).current;

  useEffect(() => {
    if (!unlocked) return;
    // Gentle pulse when unlocked
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, { toValue: 1.06, duration: 1800, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, { toValue: 1.0, duration: 1800, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.5, duration: 1800, useNativeDriver: true }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [unlocked, scaleAnim, glowAnim]);

  const circleSize = size;

  return (
    <View style={{ width: circleSize + 8, height: circleSize + 8, alignItems: 'center', justifyContent: 'center' }}>
      {/* Glow halo */}
      {unlocked && (
        <Animated.View
          style={[
            styles.glow,
            {
              width: circleSize + 12,
              height: circleSize + 12,
              borderRadius: (circleSize + 12) / 2,
              opacity: glowAnim,
            },
          ]}
        />
      )}
      <Animated.View
        style={[
          styles.circle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            backgroundColor: unlocked ? COLORS.green[100] : '#F1F1F1',
            borderColor: unlocked ? COLORS.green[300] : '#E0E0E0',
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text
          style={[
            styles.emoji,
            { fontSize: circleSize * 0.44, opacity: unlocked ? 1 : 0.35 },
          ]}
        >
          {emoji}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    backgroundColor: COLORS.green[200],
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  emoji: {
    lineHeight: undefined,
  },
});
