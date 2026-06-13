import { AppText as Text } from '../../../components/common/AppText';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { useTimeTheme } from '../../../contexts/TimeThemeContext';

export const EmptyAchievement: React.FC = () => {
  const { colors } = useTimeTheme();
  return (
    <View style={styles.wrapper}>
      <Text style={styles.emoji}>🌱</Text>
      <Text style={[styles.title, { color: colors.text }]}>Hành trình đang bắt đầu</Text>
      <Text style={[styles.desc, { color: colors.textMuted }]}>
        Hãy chăm cây, viết nhật ký và thực hành Vườn Yên{'\n'}để mở khóa những dấu mốc đầu tiên.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 10,
  },
  emoji: { fontSize: 48 },
  title: { fontSize: 17, fontWeight: '600', textAlign: 'center' },
  desc: { fontSize: 13, lineHeight: 20, textAlign: 'center' },
});
