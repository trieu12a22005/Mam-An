import { AppText as Text } from '../../src/components/common/AppText';
import React, { useState } from 'react';
import {
  View, TextInput, StyleSheet, FlatList, Image, Alert, TouchableOpacity
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedScreen } from '../../src/components/theme/ThemedScreen';
import { MoodSelector } from '../../src/components/journal/MoodSelector';
import { AppButton } from '../../src/components/common/AppButton';
import { LoadingView } from '../../src/components/common/LoadingView';
import { PremiumUpgradeModal } from '../../src/components/common/PremiumUpgradeModal';
import { EmptyState } from '../../src/components/common/EmptyState';
import { useJournal } from '../../src/hooks/useJournal';
import { useTimeTheme } from '../../src/contexts/TimeThemeContext';
import { MoodType, MoodJournal } from '../../src/types/journal.type';
import { MOOD_OPTIONS, getMoodOption } from '../../src/constants/moods';
import { COLORS } from '../../src/constants/colors';
import { formatDate } from '../../src/utils/date';
import { useMyEntitlements } from '../../src/hooks/usePlans';
import { useRouter } from 'expo-router';

const NEGATIVE_MOODS: MoodType[] = ['SAD', 'ANXIOUS', 'TIRED'];

// ── Journal history item (nhận colors qua prop) ───────────────────────────────
const JournalItem: React.FC<{
  item: MoodJournal;
  colors: ReturnType<typeof useTimeTheme>['colors'];
}> = ({ item, colors }) => {
  const option = getMoodOption(item.mood);
  return (
    <View style={[
      hStyles.card,
      { backgroundColor: colors.surface, borderColor: colors.border },
    ]}>
      <View style={hStyles.row}>
        {option && (
          <Image source={option.icon} style={hStyles.icon} resizeMode="contain" />
        )}
        <View style={hStyles.info}>
          <Text style={[hStyles.label, { color: colors.text }]}>
            {option?.label ?? item.mood}
          </Text>
          <Text style={[hStyles.date, { color: colors.textMuted }]}>
            {formatDate(item.createdAt, 'DD/MM/YYYY · HH:mm')}
          </Text>
        </View>
      </View>
      {item.note ? (
        <Text style={[hStyles.note, { color: colors.text }]}>{item.note}</Text>
      ) : null}
      {item.aiReply ? (
        <View style={[hStyles.aiBox, { backgroundColor: colors.surfaceSoft }]}>
          <Text style={[hStyles.aiLabel, { color: colors.primary }]}>🌱 Lời nhắn từ cây</Text>
          <Text style={[hStyles.aiText, { color: colors.text }]}>{item.aiReply}</Text>
        </View>
      ) : null}
    </View>
  );
};

const hStyles = StyleSheet.create({
  card: {
    borderRadius: 14, padding: 14, gap: 8,
    borderWidth: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 36, height: 36 },
  info: { flex: 1, gap: 2 },
  label: { fontSize: 15, fontWeight: '600' },
  date: { fontSize: 12 },
  note: { fontSize: 14, lineHeight: 22 },
  aiBox: { borderRadius: 10, padding: 12, gap: 4 },
  aiLabel: { fontSize: 12, fontWeight: '600' },
  aiText: { fontSize: 13, lineHeight: 20 },
});

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Journal() {
  const { journals, isLoading, isCreating, createJournal } = useJournal();
  const { data: entitlements } = useMyEntitlements();
  const router = useRouter();
  const { colors } = useTimeTheme();
  const [selectedMood, setSelectedMood] = useState<MoodType | undefined>(undefined);
  const [note, setNote] = useState('');
  const [useAi, setUseAi] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const insets = useSafeAreaInsets();

  const currentOption = selectedMood ? getMoodOption(selectedMood) : undefined;
  const isNegativeMood = selectedMood !== undefined && NEGATIVE_MOODS.includes(selectedMood);

  const handleToggleAi = () => {
    if (!useAi) {
      if (entitlements && !entitlements.canUseAiJournalReply) {
        setShowUpgradeModal(true);
        return;
      }
      setUseAi(true);
    } else {
      setUseAi(false);
    }
  };

  const handleSave = async () => {
    if (!selectedMood) {
      Alert.alert('', 'Bạn hãy chọn một cảm xúc gần với hôm nay nhé.');
      return;
    }
    try {
      // Backend handles AI reply based on entitlement implicitly, but we could pass useAi flag if needed.
      // For MVP, backend checks if user has entitlement, if yes, it generates.
      await createJournal({ mood: selectedMood, note });
      setSelectedMood(undefined);
      setNote('');
      setUseAi(false);
    } catch {
      Alert.alert('Ôi!', 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  if (isLoading) return <LoadingView message="Đang tải nhật ký..." />;

  return (
    <ThemedScreen showNightEffects>
      <FlatList
        data={journals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <View style={styles.headerArea}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Nhật ký cảm xúc 📖</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Hôm nay bạn cảm thấy thế nào? Không cần phải hoàn hảo.
              </Text>
            </View>

            {/* Form card */}
            <View style={[
              styles.formCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}>
              <Text style={[styles.formLabel, { color: colors.text }]}>
                Hôm nay của bạn thế nào? Cùng tâm sự nhé
              </Text>

              <MoodSelector selectedMood={selectedMood} onSelect={setSelectedMood} />

              {/* Mood description */}
              {currentOption && (
                <View style={[styles.moodDescBox, { backgroundColor: colors.surfaceSoft }]}>
                  <Text style={[styles.moodDesc, { color: colors.text }]}>
                    {currentOption.description}
                  </Text>
                  <Text style={[styles.softMsg, { color: colors.primary }]}>
                    🌿 {currentOption.softMessage}
                  </Text>
                </View>
              )}

              {/* Negative mood reminder */}
              {isNegativeMood && (
                <View style={[styles.gentleBox, {
                  backgroundColor: colors.primarySoft,
                  borderLeftColor: colors.primary,
                }]}>
                  <Text style={[styles.gentleText, { color: colors.text }]}>
                    🌿 Những ngày khó khăn cũng là một phần bình thường.{'\n'}
                    Nếu cảm giác này kéo dài, bạn có thể cân nhắc chia sẻ với người thân hoặc chuyên gia.
                  </Text>
                </View>
              )}

              {/* Note input */}
              <Text style={[styles.formLabel, { color: colors.text }]}>Ghi chú (tùy chọn)</Text>
              <TextInput
                style={[styles.noteInput, {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                }]}
                placeholder="Viết một dòng cho hôm nay nếu bạn muốn..."
                placeholderTextColor={colors.textMuted}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                maxLength={300}
                textAlignVertical="top"
              />
              <Text style={[styles.charCount, { color: colors.textMuted }]}>
                {note.length}/300
              </Text>

              <TouchableOpacity style={styles.aiToggleRow} onPress={handleToggleAi}>
                <Text style={[styles.aiToggleText, { color: colors.text }]}>🌱 Nhận phản hồi từ cây (AI)</Text>
                <View style={[styles.toggleCircle, useAi && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                  {useAi && <View style={styles.toggleDot} />}
                </View>
              </TouchableOpacity>

              <AppButton
                title="Lưu nhật ký"
                onPress={handleSave}
                loading={isCreating}
                disabled={!selectedMood}
              />
            </View>

            {journals.length > 0 && (
              <Text style={[styles.historyTitle, { color: colors.text }]}>
                Lịch sử cảm xúc
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="📖"
            title="Chưa có nhật ký nào"
            description="Ghi lại cảm xúc đầu tiên của bạn nhé."
          />
        }
        renderItem={({ item }) => <JournalItem item={item} colors={colors} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      <PremiumUpgradeModal 
        visible={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        context="upgrade_plus"
        title="Tính năng này thuộc Mầm Ảo Plus"
      />
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  headerArea: { gap: 20, marginBottom: 20 },
  header: { gap: 6 },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 14, lineHeight: 22 },

  formCard: {
    borderRadius: 20, padding: 20, gap: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  formLabel: { fontSize: 14, fontWeight: '600' },

  moodDescBox: { borderRadius: 12, padding: 14, gap: 6 },
  moodDesc: { fontSize: 14, lineHeight: 22 },
  softMsg: { fontSize: 13, lineHeight: 20, fontStyle: 'italic' },

  gentleBox: {
    borderRadius: 12, padding: 14,
    borderLeftWidth: 3,
  },
  gentleText: { fontSize: 13, lineHeight: 22 },

  noteInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    minHeight: 90,
  },
  charCount: { fontSize: 11, textAlign: 'right', marginTop: -8 },
  historyTitle: { fontSize: 17, fontWeight: '700' },
  aiToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
  },
  aiToggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFF',
  },
});
