import { AppText as Text } from '../src/components/common/AppText';
import React, { useCallback } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Screen } from '../src/components/common/Screen';
import { EmptyState } from '../src/components/common/EmptyState';
import { LoadingView } from '../src/components/common/LoadingView';
import { AppButton } from '../src/components/common/AppButton';
import { useNotifications } from '../src/hooks/useNotifications';
import { Notification } from '../src/types/notification.type';
import { COLORS } from '../src/constants/colors';
import { formatRelativeTime } from '../src/utils/date';

// ── Type config ───────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  Notification['type'],
  { emoji: string; label: string; route?: string }
> = {
  plant_update:    { emoji: '🌿', label: 'Cây thật',    route: '/(tabs)/timeline' },
  task_reminder:   { emoji: '⏰', label: 'Nhắc nhiệm vụ' },
  system:          { emoji: '📢', label: 'Hệ thống' },
};

// ── Notification row ──────────────────────────────────────────────────────────
const NotifRow: React.FC<{
  item: Notification;
  onPress: (item: Notification) => void;
}> = ({ item, onPress }) => {
  const config = TYPE_CONFIG[item.type];
  return (
    <TouchableOpacity
      style={[styles.row, !item.isRead && styles.rowUnread]}
      onPress={() => onPress(item)}
      activeOpacity={0.75}
    >
      <View style={[styles.iconWrap, !item.isRead && styles.iconWrapUnread]}>
        <Text style={styles.icon}>{config.emoji}</Text>
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.rowBody} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.rowTime}>{formatRelativeTime(item.createdAt)}</Text>
      </View>
      {!item.isRead && <View style={styles.dot} />}
    </TouchableOpacity>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────
export default function Notifications() {
  const {
    notifications, isLoading, refetch,
    isRefetching, markAsRead, markAllAsRead, unreadCount,
  } = useNotifications();
  const insets = useSafeAreaInsets();

  const handlePress = useCallback(
    async (item: Notification) => {
      if (!item.isRead) await markAsRead(item.id);
      const route = TYPE_CONFIG[item.type]?.route;
      if (route) router.push(route as any);
    },
    [markAsRead],
  );

  if (isLoading) return <LoadingView message="Đang tải thông báo..." />;

  return (
    <Screen padded={false}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={COLORS.green.main}
          />
        }
        ListHeaderComponent={
          unreadCount > 0 ? (
            <View style={styles.markAllRow}>
              <Text style={styles.unreadCount}>{unreadCount} chưa đọc</Text>
              <TouchableOpacity onPress={() => markAllAsRead()}>
                <Text style={styles.markAll}>Đánh dấu tất cả đã đọc</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon="🔔"
            title="Chưa có thông báo nào"
            description="Thông báo từ nhà vườn và nhắc nhở sẽ xuất hiện ở đây."
          />
        }
        renderItem={({ item }) => (
          <NotifRow item={item} onPress={handlePress} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 40 },
  markAllRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  unreadCount: { fontSize: 13, color: COLORS.text.muted },
  markAll: { fontSize: 13, color: COLORS.green.main, fontWeight: '600' },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  rowUnread: {
    backgroundColor: COLORS.green[50],
    borderWidth: 1,
    borderColor: COLORS.green.light,
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center',
  },
  iconWrapUnread: { backgroundColor: COLORS.green.light },
  icon: { fontSize: 22 },
  rowContent: { flex: 1, gap: 4 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text.primary },
  rowBody: { fontSize: 13, color: COLORS.text.secondary, lineHeight: 20 },
  rowTime: { fontSize: 11, color: COLORS.text.muted },
  dot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: COLORS.green.main, marginTop: 4,
  },
  separator: { height: 10 },
});
