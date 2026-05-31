import { AppText as Text } from '../common/AppText';
import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { MoodType } from '../../types/journal.type';
import { MOOD_OPTIONS } from '../../constants/moods';
import { COLORS } from '../../constants/colors';

interface MoodSelectorProps {
  selectedMood?: MoodType;
  onSelect: (mood: MoodType) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onSelect,
}) => {
  return (
    <View style={styles.grid}>
      {MOOD_OPTIONS.map((option) => {
        const isSelected = selectedMood === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.card,
              isSelected && {
                borderColor: option.color,
                backgroundColor: option.color + '18',
                shadowColor: option.color,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 6,
                elevation: 4,
                transform: [{ scale: 1.04 }],
              },
            ]}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.7}
          >
            <Image
              source={option.icon}
              style={[
                styles.icon,
                !isSelected && styles.iconUnselected,
              ]}
              resizeMode="contain"
            />
            <Text
              style={[
                styles.label,
                isSelected && {
                  color: option.color,
                  fontWeight: '700',
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  card: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: 8,
  },
  icon: {
    width: 52,
    height: 52,
  },
  iconUnselected: {
    opacity: 0.65,
  },
  label: {
    fontSize: 12,
    color: COLORS.text.muted,
    textAlign: 'center',
    fontWeight: '500',
  },
});
