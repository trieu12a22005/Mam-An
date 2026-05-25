import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { plantService, FlowerType } from '../src/services/plant.service';
import { COLORS } from '../src/constants/colors';
import { LoadingView } from '../src/components/common/LoadingView';

// ── Emoji theo tên hoa ────────────────────────────────────────────────────────
const FLOWER_EMOJIS: Record<string, string> = {
  'Hoa hướng dương': '🌻',
  'Lavender': '💜',
  'Hoa sen': '🪷',
  'Hoa hồng': '🌹',
  'Hoa cúc': '🌼',
  'Sen đá': '🌵',
};
const getEmoji = (name: string) =>
  FLOWER_EMOJIS[name] ?? '🌸';

// ── Flower card ───────────────────────────────────────────────────────────────
const FlowerCard: React.FC<{
  flower: FlowerType;
  selected: boolean;
  onSelect: () => void;
}> = ({ flower, selected, onSelect }) => (
  <TouchableOpacity
    style={[styles.card, selected && styles.cardSelected]}
    onPress={onSelect}
    activeOpacity={0.8}
  >
    <Text style={styles.cardEmoji}>{getEmoji(flower.name)}</Text>
    <View style={styles.cardInfo}>
      <Text style={[styles.cardName, selected && styles.cardNameSelected]}>
        {flower.name}
      </Text>
      {flower.description && (
        <Text style={styles.cardDesc} numberOfLines={2}>
          {flower.description}
        </Text>
      )}
      {flower.defaultDuration && (
        <Text style={styles.cardDuration}>
          🗓 ~{flower.defaultDuration} ngày để nở hoa
        </Text>
      )}
    </View>
    <View style={[styles.radio, selected && styles.radioSelected]}>
      {selected && <View style={styles.radioDot} />}
    </View>
  </TouchableOpacity>
);

// ── Main screen ───────────────────────────────────────────────────────────────
export default function SelectFlower() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');

  const { data: flowers = [], isLoading } = useQuery({
    queryKey: ['flowerTypes'],
    queryFn: plantService.getFlowerTypes,
    staleTime: 10 * 60 * 1000,
  });

  const { mutate: startPlant, isPending } = useMutation({
    mutationFn: () =>
      plantService.startVirtualPlant(selectedId!, nickname.trim() || undefined),
    onSuccess: (newPlant) => {
      // Cập nhật cache virtualPlant ngay, không cần fetch lại
      qc.setQueryData(['virtualPlant'], newPlant);
      qc.invalidateQueries({ queryKey: ['virtualPlant'] });
      router.replace('/(tabs)/home');
    },
    onError: (err: Error) => {
      const msg = err.message.includes('No available real plant')
        ? 'Hiện chưa có cây thật nào sẵn sàng cho loại hoa này.\nVui lòng thử loại khác hoặc quay lại sau.'
        : 'Có lỗi xảy ra. Vui lòng thử lại.';
      Alert.alert('Không thể bắt đầu', msg);
    },
  });

  const handleStart = () => {
    if (!selectedId) {
      Alert.alert('', 'Hãy chọn một loại hoa trước nhé 🌸');
      return;
    }
    startPlant();
  };

  if (isLoading) return <LoadingView message="Đang tải danh sách hoa..." />;

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerTexts}>
          <Text style={styles.title}>Chọn hoa của bạn 🌸</Text>
          <Text style={styles.subtitle}>
            Mỗi hoa là một hành trình. Chọn loài bạn muốn đồng hành.
          </Text>
        </View>
      </View>

      {/* Flower list */}
      <FlatList
        data={flowers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={styles.emptyText}>
              Chưa có loại hoa nào.\nAdmin cần thêm hoa trước.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <FlowerCard
            flower={item}
            selected={selectedId === item.id}
            onSelect={() => setSelectedId(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      {/* Nickname input + CTA */}
      <View style={styles.footer}>
        {selectedId && (
          <TextInput
            style={styles.nicknameInput}
            placeholder="Đặt tên cho cây (tuỳ chọn)"
            placeholderTextColor={COLORS.text.muted}
            value={nickname}
            onChangeText={setNickname}
            maxLength={50}
            returnKeyType="done"
          />
        )}

        <TouchableOpacity
          style={[styles.startBtn, (!selectedId || isPending) && styles.startBtnDisabled]}
          onPress={handleStart}
          disabled={!selectedId || isPending}
          activeOpacity={0.85}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.startBtnText}>
              {selectedId ? `Bắt đầu với ${getEmoji(flowers.find(f => f.id === selectedId)?.name ?? '')} →` : 'Chọn một loại hoa'}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          🌿 Cây thật sẽ được nhà vườn chỉ định phù hợp sau khi bạn chọn.
        </Text>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.green.light,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 4,
  },
  backIcon: { fontSize: 26, color: COLORS.green.dark, lineHeight: 30 },
  headerTexts: { flex: 1, gap: 4 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text.primary },
  subtitle: { fontSize: 13, color: COLORS.text.muted, lineHeight: 20 },

  list: { padding: 16, paddingBottom: 8 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  cardSelected: {
    borderColor: COLORS.green.main,
    backgroundColor: COLORS.green[50],
  },
  cardEmoji: { fontSize: 40, width: 48, textAlign: 'center' },
  cardInfo: { flex: 1, gap: 4 },
  cardName: { fontSize: 16, fontWeight: '700', color: COLORS.text.primary },
  cardNameSelected: { color: COLORS.green.dark },
  cardDesc: { fontSize: 13, color: COLORS.text.muted, lineHeight: 19 },
  cardDuration: { fontSize: 12, color: COLORS.green.main, fontWeight: '500' },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  radioSelected: { borderColor: COLORS.green.main },
  radioDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: COLORS.green.main,
  },

  emptyBox: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyEmoji: { fontSize: 56 },
  emptyText: { fontSize: 14, color: COLORS.text.muted, textAlign: 'center', lineHeight: 22 },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  nicknameInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text.primary,
  },
  startBtn: {
    backgroundColor: COLORS.green.main,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startBtnDisabled: { backgroundColor: COLORS.green.light, opacity: 0.7 },
  startBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  disclaimer: {
    fontSize: 12,
    color: COLORS.text.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
