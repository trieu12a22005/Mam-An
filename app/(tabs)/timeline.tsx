import { AppText as Text } from '../../src/components/common/AppText';
import React, { useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../../src/components/common/Screen';
import { TimelineItem } from '../../src/components/timeline/TimelineItem';
import { EmptyState } from '../../src/components/common/EmptyState';
import { LoadingView } from '../../src/components/common/LoadingView';
import { usePlantUpdates } from '../../src/hooks/usePlant';
import { COLORS } from '../../src/constants/colors';

export default function Timeline() {
  const { data: updates = [], isLoading, refetch, isRefetching } = usePlantUpdates();
  const insets = useSafeAreaInsets();

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) return <LoadingView message="Đang tải cập nhật từ nhà vườn..." />;

  return (
    <Screen padded={false}>
      <FlatList
        data={updates}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={COLORS.green.main}
            colors={[COLORS.green.main]}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Cây thật của bạn 📸</Text>
            <Text style={styles.subtitle}>
              Những cập nhật từ nhà vườn trong hành trình cây lớn lên.
            </Text>
            {updates.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.muted,
    lineHeight: 22,
  },
  countBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.green.light,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  countText: {
    fontSize: 12,
    color: COLORS.green.dark,
    fontWeight: '600',
  },
});
