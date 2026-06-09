import { AppText as Text } from '../../src/components/common/AppText';
import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TaskCard } from '../../src/components/task/TaskCard';
import { EmptyState } from '../../src/components/common/EmptyState';
import { LoadingView } from '../../src/components/common/LoadingView';
import { ThemedScreen } from '../../src/components/theme/ThemedScreen';
import { useTasks } from '../../src/hooks/useTasks';
import { useVirtualPlant } from '../../src/hooks/usePlant';
import { useTimeTheme } from '../../src/contexts/TimeThemeContext';
import { TaskCompleteResult, ShareBonusInfo } from '../../src/components/task/TaskCompleteModal';

export default function Tasks() {
  const { tasks, isLoading, completeTask } = useTasks();
  const { plant, updatePlantAfterTask } = useVirtualPlant();
  const { colors } = useTimeTheme();
  const insets = useSafeAreaInsets();

  const handleComplete = async (result: TaskCompleteResult): Promise<ShareBonusInfo | void> => {
    const { task, note, photo, shareToCommunity, visibility } = result;
    const outcome = await completeTask({
      task, note, photo, shareToCommunity, visibility,
      virtualPlantId: plant?.id,
    });
    updatePlantAfterTask(task);
    return outcome?.shareBonus;
  };

  if (isLoading) return <LoadingView message="Đang tải nhiệm vụ..." />;

  const pending = tasks.filter((t) => !t.completedToday);
  const done    = tasks.filter((t) =>  t.completedToday);

  return (
    <ThemedScreen>
      <FlatList
        data={[...pending, ...done]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Nhiệm vụ hôm nay</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Hoàn thành một việc nhỏ để chăm cây và chăm chính mình. 🌿
            </Text>

            {/* Progress bar */}
            <View style={styles.progressRow}>
              <View style={[styles.progressBarBg, { backgroundColor: colors.primarySoft }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      backgroundColor: colors.primary,
                      width: tasks.length > 0
                        ? `${(done.length / tasks.length) * 100}%` as any
                        : '0%',
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
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
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  list: { padding: 20, gap: 0 },
  header: { marginBottom: 20, gap: 8 },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 14, lineHeight: 22 },
  progressRow: { marginTop: 4, gap: 6 },
  progressBarBg: {
    height: 8, borderRadius: 4, overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%', borderRadius: 4, minWidth: 8,
  },
  progressLabel: { fontSize: 12, textAlign: 'right' },
});
