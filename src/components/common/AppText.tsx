import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

/**
 * AppText — wrapper Text với font mặc định của app.
 * Dùng thay `Text` của RN để đồng bộ typography toàn app.
 */
export const AppText: React.FC<TextProps> = ({ style, ...props }) => (
  <Text style={[styles.base, style]} {...props} />
);

const styles = StyleSheet.create({
  base: {
    color: COLORS.text.primary,
    fontSize: 14,
  },
});
