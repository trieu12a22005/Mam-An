import { AppText as Text } from '../../../components/common/AppText';
import React, { useState, useCallback } from 'react';
import {
  View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedScreen } from '../../../components/theme/ThemedScreen';
import { LoadingView } from '../../../components/common/LoadingView';
import { useTimeTheme } from '../../../contexts/TimeThemeContext';
import { COLORS } from '../../../constants/colors';
import { CATEGORY_LABELS, CATEGORY_EMOJIS } from '../data/achievements';
import { useAchievements } from '../hooks/useAchievements';
import { AchievementCard } from '../components/AchievementCard';
import { EmptyAchievement } from '../components/EmptyAchievement';
import { AchievementUnlockToast } from '../components/AchievementUnlockToast';
import { AchievementCategory } from '../types/achievement.types';

// ── Category filter ───────────────────────────────────────────────────────────
const CATEGORIES: Array<AchievementCategory | 'ALL'> = [
  'ALL', 'TREE_CARE', 'WELLNESS', 'JOURNAL', 'JOURNEY',
];

// ── Main Screen ───────────────────────────────────────────────────────────────
export function AchievementScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTimeTheme();

  const {
    achievements,
    isLoading,
    notification,
    getAchievements,
    getUnlockedAchievements,
    unlockedCount,
    totalCount,
    dismissNotification,
  } = useAchievements();

  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'ALL'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Achievements load từ AsyncStorage nên chỉ cần chờ 1 chút
    await new Promise((r) => setTimeout(r, 600));
    setIsRefreshing(false);
  }, []);

  // Filter + sort
  const filtered = getAchievements().filter(
    (a) => activeCategory === 'ALL' || a.category === activeCategory,
  );

  const pctUnlocked = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  if (isLoading) return <LoadingView message="Đang tải hành trình..." />;

  return (
    <ThemedScreen showNightEffects avoidKeyboard={false}>
      {/* Unlock Toast — hiển thị phía trên tất cả */}
      <AchievementUnlockToast
        notification={notification}
        onDismiss={dismissNotification}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={COLORS.green.main} />
        }
      >
        {/* ── Header ── */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Image
              source={require('../../../../assets/journey.png')}
              style={styles.headerImage}
              resizeMode="contain"
            />
            <Text style={[styles.headerTitle, { color: colors.text }]}>Hành trình trưởng thành</Text>
            <Text style={[styles.headerSub, { color: colors.textMuted }]}>
              Những dấu mốc nhỏ trên hành trình{'\n'}chăm sóc bản thân
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* ── Progress tổng quan ── */}
        <View style={[styles.progressCard, { backgroundColor: COLORS.green[50], borderColor: COLORS.green[200] }]}>
          <View style={styles.progressTopRow}>
            <Text style={[styles.progressTitle, { color: COLORS.green.dark }]}>
              🏅 Hành trình của bạn
            </Text>
            <Text style={[styles.progressCount, { color: COLORS.green.dark }]}>
              {unlockedCount}/{totalCount}
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${pctUnlocked}%` as any }]} />
          </View>
          <Text style={styles.progressHint}>
            {unlockedCount === totalCount
              ? 'Bạn đã chạm tới tất cả dấu mốc 🎉'
              : `Còn ${totalCount - unlockedCount} dấu mốc đang chờ bạn`}
          </Text>
        </View>

        {/* ── Category Filters ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
          style={styles.filtersScroll}
        >
          {CATEGORIES.map((cat) => {
            const isActive = cat === activeCategory;
            const emoji = cat === 'ALL' ? '✨' : CATEGORY_EMOJIS[cat];
            const label = cat === 'ALL' ? 'Tất cả' : CATEGORY_LABELS[cat];
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? COLORS.green.main : colors.surface,
                    borderColor: isActive ? COLORS.green.main : colors.border,
                  },
                ]}
                onPress={() => setActiveCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={styles.filterEmoji}>{emoji}</Text>
                <Text style={[styles.filterLabel, { color: isActive ? '#fff' : colors.textMuted }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Achievement list ── */}
        <View style={styles.listSection}>
          {filtered.length === 0 ? (
            <EmptyAchievement />
          ) : (
            filtered.map((a) => <AchievementCard key={a.id} achievement={a} />)
          )}
        </View>

        {/* ── Footer ── */}
        <View style={styles.footerQuote}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            "Mỗi ngày nhỏ của bạn đều đáng được ghi nhận." 🌱
          </Text>
        </View>
      </ScrollView>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },

  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  backBtn: { padding: 4, width: 40 },
  backIcon: { fontSize: 22 },
  headerCenter: { flex: 1, alignItems: 'center', gap: 4 },
  headerImage: { width: 120, height: 120, marginBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  headerSub: { fontSize: 13, textAlign: 'center', lineHeight: 20 },

  progressCard: {
    borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16, gap: 8,
  },
  progressTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressTitle: { fontSize: 14, fontWeight: '600' },
  progressCount: { fontSize: 14, fontWeight: '700' },
  progressBarBg: { height: 6, borderRadius: 3, backgroundColor: COLORS.green[100], overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3, backgroundColor: COLORS.green.main, minWidth: 4 },
  progressHint: { fontSize: 12, color: COLORS.text.muted },

  filtersScroll: { marginBottom: 16 },
  filtersRow: { gap: 8, paddingRight: 4 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1,
  },
  filterEmoji: { fontSize: 13 },
  filterLabel: { fontSize: 12, fontWeight: '500' },

  listSection: { gap: 0 },

  footerQuote: { marginTop: 16, alignItems: 'center', paddingVertical: 8 },
  footerText: { fontSize: 13, fontStyle: 'italic', textAlign: 'center' },
});
