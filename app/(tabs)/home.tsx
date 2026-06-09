import { AppText as Text } from '../../src/components/common/AppText';
import React, { useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, Alert, Modal, TextInput } from 'react-native';
import { router } from 'expo-router';
import { PlantAvatar } from '../../src/components/plant/PlantAvatar';
import { PlantProgress } from '../../src/components/plant/PlantProgress';
import { ResourceGrid } from '../../src/components/plant/ResourceGrid';
import { CareEffect, CareEffectHandle } from '../../src/components/plant/CareEffect';
import { PlantActionSheet, ACTION_COST } from '../../src/components/plant/PlantActionSheet';
import { TaskCard } from '../../src/components/task/TaskCard';
import { Screen } from '../../src/components/common/Screen';
import { LoadingView } from '../../src/components/common/LoadingView';
import { Companion } from '../../src/components/common/Companion';
import { ThemedScreen } from '../../src/components/theme/ThemedScreen';
import { useAuth } from '../../src/hooks/useAuth';
import { useVirtualPlant, usePlantUpdates } from '../../src/hooks/usePlant';
import { useTasks } from '../../src/hooks/useTasks';
import { useTimeTheme } from '../../src/contexts/TimeThemeContext';
import { COLORS } from '../../src/constants/colors';
import { PlantResourceType } from '../../src/types/plant.type';
import { formatRelativeTime } from '../../src/utils/date';
import { useNotifications } from '../../src/hooks/useNotifications';
import { TaskCompleteResult, ShareBonusInfo } from '../../src/components/task/TaskCompleteModal';

// ── Section header ───────────────────────────────────────────────────────────
const SectionHeader: React.FC<{
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  textColor?: string;
}> = ({ title, actionLabel, onAction, textColor }) => (
  <View style={styles.sectionHeader}>
    <Text style={[styles.sectionTitle, textColor ? { color: textColor } : undefined]}>{title}</Text>
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
    plant, stage, stageProgress,
    isLoading: plantLoading,
    hasNoPlant, updatePlantAfterTask, spendResource, renamePlant,
  } = useVirtualPlant();
  const { data: updates = [] } = usePlantUpdates();
  const { pendingTasks, completedTasks, completeTask, isLoading: tasksLoading } = useTasks();
  const { unreadCount } = useNotifications();
  const { colors, isNight } = useTimeTheme();

  const careEffectRef = useRef<CareEffectHandle>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  
  const [renameVisible, setRenameVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [plantMessage, setPlantMessage] = useState<string | null>(null);

  const latestUpdate = updates[0];

  // ── Hoàn thành task: chỉ lưu tài nguyên, không trigger hiệu ứng ────────────
  const handleCompleteTask = async (result: TaskCompleteResult): Promise<ShareBonusInfo | void> => {
    const { task, note, photo, shareToCommunity, visibility } = result;
    const outcome = await completeTask({
      task,
      note,
      photo,
      shareToCommunity,
      visibility,
      virtualPlantId: plant?.id,
    });
    updatePlantAfterTask(task);
    return outcome?.shareBonus;
  };

  // ── Người dùng chọn hành động chăm cây ──────────────────────────────────────
  const handlePlantAction = (resourceType: PlantResourceType) => {
    const spent = spendResource(
      resourceType, 
      ACTION_COST,
      (aiMsg) => {
        if (aiMsg) {
          setPlantMessage(aiMsg);
          setTimeout(() => setPlantMessage(null), 5000);
        }
      },
      (errMsg) => {
        setPlantMessage(errMsg);
        setTimeout(() => setPlantMessage(null), 4000);
      }
    );
    if (!spent) return; // PlantActionSheet đã xử lý thông báo lỗi bên trong

    // Kích hoạt hiệu ứng trên cây
    careEffectRef.current?.trigger(resourceType);
  };

  if (plantLoading) return <LoadingView message="Đang tải vườn của bạn..." />;

  // User chưa có cây ảo
  if (hasNoPlant) {
    return (
      <Screen scroll={false} padded>
        <View style={styles.noPlantContainer}>
          <Companion context="no_plant" style={{ marginBottom: 16 }} />
          <Text style={styles.noPlantTitle}>Bạn chưa có cây nào</Text>
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
    <ThemedScreen showNightEffects>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>
              Xin chào, {user?.fullName?.split(' ').pop() ?? 'bạn'} 👋
            </Text>
            <Text style={[styles.greetingSubtitle, { color: colors.textMuted }]}>
              {isNight ? 'Một buổi tối bình yên nhé 🌙' : 'Hôm nay mình chăm cây một chút nhé 🌿'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => router.push('/notifications')}
          >
            <Text style={styles.bell}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Companion ── */}
        <Companion
          context={
            tasksLoading ? 'loading'
            : pendingTasks.length === 0 ? 'all_done'
            : latestUpdate ? 'garden_update'
            : 'has_tasks'
          }
          style={styles.companionSection}
        />

        {/* ── Plant card (tap để mở ActionSheet) ── */}
        {plant && stage && stageProgress && (
          <>
            <TouchableOpacity
              style={[styles.plantCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setShowActionSheet(true)}
              activeOpacity={0.92}
            >
              {/* Hiệu ứng particle nằm trên avatar */}
              <View style={styles.avatarWrapper}>
                {plantMessage && (
                  <View style={[styles.speechBubble, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.speechText, { color: colors.text }]}>{plantMessage}</Text>
                    <View style={[styles.speechTail, { borderTopColor: colors.surface }]} />
                  </View>
                )}
                <PlantAvatar
                  status={stage}
                  nickname={plant.nickname}
                  size="lg"
                  flowerType={plant.flowerType}
                  onRename={() => {
                    setNewName(plant.nickname || '');
                    setRenameVisible(true);
                  }}
                />
                <CareEffect ref={careEffectRef} />
              </View>

              <View style={[styles.careBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.careBtnText}>Chăm cây hôm nay</Text>
              </View>

              {/* Streak */}
              <View style={[styles.streak, { backgroundColor: colors.primarySoft }]}>
                {plant.streakCount === 0 ? (
                  <>
                    <Text style={styles.streakEmoji}>✨</Text>
                    <Text style={[styles.streakText, { color: colors.primary }]}>Hành trình vừa bắt đầu</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.streakEmoji}>🌱</Text>
                    <Text style={[styles.streakText, { color: colors.primary }]}>Bạn đã quay lại {plant.streakCount} ngày</Text>
                  </>
                )}
              </View>

              <PlantProgress
                stage={stage}
                stageProgress={stageProgress}
                growthPoint={plant.growthPoint}
              />
            </TouchableOpacity>

            {/* Bottom sheet chăm cây */}
            <PlantActionSheet
              visible={showActionSheet}
              resources={plant.resources}
              onClose={() => setShowActionSheet(false)}
              onAction={handlePlantAction}
            />

            {/* Modal đổi tên cây */}
            <Modal visible={renameVisible} transparent animationType="fade">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Đặt tên cho cây</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="Ví dụ: Mầm Nhỏ, Bé Nắng..."
                    autoFocus
                    maxLength={50}
                  />
                  <View style={styles.modalActions}>
                    <TouchableOpacity onPress={() => setRenameVisible(false)} style={styles.modalBtn}>
                      <Text style={styles.modalCancel}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.modalBtn}
                      onPress={() => { 
                        if (newName.trim()) {
                          renamePlant(newName.trim()); 
                        }
                        setRenameVisible(false); 
                      }}
                    >
                      <Text style={styles.modalSave}>Lưu</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </>
        )}



        {/* ── Resources ── */}
        {plant && (
          <View style={styles.section}>
            <SectionHeader title="Tài nguyên tích lũy" textColor={colors.text} />
            <ResourceGrid resources={plant.resources} />
          </View>
        )}

        {/* ── Góc yên card ── */}
        <TouchableOpacity
          style={[styles.calmCard, { backgroundColor: colors.surfaceSoft }]}
          onPress={() => router.push('/calm-space')}
          activeOpacity={0.85}
        >
          <View style={styles.calmLeft}>
            <Text style={[styles.calmTitle, { color: colors.text }]}>Góc yên 🌿</Text>
            <Text style={[styles.calmDesc, { color: colors.textMuted }]}>
              Thở, thư giãn hoặc học cùng Mầm An.{'\n'}Cây sẽ lớn lên theo từng phút bạn dành cho bản thân.
            </Text>
          </View>
          <View style={[styles.calmBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.calmBtnText}>Bắt đầu</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <SectionHeader
            title="Nhiệm vụ hôm nay"
            actionLabel="Xem tất cả →"
            onAction={() => router.push('/(tabs)/tasks')}
            textColor={colors.text}
          />
          {tasksLoading ? (
            <Text style={styles.loadingText}>Đang tải nhiệm vụ...</Text>
          ) : (
            <View style={{ gap: 16 }}>
              {/* Danh sách task chờ */}
              {pendingTasks.length > 0 && (
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
                      style={[styles.moreBtn, { backgroundColor: colors.surfaceSoft }]}
                      onPress={() => router.push('/(tabs)/tasks')}
                    >
                      <Text style={[styles.moreBtnText, { color: colors.primary }]}>
                        +{pendingTasks.length - 2} nhiệm vụ nữa đang chờ
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Hành trình hôm nay */}
              {completedTasks.length > 0 && (
                <View style={[styles.journeyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.journeyTitle, { color: colors.text }]}>Hôm nay bạn đã chăm mình bằng:</Text>
                  <View style={styles.journeyList}>
                    {completedTasks.map((task) => (
                      <View key={task.id} style={styles.journeyRow}>
                        <Text style={[styles.journeyCheck, { color: colors.primary }]}>✓</Text>
                        <Text style={[styles.journeyItem, { color: colors.textMuted }]}>{task.title}</Text>
                      </View>
                    ))}
                  </View>
                  {pendingTasks.length === 0 && (
                    <View style={[styles.journeySummaryBox, { borderTopColor: colors.border }]}>
                      <Text style={[styles.journeySummaryText, { color: colors.text }]}>
                        Hôm nay bạn đã làm {completedTasks.length} việc nhỏ cho bản thân. Vậy là tốt rồi 💚
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Empty state dự phòng (nếu list task rỗng 100%) */}
              {pendingTasks.length === 0 && completedTasks.length === 0 && (
                <View style={[styles.emptyTasks, { backgroundColor: colors.surface }]}>
                  <Text style={styles.emptyIcon}>🎉</Text>
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    Bạn chưa có nhiệm vụ nào cho hôm nay!
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* ── Garden update ── */}
        {latestUpdate && (
          <View style={styles.section}>
            <SectionHeader title="Cập nhật từ nhà vườn 📸" textColor={colors.text} />
            <View style={[styles.updateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {latestUpdate.imageUrl ? (
                <Image
                  source={{ uri: latestUpdate.imageUrl }}
                  style={styles.updateImage}
                  resizeMode="cover"
                />
              ) : null}
              <View style={styles.updateInfo}>
                <Text style={[styles.updateNote, { color: colors.text }]} numberOfLines={2}>
                  {latestUpdate.note ?? 'Cây của bạn đang lớn lên từng ngày...'}
                </Text>
                <Text style={[styles.updateTime, { color: colors.textMuted }]}>
                  {formatRelativeTime(latestUpdate.createdAt)}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </ThemedScreen>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 20,
  },
  companionSection: { alignSelf: 'center' },
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
  greetingSubtitle: {
    fontSize: 13,
    color: '#6F8F78',
    marginTop: 2,
  },
  bellBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F7EF',
    justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  bell: { fontSize: 17 },
  bellBadge: {
    position: 'absolute',
    top: 6,
    right: 4,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#F2F7EF',
  },
  bellBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },

  noPlantContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
  },
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

  // ── Plant card ─────────────────────────────────────────────────────────────
  plantCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8F3E8',
  },
  avatarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 40, // khoảng trống cho bong bóng chat
  },
  speechBubble: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    zIndex: 10,
    shadowColor: '#143D25',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    maxWidth: 220,
    borderWidth: 1.5,
    borderColor: '#E8F3E8',
  },
  speechText: {
    fontSize: 14,
    color: '#143D25',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  speechTail: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
  },
  careBtn: {
    backgroundColor: '#143D25',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 4,
  },
  careBtnText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FAF0',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakEmoji: { fontSize: 14 },
  streakText: { fontSize: 13, fontWeight: '600', color: COLORS.green.dark },

  section: { gap: 12 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text.primary },
  sectionAction: { fontSize: 13, color: COLORS.green.main, fontWeight: '600' },

  loadingText: { color: COLORS.text.muted, fontSize: 14 },
  emptyTasks: {
    alignItems: 'center', padding: 24, gap: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
  },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 14, color: COLORS.text.muted, textAlign: 'center' },
  taskList: { gap: 12 },
  moreBtn: {
    backgroundColor: COLORS.green.light,
    borderRadius: 12, height: 44,
    justifyContent: 'center', alignItems: 'center',
  },
  moreBtnText: { color: COLORS.green.dark, fontWeight: '600', fontSize: 14 },

  journeyCard: {
    backgroundColor: '#F8FAF8',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8F3E8',
  },
  journeyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#143D25',
    marginBottom: 10,
  },
  journeyList: { gap: 6 },
  journeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  journeyCheck: {
    color: '#4ADE80',
    fontSize: 14,
    fontWeight: 'bold',
  },
  journeyItem: {
    fontSize: 13,
    color: '#6F8F78',
  },
  journeySummaryBox: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E8F3E8',
  },
  journeySummaryText: {
    fontSize: 13,
    color: '#143D25',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
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
  updateNote: { fontSize: 14, color: COLORS.text.secondary, lineHeight: 22 },
  updateTime: { fontSize: 12, color: COLORS.text.muted },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    gap: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#143D25',
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#E8F3E8',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    backgroundColor: '#F8FAF8',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 4,
  },
  modalBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalCancel: {
    fontSize: 15,
    color: '#6F8F78',
    fontWeight: '600',
  },
  modalSave: {
    fontSize: 15,
    color: '#4ADE80',
    fontWeight: '700',
  },
  // ── Góc yên card ──
  calmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.green[50],
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.green.light,
    padding: 18,
    gap: 16,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  calmLeft: { flex: 1, gap: 6 },
  calmTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text.primary },
  calmDesc: { fontSize: 13, color: COLORS.text.secondary, lineHeight: 20 },
  calmBtn: {
    backgroundColor: COLORS.green.main,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  calmBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
