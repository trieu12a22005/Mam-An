import { AppText as Text } from '../../src/components/common/AppText';
import React, { useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedScreen } from '../../src/components/theme/ThemedScreen';
import { TimelineItem } from '../../src/components/timeline/TimelineItem';
import { EmptyState } from '../../src/components/common/EmptyState';
import { LoadingView } from '../../src/components/common/LoadingView';
import { usePlantUpdates } from '../../src/hooks/usePlant';
import { useTimeTheme } from '../../src/contexts/TimeThemeContext';

export default function Timeline() {
  const { data: updates = [], isLoading, refetch, isRefetching } = usePlantUpdates();
  const { colors } = useTimeTheme();
  const insets = useSafeAreaInsets();

  const onRefresh = useCallback(() => { refetch(); }, [refetch]);

  if (isLoading) return <LoadingView message="Đang tải cập nhật từ nhà vườn..." />;

  return (
    <ThemedScreen>
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
});
