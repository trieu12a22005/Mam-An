import { AppText as Text } from '../../src/components/common/AppText';
import React from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../../src/components/common/Screen';
import { TaskCard } from '../../src/components/task/TaskCard';
import { EmptyState } from '../../src/components/common/EmptyState';
import { LoadingView } from '../../src/components/common/LoadingView';
import { useTasks } from '../../src/hooks/useTasks';
import { useVirtualPlant } from '../../src/hooks/usePlant';
import { COLORS } from '../../src/constants/colors';
import { RESOURCES } from '../../src/constants/resources';

const RESOURCE_EMOJI: Record<string, string> = {
  WATER: '💧', SUNLIGHT: '☀️', FERTILIZER: '🌿',
  AIR: '🌬️', LOVE: '💚', DEW: '✨',
};

export default function Tasks() {
  const { tasks, isLoading, completeTask } = useTasks();
  const { updatePlantAfterTask } = useVirtualPlant();
  const insets = useSafeAreaInsets();

  const handleComplete = async (taskId: string) => {
    const completedTask = await completeTask(taskId);
    if (!completedTask) return;

    updatePlantAfterTask(completedTask);

    const emoji = RESOURCE_EMOJI[completedTask.rewardResource] ?? '';
    const resourceLabel = RESOURCES[completedTask.rewardResource]?.label ?? '';
    Alert.alert(
      'Cây vui lắm!',
      `Cây đã nhận thêm ${emoji} ${resourceLabel} từ bạn hôm nay.\n+${completedTask.growthReward} điểm phát triển`,
      [{ text: 'Tuyệt vời!', style: 'default' }],
    );
  };

  if (isLoading) return <LoadingView message="Đang tải nhiệm vụ..." />;

  const pending = tasks.filter((t) => !t.completedToday);
  const done = tasks.filter((t) => t.completedToday);

  return (
    <Screen padded={false}>
      <FlatList
        data={[...pending, ...done]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        // Sort: pending first, done last
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Nhiệm vụ hôm nay</Text>
            <Text style={styles.subtitle}>
              Hoàn thành một việc nhỏ để chăm cây và chăm chính mình. 🌿
            </Text>

            {/* Progress summary */}
            <View style={styles.progressRow}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: tasks.length > 0
                        ? `${(done.length / tasks.length) * 100}%` as any
                        : '0%',
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>
                {done.length}/{tasks.length} hoàn thành
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="✅"
            title="Chưa có nhiệm vụ nào"
            description="Nhiệm vụ chăm sóc bản thân sẽ xuất hiện ở đây"
          />
        }
        renderItem={({ item }) => (
          <TaskCard task={item} onComplete={handleComplete} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        extraData={tasks}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 20,
    gap: 0,
  },
  header: {
    marginBottom: 20,
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
  progressRow: {
    marginTop: 4,
    gap: 6,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.green.light,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.green.main,
    minWidth: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.text.muted,
    textAlign: 'right',
  },
});
