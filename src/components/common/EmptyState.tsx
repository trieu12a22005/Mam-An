import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useTimeTheme } from '../../contexts/TimeThemeContext';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '🌿',
  title,
  description,
}) => {
  const { colors } = useTimeTheme();

  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/image1.png')} style={{ width: 64, height: 64, borderRadius: 32, marginBottom: 16 }} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {description && <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 52,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
});
