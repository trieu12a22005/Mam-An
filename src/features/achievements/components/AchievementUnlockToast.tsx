import { AppText as Text } from '../../../components/common/AppText';
import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UnlockNotification } from '../types/achievement.types';
import { COLORS } from '../../../constants/colors';

interface Props {
  notification: UnlockNotification | null;
  onDismiss: () => void;
}

export const AchievementUnlockToast: React.FC<Props> = ({ notification, onDismiss }) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);

  useEffect(() => {
    if (!notification) {
      // Slide out
      translateY.value = withTiming(-120, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(0.92, { duration: 300 });
      return;
    }

    // Slide in with spring bounce
    translateY.value = withSpring(0, { damping: 14, stiffness: 180 });
    opacity.value    = withTiming(1, { duration: 250 });
    scale.value      = withSequence(
      withSpring(1.04, { damping: 10, stiffness: 200 }),
      withSpring(1.0,  { damping: 18, stiffness: 200 }),
    );

    // Auto dismiss after 3.5s
    const timer = setTimeout(() => {
      translateY.value = withTiming(-120, { duration: 300 });
      opacity.value    = withTiming(0, { duration: 300 });
    }, 3500);

    return () => clearTimeout(timer);
  }, [notification]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  if (!notification) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + 12 },
        animStyle,
      ]}
    >
      <TouchableOpacity
        style={styles.inner}
        onPress={onDismiss}
        activeOpacity={0.9}
      >
        {/* Shimmer dot */}
        <View style={styles.emojiWrap}>
          <Text style={styles.emoji}>{notification.emoji}</Text>
        </View>

        {/* Text */}
        <View style={styles.textWrap}>
          <Text style={styles.label}>Thành tựu mở khóa ✨</Text>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
        </View>

        {/* Close hint */}
        <Text style={styles.closeHint}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 20,
    // Shadow iOS
    shadowColor: COLORS.green.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    gap: 12,
    borderWidth: 1.5,
    borderColor: COLORS.green[200],
    // Soft green left bar via borderLeftColor
    borderLeftWidth: 4,
    borderLeftColor: COLORS.green.main,
  },
  emojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.green[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 22 },
  textWrap: { flex: 1, gap: 2 },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.green.dark,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  closeHint: {
    fontSize: 13,
    color: COLORS.text.muted,
    paddingHorizontal: 4,
  },
});
