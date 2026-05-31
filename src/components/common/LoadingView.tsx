import { AppText as Text } from './AppText';
import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Image, Animated } from 'react-native';
import { COLORS } from '../../constants/colors';

interface LoadingViewProps {
  message?: string;
}

export const LoadingView: React.FC<LoadingViewProps> = ({
  message = 'Đang tải...',
}) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -8, duration: 600, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0,  duration: 600, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../../../assets/thinking.png')}
        style={[styles.character, { transform: [{ translateY: bounceAnim }] }]}
        resizeMode="cover"
      />
      <ActivityIndicator size="large" color={COLORS.green.main} style={styles.spinner} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    gap: 12,
  },
  character: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.green.light,
  },
  spinner: {
    marginVertical: 4,
  },
  message: {
    color: COLORS.text.muted,
    fontSize: 15,
  },
});
