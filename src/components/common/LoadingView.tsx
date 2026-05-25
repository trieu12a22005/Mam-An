import { AppText as Text } from './AppText';
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

interface LoadingViewProps {
  message?: string;
}

export const LoadingView: React.FC<LoadingViewProps> = ({
  message = 'Đang tải...',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🌱</Text>
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
  icon: {
    fontSize: 48,
  },
  spinner: {
    marginVertical: 8,
  },
  message: {
    color: COLORS.text.muted,
    fontSize: 15,
  },
});
