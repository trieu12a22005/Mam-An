import { AppText as Text } from '../../src/components/common/AppText';
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../../src/components/common/Screen';
import { MoodSelector } from '../../src/components/journal/MoodSelector';
import { AppButton } from '../../src/components/common/AppButton';
import { LoadingView } from '../../src/components/common/LoadingView';
import { EmptyState } from '../../src/components/common/EmptyState';
import { useJournal } from '../../src/hooks/useJournal';
import { MoodLevel, MoodJournal } from '../../src/types/journal.type';
import { COLORS } from '../../src/constants/colors';
import { formatDate } from '../../src/utils/date';

// ── Mood config ───────────────────────────────────────────────────────────────
const MOOD_EMOJI: Record<MoodLevel, string> = {
  VERY_BAD: '😣', BAD: '😔', NORMAL: '😐', GOOD: '🙂', VERY_GOOD: '😄',
};
const MOOD_LABEL: Record<MoodLevel, string> = {
  VERY_BAD: 'Rất tệ', BAD: 'Không vui', NORMAL: 'Bình thường',
  GOOD: 'Tốt', VERY_GOOD: 'Rất tốt',
};
const LOW_MOOD_LEVELS: MoodLevel[] = ['VERY_BAD', 'BAD'];

// ── Journal history item ──────────────────────────────────────────────────────
const JournalItem: React.FC<{ item: MoodJournal }> = ({ item }) => (
  <View style={histStyles.card}>
    <View style={histStyles.row}>
      <Text style={histStyles.emoji}>{MOOD_EMOJI[item.mood]}</Text>
      <View style={histStyles.info}>
        <Text style={histStyles.label}>{MOOD_LABEL[item.mood]}</Text>
        <Text style={histStyles.date}>{formatDate(item.createdAt, 'DD/MM/YYYY · HH:mm')}</Text>
      </View>
    </View>
    {item.note && <Text style={histStyles.note}>{item.note}</Text>}
  </View>
);

const histStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emoji: { fontSize: 28 },
  info: { flex: 1, gap: 2 },
  label: { fontSize: 15, fontWeight: '600', color: COLORS.text.primary },
  date: { fontSize: 12, color: COLORS.text.muted },
  note: { fontSize: 14, color: COLORS.text.secondary, lineHeight: 22 },
});

// ── Main screen ───────────────────────────────────────────────────────────────
export default function Journal() {
  const { journals, isLoading, isCreating, createJournal } = useJournal();
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [note, setNote] = useState('');
  const insets = useSafeAreaInsets();

  const isLowMood = selectedMood !== null && LOW_MOOD_LEVELS.includes(selectedMood);

  const handleSave = async () => {
    if (!selectedMood) {
      Alert.alert('', 'Bạn cảm thấy thế nào hôm nay? Hãy chọn một cảm xúc nhé.');
      return;
    }
    try {
      await createJournal({ mood: selectedMood, note });
      setSelectedMood(null);
      setNote('');
    } catch {
      Alert.alert('Ôi!', 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  if (isLoading) return <LoadingView message="Đang tải nhật ký..." />;

  return (
    <Screen padded={false}>
      <FlatList
        data={journals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerArea}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Nhật ký cảm xúc 📖</Text>
              <Text style={styles.subtitle}>
                Hôm nay bạn cảm thấy thế nào? Không cần phải hoàn hảo.
              </Text>
            </View>

            {/* Form card */}
            <View style={styles.formCard}>
              <Text style={styles.formLabel}>Cảm xúc của bạn hôm nay</Text>
              <MoodSelector selected={selectedMood} onChange={setSelectedMood} />

              {/* Low mood gentle message */}
              {isLowMood && (
                <View style={styles.gentleBox}>
                  <Text style={styles.gentleText}>
                    🌿 Những ngày khó khăn cũng là một phần bình thường.{'\n'}
                    Nếu cảm giác này kéo dài, bạn có thể cân nhắc chia sẻ với người thân hoặc chuyên gia.
                  </Text>
                </View>
              )}

              {/* Note input */}
              <Text style={styles.formLabel}>Ghi chú (tùy chọn)</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Hôm nay mình cảm thấy..."
                placeholderTextColor={COLORS.text.muted}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                maxLength={300}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{note.length}/300</Text>

              <AppButton
                title="Lưu nhật ký"
                onPress={handleSave}
                loading={isCreating}
                disabled={!selectedMood}
              />
            </View>

            {/* History header */}
            {journals.length > 0 && (
              <Text style={styles.historyTitle}>Lịch sử cảm xúc</Text>
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
        renderItem={({ item }) => <JournalItem item={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  headerArea: { gap: 20, marginBottom: 20 },
  header: { gap: 6 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text.primary },
  subtitle: { fontSize: 14, color: COLORS.text.muted, lineHeight: 22 },

  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  formLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text.secondary },

  gentleBox: {
    backgroundColor: COLORS.green[50],
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.green.main,
  },
  gentleText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },

  noteInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: COLORS.text.primary,
    minHeight: 90,
  },
  charCount: { fontSize: 11, color: COLORS.text.muted, textAlign: 'right', marginTop: -8 },

  historyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
});
