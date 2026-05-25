import { AppText as Text } from '../../src/components/common/AppText';
import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { PlantAvatar } from '../../src/components/plant/PlantAvatar';
import { PlantProgress } from '../../src/components/plant/PlantProgress';
import { ResourceGrid } from '../../src/components/plant/ResourceGrid';
import { TaskCard } from '../../src/components/task/TaskCard';
import { Screen } from '../../src/components/common/Screen';
import { LoadingView } from '../../src/components/common/LoadingView';
import { useAuth } from '../../src/hooks/useAuth';
import { useVirtualPlant, usePlantUpdates } from '../../src/hooks/usePlant';
import { useTasks } from '../../src/hooks/useTasks';
import { COLORS } from '../../src/constants/colors';
import { formatRelativeTime } from '../../src/utils/date';

// ── Section header ───────────────────────────────────────────────────────────
const SectionHeader: React.FC<{
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ title, actionLabel, onAction }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {actionLabel && onAction && (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.sectionAction}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ── Home Screen ──────────────────────────────────────────────────────────────
export default function Home() {
  const { user } = useAuth();
  const {
    plant, isLoading: plantLoading,
    hasNoPlant, updatePlantAfterTask,
  } = useVirtualPlant();
  const { data: updates = [] } = usePlantUpdates();
  const { pendingTasks, completeTask, isLoading: tasksLoading } = useTasks();

  const latestUpdate = updates[0];

  const handleCompleteTask = async (taskId: string) => {
    const completedTask = await completeTask(taskId);
    if (completedTask) {
      updatePlantAfterTask(completedTask);
      const resource = completedTask.rewardResource;
      const emojis: Record<string, string> = {
        WATER: '💧', SUNLIGHT: '☀️', FERTILIZER: '🌿',
        AIR: '🌬️', LOVE: '💚', DEW: '✨',
      };
      Alert.alert(
        'Cây vui lắm! 🌱',
        `Cây đã nhận thêm ${emojis[resource] ?? ''} từ bạn hôm nay.`,
        [{ text: 'Tuyệt!', style: 'default' }],
      );
    }
  };

  if (plantLoading) return <LoadingView message="Đang tải vườn của bạn..." />;

  // User chưa có cây ảo — hiển thị màn mời bắt đầu
  if (hasNoPlant) {
    return (
      <Screen scroll={false} padded>
        <View style={styles.noPlantContainer}>
          <Text style={styles.noPlantEmoji}>🌱</Text>
          <Text style={styles.noPlantTitle}>Bận chưa có cây nào</Text>
          <Text style={styles.noPlantDesc}>
            Hãy chọn một loại hoa để bắt đầu hành trình chăm sóc của bạn.
          </Text>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => router.push('/select-flower')}
          >
            <Text style={styles.startBtnText}>🌸 Chọn hoa để bắt đầu</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll padded={false} backgroundColor={COLORS.background}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>
              Xin chào, {user?.fullName?.split(' ').pop() ?? 'bạn'} 👋
            </Text>
            <Text style={styles.motivate}>
              Hôm nay mình làm một việc nhỏ thôi nhé. 🌿
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => router.push('/notifications')}
          >
            <Text style={styles.bell}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* ── Plant card ── */}
        {plant && (
          <View style={styles.plantCard}>
            <PlantAvatar
              status={plant.status}
              nickname={plant.nickname}
              size="lg"
            />

            <View style={styles.streak}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakText}>{plant.streakCount} ngày liên tiếp</Text>
            </View>

            <PlantProgress
              growthPoint={plant.growthPoint}
              maxGrowthPoint={plant.maxGrowthPoint}
              status={plant.status}
            />
          </View>
        )}

        {/* ── Resources ── */}
        {plant && (
          <View style={styles.section}>
            <SectionHeader title="Tài nguyên của cây" />
            <ResourceGrid resources={plant.resources} />
          </View>
        )}

        {/* ── Tasks preview ── */}
        <View style={styles.section}>
          <SectionHeader
            title="Nhiệm vụ hôm nay"
            actionLabel="Xem tất cả →"
            onAction={() => router.push('/(tabs)/tasks')}
          />
          {tasksLoading ? (
            <Text style={styles.loadingText}>Đang tải nhiệm vụ...</Text>
          ) : pendingTasks.length === 0 ? (
            <View style={styles.emptyTasks}>
              <Text style={styles.emptyIcon}>🎉</Text>
              <Text style={styles.emptyText}>
                Bạn đã hoàn thành tất cả nhiệm vụ hôm nay!
              </Text>
            </View>
          ) : (
            <View style={styles.taskList}>
              {pendingTasks.slice(0, 2).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleCompleteTask}
                />
              ))}
              {pendingTasks.length > 2 && (
                <TouchableOpacity
                  style={styles.moreBtn}
                  onPress={() => router.push('/(tabs)/tasks')}
                >
                  <Text style={styles.moreBtnText}>
                    +{pendingTasks.length - 2} nhiệm vụ nữa đang chờ
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* ── Garden update ── */}
        {latestUpdate && (
          <View style={styles.section}>
            <SectionHeader title="Cập nhật từ nhà vườn 📸" />
            <View style={styles.updateCard}>
              <Image
                source={{ uri: latestUpdate.imageUrl }}
                style={styles.updateImage}
                resizeMode="cover"
              />
              <View style={styles.updateInfo}>
                <Text style={styles.updateNote} numberOfLines={2}>
                  {latestUpdate.note ?? 'Cây của bạn đang lớn lên từng ngày...'}
                </Text>
                <Text style={styles.updateTime}>
                  {formatRelativeTime(latestUpdate.createdAt)}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  motivate: {
    fontSize: 13,
    color: COLORS.text.muted,
    marginTop: 4,
  },
  bellBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.green.light,
    justifyContent: 'center', alignItems: 'center',
  },
  bell: { fontSize: 20 },

  noPlantContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
  },
  noPlantEmoji: { fontSize: 72, marginBottom: 8 },
  noPlantTitle: {
    fontSize: 22, fontWeight: '700', color: COLORS.text.primary, textAlign: 'center',
  },
  noPlantDesc: {
    fontSize: 15, color: COLORS.text.muted, textAlign: 'center', lineHeight: 24,
  },
  startBtn: {
    marginTop: 8,
    backgroundColor: COLORS.green.main,
    borderRadius: 16, paddingHorizontal: 28, paddingVertical: 14,
  },
  startBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  plantCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakEmoji: { fontSize: 16 },
  streakText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E65100',
  },

  section: { gap: 12 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  sectionAction: {
    fontSize: 13,
    color: COLORS.green.main,
    fontWeight: '600',
  },

  loadingText: { color: COLORS.text.muted, fontSize: 14 },
  emptyTasks: {
    alignItems: 'center', padding: 24, gap: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
  },
  emptyIcon: { fontSize: 40 },
  emptyText: {
    fontSize: 14, color: COLORS.text.muted, textAlign: 'center',
  },
  taskList: { gap: 12 },
  moreBtn: {
    backgroundColor: COLORS.green.light,
    borderRadius: 12, height: 44,
    justifyContent: 'center', alignItems: 'center',
  },
  moreBtnText: {
    color: COLORS.green.dark,
    fontWeight: '600',
    fontSize: 14,
  },

  updateCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  updateImage: { width: '100%', height: 160 },
  updateInfo: { padding: 14, gap: 4 },
  updateNote: {
    fontSize: 14, color: COLORS.text.secondary, lineHeight: 22,
  },
  updateTime: {
    fontSize: 12, color: COLORS.text.muted,
  },
});
