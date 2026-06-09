import { AppText as Text } from '../common/AppText';
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { FocusSessionOption } from '../../types/focusSession.type';
import { formatDurationLabel, getFocusSessionEmoji } from '../../constants/focusSessions';
import { useTimeTheme } from '../../contexts/TimeThemeContext';

interface Props {
  option: FocusSessionOption;
  isSelected: boolean;
  selectedDuration: number;
  onSelectDuration: (d: number) => void;
  onStart: () => void;
}

export const FocusSessionCard: React.FC<Props> = ({
  option, isSelected, selectedDuration, onSelectDuration, onStart,
}) => {
  const emoji = getFocusSessionEmoji(option.type);
  const { colors } = useTimeTheme();
  const [isCustom, setIsCustom] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');

  // Nếu bị bỏ chọn chế độ này, reset custom state
  useEffect(() => {
    if (!isSelected) {
      setIsCustom(false);
      setCustomMinutes('');
    }
  }, [isSelected]);

  // Tính lại phần thưởng tỷ lệ theo thời gian (dựa trên mốc nhỏ nhất)
  const minDuration = option.durations[0] || 60;
  const ratio = selectedDuration > 0 ? (selectedDuration / minDuration) : 1;
  const scaledReward = Math.max(1, Math.floor(option.rewardAmount * ratio));
  const scaledGrowth = Math.max(1, Math.floor(option.growthReward * ratio));

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: colors.surface,
        borderColor: isSelected ? colors.primary : colors.border,
      },
      isSelected && { backgroundColor: colors.surfaceSoft },
    ]}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.flex}>
          <Text style={[styles.label, { color: colors.text }]}>{option.label}</Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>{option.description}</Text>
        </View>
      </View>

      {/* Duration chips */}
      <View style={styles.chips}>
        {option.durations.map((d) => (
          <TouchableOpacity
            key={d}
            style={[
              styles.chip,
              { borderColor: colors.border, backgroundColor: colors.background },
              !isCustom && selectedDuration === d && { borderColor: colors.primary, backgroundColor: colors.primary },
            ]}
            onPress={() => {
              setIsCustom(false);
              onSelectDuration(d);
            }}
          >
            <Text style={[
              styles.chipText,
              { color: colors.textMuted },
              !isCustom && selectedDuration === d && { color: '#fff', fontWeight: '700' },
            ]}>
              {formatDurationLabel(d)}
            </Text>
          </TouchableOpacity>
        ))}
        {/* Nút Tùy chỉnh */}
        <TouchableOpacity
          style={[
            styles.chip,
            { borderColor: colors.border, backgroundColor: colors.background },
            isCustom && { borderColor: colors.primary, backgroundColor: colors.primary },
          ]}
          onPress={() => {
            setIsCustom(true);
            const m = parseInt(customMinutes) || 0;
            onSelectDuration(m * 60);
          }}
        >
          <Text style={[
            styles.chipText,
            { color: colors.textMuted },
            isCustom && { color: '#fff', fontWeight: '700' },
          ]}>
            Tùy chỉnh
          </Text>
        </TouchableOpacity>
      </View>

      {/* Input tùy chỉnh (chỉ hiện khi chọn Tùy chỉnh) */}
      {isCustom && (
        <View style={styles.customInputRow}>
          <TextInput
            style={[styles.customInput, {
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.text,
            }]}
            keyboardType="number-pad"
            placeholder="Nhập số phút (VD: 20)"
            placeholderTextColor={colors.textMuted}
            value={customMinutes}
            onChangeText={(val) => {
              const num = val.replace(/[^0-9]/g, '');
              setCustomMinutes(num);
              const m = parseInt(num) || 0;
              onSelectDuration(m * 60);
            }}
            maxLength={3}
          />
          <Text style={[styles.customInputLabel, { color: colors.textMuted }]}>phút</Text>
        </View>
      )}

      {/* Reward hint */}
      <Text style={[styles.rewardHint, { color: colors.textMuted }]}>
        +{scaledReward} {option.rewardResource} · +{scaledGrowth} điểm phát triển
      </Text>

      {/* Start button — chỉ hiện khi chọn duration */}
      {isSelected && selectedDuration > 0 && (
        <TouchableOpacity style={[styles.startBtn, { backgroundColor: colors.primary }]} onPress={onStart}>
          <Text style={styles.startBtnText}>Bắt đầu phiên →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
    gap: 14,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  emoji: { fontSize: 28, marginTop: 2 },
  flex: { flex: 1 },
  label: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  description: { fontSize: 13, lineHeight: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5,
  },
  chipText: { fontSize: 13, fontWeight: '500' },
  rewardHint: { fontSize: 12 },
  startBtn: {
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  customInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    flex: 1,
  },
  customInputLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});
