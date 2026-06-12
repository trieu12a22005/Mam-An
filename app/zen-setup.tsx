import { AppText as Text } from '../src/components/common/AppText';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Image, ActivityIndicator, Animated, Dimensions,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedScreen } from '../src/components/theme/ThemedScreen';
import { useTimeTheme } from '../src/contexts/TimeThemeContext';
import { useZenPlant } from '../src/hooks/useZenPlant';
import { calmSessionStore } from '../src/store/calmSessionStore';

const { width: SCREEN_W } = Dimensions.get('window');
const PREVIEW_SIZE = SCREEN_W * 0.55; // ảnh preview to ở giữa

/**
 * Màn hình chọn cây Zen trước khi chọn nhạc.
 * Luồng: calm-space → zen-setup → music-select → (dismiss 2) → calm-space
 */
export default function ZenSetupScreen() {
  const { colors } = useTimeTheme();
  const insets = useSafeAreaInsets();
  const { flowerTypes, selectedFlowerType, selectZenPlant } = useZenPlant();
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(null);

  // Animation nhịp thở cho ảnh preview
  const breathAnim = useRef(new Animated.Value(1)).current;
  const glowAnim  = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(breathAnim, { toValue: 1.13, duration: 2200, useNativeDriver: true }),
          Animated.timing(glowAnim,   { toValue: 0.7,  duration: 2200, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(breathAnim, { toValue: 1.0,  duration: 2200, useNativeDriver: true }),
          Animated.timing(glowAnim,   { toValue: 0.2,  duration: 2200, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [breathAnim, glowAnim]);

  // Sync selection khi mount (chỉ lần đầu, không trigger lại khi quay từ music-select)
  const didInitRef = useRef(false);
  useFocusEffect(useCallback(() => {
    if (!didInitRef.current) {
      setLocalSelectedId(selectedFlowerType?.id ?? null);
      didInitRef.current = true;
    }
  }, [selectedFlowerType?.id]));

  const effectiveId = localSelectedId ?? selectedFlowerType?.id ?? null;
  const previewPlant = flowerTypes.find(f => f.id === effectiveId) ?? flowerTypes[0];

  const navigateToMusic = () => {
    // Dùng router.replace để thay zen-setup bằng music-select trong stack
    // → stack sẽ là: calm-space → music-select (không còn zen-setup)
    // → khi music-select dismiss(1) sẽ về thẳng calm-space
    router.replace('/music-select' as any);
  };

  const handleConfirm = () => {
    if (effectiveId) {
      selectZenPlant(effectiveId);
      calmSessionStore.setZenPlantId(effectiveId);
    }
    navigateToMusic();
  };

  const handleSkip = () => navigateToMusic();

  return (
    <ThemedScreen showNightEffects nightEffectIntensity="normal" avoidKeyboard={false}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backIcon, { color: colors.primary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Chọn cây thư giãn 🌿</Text>
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={[styles.skipText, { color: colors.textMuted }]}>Bỏ qua</Text>
        </TouchableOpacity>
      </View>

      {/* Preview cây đang chọn — to, có animation nhịp thở */}
      <View style={styles.previewWrap}>
        {/* Toàn bộ cây (glow + ảnh) scale cùng nhau */}
        <Animated.View
          style={{
            width: PREVIEW_SIZE + 48,
            height: PREVIEW_SIZE + 48,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: breathAnim }],
          }}
        >
          {/* Glow ring — opacity */}
          <Animated.View
            style={{
              position: 'absolute',
              width: PREVIEW_SIZE + 48,
              height: PREVIEW_SIZE + 48,
              borderRadius: (PREVIEW_SIZE + 48) / 2,
              backgroundColor: colors.primarySoft,
              opacity: glowAnim,
            }}
          />
          {/* Ảnh cây */}
          {previewPlant?.imageUrl ? (
            <Image
              source={{ uri: previewPlant.imageUrl }}
              style={{
                width: PREVIEW_SIZE,
                height: PREVIEW_SIZE,
                borderRadius: PREVIEW_SIZE / 2,
                borderWidth: 3,
                borderColor: 'rgba(255,255,255,0.6)',
              }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: PREVIEW_SIZE,
                height: PREVIEW_SIZE,
                borderRadius: PREVIEW_SIZE / 2,
                backgroundColor: colors.surfaceSoft,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 3,
                borderColor: 'rgba(255,255,255,0.3)',
              }}
            >
              <Text style={{ fontSize: PREVIEW_SIZE * 0.4 }}>🌸</Text>
            </View>
          )}
        </Animated.View>

        {/* Tên cây đang chọn */}
        <Text style={[styles.previewName, { color: colors.text }]}>
          {previewPlant?.name ?? 'Chọn cây bên dưới'}
        </Text>
        <Text style={[styles.previewHint, { color: colors.textMuted }]}>
          Nhịp thở của cây sẽ đồng hành cùng bạn
        </Text>
      </View>

      {/* Danh sách cây — chọn 1 */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {flowerTypes.length === 0 ? (
          <View style={styles.emptyWrap}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Đang tải danh sách cây...
            </Text>
          </View>
        ) : (
          <View style={styles.chipRow}>
            {flowerTypes.map((f) => {
              const isSelected = effectiveId === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setLocalSelectedId(f.id)}
                  activeOpacity={0.75}
                >
                  {f.imageUrl ? (
                    <Image source={{ uri: f.imageUrl }} style={styles.chipImg} resizeMode="cover" />
                  ) : (
                    <Text style={styles.chipEmoji}>🌸</Text>
                  )}
                  <Text style={[styles.chipName, { color: isSelected ? '#fff' : colors.text }]}>
                    {f.name}
                  </Text>
                  {isSelected && <Text style={styles.chipTick}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* CTA */}
      <View style={[styles.ctaWrap, { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom + 16, 40) }]}>
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: effectiveId ? colors.primary : colors.border }]}
          onPress={handleConfirm}
          activeOpacity={0.85}
          disabled={!effectiveId}
        >
          <Text style={styles.ctaBtnText}>Tiếp theo — Chọn nhạc 🎵</Text>
        </TouchableOpacity>
      </View>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 22 },
  skipBtn: { padding: 4 },
  skipText: { fontSize: 14 },
  title: { fontSize: 18, fontWeight: '700' },

  // Preview area
  previewWrap: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  glowRing: {
    position: 'absolute',
    alignSelf: 'center',
    top: 10,
  },
  previewImg: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  previewName: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  previewHint: {
    fontSize: 12,
    fontStyle: 'italic',
  },

  // Chips
  listContent: { paddingHorizontal: 20 },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    paddingTop: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipImg: { width: 24, height: 24, borderRadius: 12 },
  chipEmoji: { fontSize: 18 },
  chipName: { fontSize: 14, fontWeight: '600' },
  chipTick: { fontSize: 12, color: '#fff', fontWeight: '700' },

  emptyWrap: { alignItems: 'center', gap: 12, paddingTop: 60 },
  emptyText: { fontSize: 14 },

  // CTA
  ctaWrap: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  ctaBtn: {
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
