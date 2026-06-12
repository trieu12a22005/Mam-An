import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, Alert, ActivityIndicator, Image,
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
const getEmoji = (name: string) => FLOWER_EMOJIS[name] ?? '🌸';

// ── Availability badge ────────────────────────────────────────────────────────
const AvailabilityBadge: React.FC<{ count: number }> = ({ count }) => {
  if (count === 0) {
    return (
      <View style={[badge.wrap, badge.empty]}>
        <Text style={[badge.text, badge.textEmpty]}>⏳ Hết cây</Text>
      </View>
    );
  }
  if (count <= 3) {
    return (
      <View style={[badge.wrap, badge.low]}>
        <Text style={[badge.text, badge.textLow]}>⚠️ Còn {count} cây</Text>
      </View>
    );
  }
  return (
    <View style={[badge.wrap, badge.ok]}>
      <Text style={[badge.text, badge.textOk]}>✅ {count} cây sẵn sàng</Text>
    </View>
  );
};

const badge = StyleSheet.create({
  wrap: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start' },
  text: { fontSize: 11, fontWeight: '600' },
  empty: { backgroundColor: '#FEE2E2' },
  textEmpty: { color: '#DC2626' },
  low:   { backgroundColor: '#FEF3C7' },
  textLow: { color: '#D97706' },
  ok:    { backgroundColor: '#DCFCE7' },
  textOk: { color: '#16A34A' },
});

// ── Garden chips ──────────────────────────────────────────────────────────────
const GardenChips: React.FC<{ gardens: FlowerType['gardens'] }> = ({ gardens }) => {
  if (gardens.length === 0) {
    return (
      <Text style={chipStyles.none}>Chưa có nhà vườn nào đăng ký</Text>
    );
  }
  return (
    <View style={chipStyles.row}>
      {gardens.slice(0, 3).map((g) => (
        <View key={g.id} style={chipStyles.chip}>
          <Text style={chipStyles.chipText} numberOfLines={1}>🏡 {g.name}</Text>
        </View>
      ))}
      {gardens.length > 3 && (
        <View style={chipStyles.chip}>
          <Text style={chipStyles.chipText}>+{gardens.length - 3}</Text>
        </View>
      )}
    </View>
  );
};

const chipStyles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 4 },
  chip: {
    backgroundColor: COLORS.green.light,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 8,
  },
  chipText: { fontSize: 11, color: COLORS.green.dark, fontWeight: '500' },
  none: { fontSize: 11, color: COLORS.text.muted, fontStyle: 'italic', marginTop: 4 },
});

// ── Flower card ───────────────────────────────────────────────────────────────
const FlowerCard: React.FC<{
  flower: FlowerType;
  selected: boolean;
  onSelect: () => void;
}> = ({ flower, selected, onSelect }) => {
  const unavailable = flower.availableCount === 0;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected && styles.cardSelected,
        unavailable && styles.cardUnavailable,
      ]}
      onPress={onSelect}
      activeOpacity={unavailable ? 1 : 0.8}
      disabled={unavailable}
    >
      {/* Ảnh hoặc emoji */}
      {flower.imageUrl ? (
        <Image
          source={{ uri: flower.imageUrl }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      ) : (
        <Text style={styles.cardEmoji}>{getEmoji(flower.name)}</Text>
      )}

      <View style={styles.cardInfo}>
        {/* Tên + badge sẵn có */}
        <View style={styles.cardNameRow}>
          <Text style={[styles.cardName, selected && styles.cardNameSelected, unavailable && styles.cardNameMuted]}>
            {flower.name}
          </Text>
          <AvailabilityBadge count={flower.availableCount} />
        </View>

        {/* Mô tả */}
        {flower.description && (
          <Text style={styles.cardDesc} numberOfLines={2}>
            {flower.description}
          </Text>
        )}

        {/* Thời gian */}
        {flower.defaultDuration && (
          <Text style={styles.cardDuration}>
            🗓 ~{flower.defaultDuration} ngày để nở hoa
          </Text>
        )}

        {/* Nhà vườn */}
        <GardenChips gardens={flower.gardens} />
      </View>

      {/* Radio */}
      {!unavailable && (
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected && <View style={styles.radioDot} />}
        </View>
      )}
    </TouchableOpacity>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────
export default function SelectFlower() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');

  const { data: flowers = [], isLoading } = useQuery({
    queryKey: ['flowerTypes'],
    queryFn: plantService.getFlowerTypes,
    staleTime: 2 * 60 * 1000, // 2 phút — refresh để cập nhật availableCount
  });

  const { mutate: startPlant, isPending } = useMutation({
    mutationFn: () =>
      plantService.startVirtualPlant(selectedId!, nickname.trim() || undefined),
    onSuccess: (newPlant) => {
      qc.setQueryData(['virtualPlant'], newPlant);
      qc.invalidateQueries({ queryKey: ['virtualPlant'] });
      qc.invalidateQueries({ queryKey: ['flowerTypes'] }); // refresh số cây sẵn có
      router.replace('/(tabs)/home');
    },
    onError: (err: any) => {
      const backendMsg = err.response?.data?.message || err.message;
      const msg = err.message.includes('No available real plant')
        ? 'Hiện chưa có cây thật nào sẵn sàng cho loại hoa này.\nVui lòng thử loại khác hoặc quay lại sau.'
        : `Có lỗi xảy ra: ${backendMsg}\nVui lòng thử lại.`;
      Alert.alert('Không thể bắt đầu', msg);
    },
  });

  const handleSelect = (flower: FlowerType) => {
    if (flower.availableCount === 0) return; // không thể chọn khi hết cây
    setSelectedId(flower.id);
  };

  const handleStart = () => {
    if (!selectedId) {
      Alert.alert('', 'Hãy chọn một loại hoa trước nhé 🌸');
      return;
    }
    startPlant();
  };

  if (isLoading) return <LoadingView message="Đang tải danh sách hoa..." />;

  const selectedFlower = flowers.find((f) => f.id === selectedId);
  const available = flowers.filter((f) => f.availableCount > 0);
  const unavailable = flowers.filter((f) => f.availableCount === 0);
  // Sắp xếp: còn cây trước, hết cây sau
  const sorted = [...available, ...unavailable];

  return (
    <View style={styles.root}>
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

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          <Text style={styles.statsNum}>{available.length}</Text>/{flowers.length} loài còn cây sẵn sàng
        </Text>
      </View>

      {/* Flower list */}
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              {'Chưa có loại hoa nào.\nAdmin cần thêm hoa trước.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <FlowerCard
            flower={item}
            selected={selectedId === item.id}
            onSelect={() => handleSelect(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />

      {/* Nickname input + CTA */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
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
              {selectedFlower
                ? `Bắt đầu với ${getEmoji(selectedFlower.name)} ${selectedFlower.name} →`
                : 'Chọn một loại hoa'}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          🌿 Cây thật sẽ được gắn từ nhà vườn phù hợp sau khi bạn chọn.
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

  statsBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.green.light,
  },
  statsText: { fontSize: 13, color: COLORS.green.dark },
  statsNum: { fontWeight: '700' },

  list: { padding: 16, paddingBottom: 8 },

  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  cardSelected: {
    borderColor: COLORS.green.main,
    backgroundColor: '#F0FDF4',
  },
  cardUnavailable: {
    opacity: 0.55,
    backgroundColor: '#F9FAFB',
  },
  cardImage: {
    width: 56, height: 56, borderRadius: 12,
  },
  cardEmoji: { fontSize: 40, width: 56, textAlign: 'center', marginTop: 4 },
  cardInfo: { flex: 1, gap: 4 },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  cardName: { fontSize: 16, fontWeight: '700', color: COLORS.text.primary },
  cardNameSelected: { color: COLORS.green.dark },
  cardNameMuted: { color: COLORS.text.muted },
  cardDesc: { fontSize: 13, color: COLORS.text.muted, lineHeight: 19 },
  cardDuration: { fontSize: 12, color: COLORS.green.main, fontWeight: '500' },

  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 2, flexShrink: 0,
  },
  radioSelected: { borderColor: COLORS.green.main },
  radioDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: COLORS.green.main,
  },

  emptyBox: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: COLORS.text.muted, textAlign: 'center', lineHeight: 22 },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
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
  startBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  disclaimer: {
    fontSize: 12,
    color: COLORS.text.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
