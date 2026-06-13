import { AppText as Text } from '../../src/components/common/AppText';
import React, { useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedScreen } from '../../src/components/theme/ThemedScreen';
import { TimelineItem } from '../../src/components/timeline/TimelineItem';
import { EmptyState } from '../../src/components/common/EmptyState';
import { LoadingView } from '../../src/components/common/LoadingView';
import { Companion } from '../../src/components/common/Companion';
import { usePlantUpdates, useVirtualPlant } from '../../src/hooks/usePlant';
import { useTimeTheme } from '../../src/contexts/TimeThemeContext';
import { PlantFeedbackSection } from '../../src/components/plant/PlantFeedbackSection';

import { useMyEntitlements } from '../../src/hooks/usePlans';
import { useRouter } from 'expo-router';

export default function Timeline() {
  const { data: updates = [], isLoading, refetch, isRefetching } = usePlantUpdates();
  const { data: entitlements, isLoading: isLoadingEntitlements } = useMyEntitlements();
  const { plant } = useVirtualPlant();
  const { colors } = useTimeTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const realPlantId = plant?.realPlant?.id;
  const onRefresh = useCallback(() => { refetch(); }, [refetch]);

  if (isLoading || isLoadingEntitlements) return <LoadingView message="Đang tải cập nhật từ nhà vườn..." />;

  if (entitlements && !entitlements.hasRealPlant) {
    return (
      <ThemedScreen showNightEffects>
        <View style={[styles.list, { paddingBottom: insets.bottom + 40, flex: 1, justifyContent: 'center' }]}>
          <View style={[styles.upgradeCard, { backgroundColor: colors.surface, borderColor: colors.border, alignItems: 'center' }]}>
            <Companion context="upgrade_companion" style={{ marginBottom: 16 }} />
            <TouchableOpacity 
              style={[styles.upgradeBtn, { backgroundColor: colors.primary, width: '100%' }]}
              onPress={() => router.push('/packages')}
            >
              <Text style={styles.upgradeBtnText}>Xem gói Hướng Dương Đồng Hành</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedScreen>
    );
  }

  return (
    <ThemedScreen showNightEffects>
      <FlatList
        data={updates}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Cây thật của bạn 📸</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Những cập nhật từ nhà vườn trong hành trình cây lớn lên.
            </Text>
            {updates.length > 0 && (
              <View style={[styles.countBadge, { backgroundColor: colors.primarySoft }]}>
                <Text style={[styles.countText, { color: colors.primary }]}>
                  {updates.length} lần cập nhật
                </Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="🌱"
            title="Cây vẫn đang chờ bạn"
            description="Nhà vườn sẽ gửi hình ảnh cập nhật sau mỗi 2–3 ngày. Hãy quay lại nhé!"
          />
        }

        renderItem={({ item, index }) => (
          <TimelineItem
            update={item}
            isFirst={index === 0}
            isLast={index === updates.length - 1}
            realPlantId={realPlantId}
          />
        )}
      />
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  header: { marginBottom: 24, gap: 8 },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 14, lineHeight: 22 },
  countBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
  },
  countText: { fontSize: 12, fontWeight: '600' },
  upgradeCard: {
    borderRadius: 20, padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12,
    elevation: 4,
    alignItems: 'center',
  },
  upgradeTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  upgradeDesc: { fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 24 },
  upgradeBtn: {
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: 24,
    width: '100%', alignItems: 'center'
  },
  upgradeBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
