import { AppText as Text } from '../common/AppText';
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MoodLevel } from '../../types/journal.type';
import { COLORS } from '../../constants/colors';

const MOODS: { level: MoodLevel; emoji: string; label: string; color: string }[] = [
  { level: 'VERY_BAD', emoji: '😣', label: 'Rất tệ',   color: '#FF6B6B' },
  { level: 'BAD',      emoji: '😔', label: 'Không vui', color: '#FFB347' },
  { level: 'NORMAL',   emoji: '😐', label: 'Bình thường',color: '#9DB0A0' },
  { level: 'GOOD',     emoji: '🙂', label: 'Tốt',      color: '#34C759' },
  { level: 'VERY_GOOD',emoji: '😄', label: 'Rất tốt',  color: '#00C896' },
];

interface MoodSelectorProps {
  selected: MoodLevel | null;
  onChange: (mood: MoodLevel) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ selected, onChange }) => {
  return (
    <View style={styles.container}>
      {MOODS.map(({ level, emoji, label, color }) => {
        const isSelected = selected === level;
        return (
          <TouchableOpacity
            key={level}
            style={[
              styles.item,
              isSelected && { backgroundColor: color + '22', borderColor: color },
            ]}
            onPress={() => onChange(level)}
            activeOpacity={0.75}
          >
            <Text style={[styles.emoji, isSelected && styles.emojiSelected]}>
              {emoji}
            </Text>
            <Text style={[styles.label, isSelected && { color, fontWeight: '700' }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: 6,
  },
  emoji: { fontSize: 28, opacity: 0.7 },
  emojiSelected: { opacity: 1 },
  label: {
    fontSize: 10,
    color: COLORS.text.muted,
    textAlign: 'center',
    fontWeight: '500',
  },
});
