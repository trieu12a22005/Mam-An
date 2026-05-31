import { AppText as Text } from '../../src/components/common/AppText';
import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../../src/components/common/Screen';
import { MoodSelector } from '../../src/components/journal/MoodSelector';
import { AppButton } from '../../src/components/common/AppButton';
import { LoadingView } from '../../src/components/common/LoadingView';
import { EmptyState } from '../../src/components/common/EmptyState';
import { useJournal } from '../../src/hooks/useJournal';
import { MoodType, MoodJournal } from '../../src/types/journal.type';
import { MOOD_OPTIONS, getMoodOption } from '../../src/constants/moods';
import { COLORS } from '../../src/constants/colors';
import { formatDate } from '../../src/utils/date';

// ── Mood xấu cần hiển thị lời nhắc nhẹ ─────────────────────────────────────
const NEGATIVE_MOODS: MoodType[] = ['SAD', 'ANXIOUS', 'TIRED'];

// ── Journal history item ────────────────────────────────────────────────────
const JournalItem: React.FC<{ item: MoodJournal }> = ({ item }) => {
  const option = getMoodOption(item.mood);
  return (
    <View style={histStyles.card}>
      <View style={histStyles.row}>
        {option && (
          <Image
            source={option.icon}
            style={histStyles.icon}
            resizeMode="contain"
          />
        )}
        <View style={histStyles.info}>
          <Text style={histStyles.label}>
            {option?.label ?? item.mood}
          </Text>
          <Text style={histStyles.date}>
            {formatDate(item.createdAt, 'DD/MM/YYYY · HH:mm')}
          </Text>
        </View>
      </View>
      {item.note ? (
        <Text style={histStyles.note}>{item.note}</Text>
      ) : null}
      {item.aiReply ? (
        <View style={histStyles.aiBox}>
          <Text style={histStyles.aiLabel}>🌱 Lời nhắn từ cây</Text>
          <Text style={histStyles.aiText}>{item.aiReply}</Text>
        </View>
      ) : null}
    </View>
  );
};

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
  icon: { width: 36, height: 36 },
  info: { flex: 1, gap: 2 },
  label: { fontSize: 15, fontWeight: '600', color: COLORS.text.primary },
  date: { fontSize: 12, color: COLORS.text.muted },
  note: { fontSize: 14, color: COLORS.text.secondary, lineHeight: 22 },
  aiBox: {
    backgroundColor: COLORS.green[50],
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.green.dark,
  },
  aiText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
});

// ── Main screen ──────────────────────────────────────────────────────────────
export default function Journal() {
  const { journals, isLoading, isCreating, createJournal } = useJournal();
  const [selectedMood, setSelectedMood] = useState<MoodType | undefined>(
    undefined,
  );
  const [note, setNote] = useState('');
  const insets = useSafeAreaInsets();

  const currentOption = selectedMood ? getMoodOption(selectedMood) : undefined;
  const isNegativeMood =
    selectedMood !== undefined && NEGATIVE_MOODS.includes(selectedMood);

  const handleSave = async () => {
    if (!selectedMood) {
      Alert.alert('', 'Bạn hãy chọn một cảm xúc gần với hôm nay nhé.');
      return;
    }
    try {
      await createJournal({ mood: selectedMood, note });
      setSelectedMood(undefined);
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
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 40 },
        ]}
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
              <Text style={styles.formLabel}>Hôm nay của bạn thế nào? Cùng tâm sự nhé</Text>

              <MoodSelector
                selectedMood={selectedMood}
                onSelect={setSelectedMood}
              />

              {/* Mood description + softMessage */}
              {currentOption && (
                <View style={styles.moodDescBox}>
                  <Text style={styles.moodDesc}>
                    {currentOption.description}
                  </Text>
                  <Text style={styles.softMsg}>
                    🌿 {currentOption.softMessage}
                  </Text>
                </View>
              )}

              {/* Negative mood gentle reminder */}
              {isNegativeMood && (
                <View style={styles.gentleBox}>
                  <Text style={styles.gentleText}>
                    🌿 Những ngày khó khăn cũng là một phần bình thường.
                    {'\n'}Nếu cảm giác này kéo dài, bạn có thể cân nhắc chia
                    sẻ với người thân hoặc chuyên gia.
                  </Text>
                </View>
              )}

              {/* Note input */}
              <Text style={styles.formLabel}>Ghi chú (tùy chọn)</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Viết một dòng cho hôm nay nếu bạn muốn..."
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
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },

  moodDescBox: {
    backgroundColor: COLORS.cream,
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  moodDesc: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
  softMsg: {
    fontSize: 13,
    color: COLORS.green.dark,
    lineHeight: 20,
    fontStyle: 'italic',
  },

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
  charCount: {
    fontSize: 11,
    color: COLORS.text.muted,
    textAlign: 'right',
    marginTop: -8,
  },

  historyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
});
