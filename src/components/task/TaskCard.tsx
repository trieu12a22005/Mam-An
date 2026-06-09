import { AppText as Text } from '../common/AppText';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { CareTask } from '../../types/task.type';
import { RESOURCES } from '../../constants/resources';
import { COLORS } from '../../constants/colors';
import { useTimeTheme } from '../../contexts/TimeThemeContext';
import { RewardModal } from './RewardModal';
import { TaskCompleteModal, TaskCompleteResult, ShareBonusInfo } from './TaskCompleteModal';

// ── Resource emoji map ───────────────────────────────────────────────────────
const RESOURCE_EMOJI: Record<string, string> = {
  WATER: '💧', SUNLIGHT: '☀️', FERTILIZER: '🌿',
  AIR: '🌬️', LOVE: '💚', DEW: '✨',
};

// ── Timer sub-component ──────────────────────────────────────────────────────
const CountdownTimer: React.FC<{
  seconds: number;
  onFinish: () => void;
}> = ({ seconds, onFinish }) => {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishedRef = useRef(false);
  const { colors } = useTimeTheme();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Gọi onFinish sau khi render — KHÔNG được gọi bên trong setState callback
  useEffect(() => {
    if (remaining === 0 && !finishedRef.current) {
      finishedRef.current = true;
      onFinish();
    }
  }, [remaining, onFinish]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = 1 - remaining / seconds;

  return (
    <View style={timerStyles.wrapper}>
      <View style={[timerStyles.barBg, { backgroundColor: colors.primarySoft }]}>
        <View style={[timerStyles.barFill, { width: `${progress * 100}%` as any, backgroundColor: colors.primary }]} />
      </View>
      <Text style={[timerStyles.label, { color: colors.textMuted }]}>
        ⏱ {mins > 0 ? `${mins}m ` : ''}{secs.toString().padStart(2, '0')}s
      </Text>
    </View>
  );
};


const timerStyles = StyleSheet.create({
  wrapper: { gap: 4 },
  barBg: {
    height: 6, borderRadius: 3, overflow: 'hidden',
  },
  barFill: {
    height: '100%', borderRadius: 3,
  },
  label: { fontSize: 13, textAlign: 'center' },
});

// ── Main TaskCard ────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: CareTask;
  onComplete: (result: TaskCompleteResult) => Promise<ShareBonusInfo | void>;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete }) => {
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  // Giữ task trong ref để modal không bị null khi onClose gọi giữa chừng
  const taskRef = useRef<CareTask>(task);
  useEffect(() => { taskRef.current = task; }, [task]);
  const resource = RESOURCES[task.rewardResource];
  const emoji = RESOURCE_EMOJI[task.rewardResource];
  const { colors } = useTimeTheme();

  const handleTimerFinish = useCallback(() => {
    setTimerFinished(true);
  }, []);

  // Khi bấm vào task: với SELF_CONFIRM/TIMER mở RewardModal trước,
  // với PHOTO task mở TaskCompleteModal
  const handleTapComplete = () => {
    if (task.completedToday) return;
    console.log('[TaskCard] verifyType:', task.verifyType, '| task:', task.title);
    if (task.verifyType === 'PHOTO_REQUIRED' || task.verifyType === 'PHOTO_OPTIONAL') {
      console.log('[TaskCard] → opening TaskCompleteModal');
      setShowCompleteModal(true);
    } else {
      console.log('[TaskCard] → opening RewardModal');
      setShowReward(true);
    }
  };

  // Khi RewardModal đóng → gọi onComplete
  const handleCloseReward = () => {
    setShowReward(false);
    onComplete({ task });
  };

  // Khi TaskCompleteModal xác nhận — forward ShareBonusInfo về modal
  const handleCompleteModalConfirm = async (result: TaskCompleteResult): Promise<ShareBonusInfo | void> => {
    return onComplete(result);
  };

  // ── Completed state ──
  if (task.completedToday) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surfaceSoft, borderWidth: 1, borderColor: colors.primarySoft }]}>
        <View style={styles.doneRow}>
          <Image
            source={task.characterImageUrl ? { uri: task.characterImageUrl } : require('../../../assets/happy.png')}
            style={[styles.taskAvatar, { opacity: 0.6, backgroundColor: colors.surfaceSoft }]}
          />
          <View style={styles.flex}>
            <Text style={[styles.titleDone, { color: colors.textMuted }]}>{task.title}</Text>
            <Text style={[styles.doneLabel, { color: colors.primary }]}>Đã hoàn thành hôm nay</Text>
          </View>
          <View style={[styles.reward, { backgroundColor: resource.color + '22' }]}>
            {task.rewardResource === 'FERTILIZER' ? (
              <Image source={require('../../../assets/phan_bon.png')} style={{ width: 18, height: 18, borderRadius: 9 }} />
            ) : task.rewardResource === 'DEW' ? (
              <Image source={require('../../../assets/suong_mai.png')} style={{ width: 18, height: 18, borderRadius: 9 }} />
            ) : task.rewardResource === 'SUNLIGHT' ? (
              <Image source={require('../../../assets/mat_troi.png')} style={{ width: 18, height: 18, borderRadius: 9 }} />
            ) : task.rewardResource === 'LOVE' ? (
              <Image source={require('../../../assets/yeu_thuong.png')} style={{ width: 18, height: 18, borderRadius: 9 }} />
            ) : (
              <Text style={styles.rewardEmoji}>{emoji}</Text>
            )}
            <Text style={[styles.rewardAmt, { color: resource.color }]}>
              +{task.rewardAmount}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // ── Active card ──
  return (
    <>
      <RewardModal
        visible={showReward}
        resourceType={task.rewardResource}
        resourceAmount={task.rewardAmount}
        taskTitle={task.title}
        onClose={handleCloseReward}
      />
      <TaskCompleteModal
        task={showCompleteModal ? taskRef.current : null}
        visible={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onConfirm={handleCompleteModalConfirm}
      />
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={task.characterImageUrl ? { uri: task.characterImageUrl } : require('../../../assets/character.jpg')}
            style={[styles.taskAvatar, { backgroundColor: colors.surfaceSoft }]}
          />
          <View style={styles.flex}>
            <Text style={[styles.title, { color: colors.text }]}>{task.title}</Text>
            {task.description && (
              <Text style={[styles.description, { color: colors.textMuted }]}>{task.description}</Text>
            )}
          </View>
          {/* Reward pill */}
          <View style={[styles.rewardPill, { backgroundColor: resource.color + '22' }]}>
            {task.rewardResource === 'FERTILIZER' ? (
              <Image source={require('../../../assets/phan_bon.png')} style={{ width: 14, height: 14, borderRadius: 7 }} />
            ) : task.rewardResource === 'DEW' ? (
              <Image source={require('../../../assets/suong_mai.png')} style={{ width: 14, height: 14, borderRadius: 7 }} />
            ) : task.rewardResource === 'SUNLIGHT' ? (
              <Image source={require('../../../assets/mat_troi.png')} style={{ width: 14, height: 14, borderRadius: 7 }} />
            ) : task.rewardResource === 'LOVE' ? (
              <Image source={require('../../../assets/yeu_thuong.png')} style={{ width: 14, height: 14, borderRadius: 7 }} />
            ) : (
              <Text>{emoji}</Text>
            )}
            <Text style={[styles.rewardPillText, { color: resource.color }]}>
              +{task.rewardAmount} {resource.label}
            </Text>
          </View>
        </View>

        {/* Growth reward */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Image source={require('../../../assets/image1.png')} style={{ width: 16, height: 16, borderRadius: 8 }} />
          <Text style={[styles.growthHint, { color: colors.textMuted }]}>+{task.growthReward} điểm phát triển</Text>
        </View>

        {/* Actions by verifyType */}
        <View style={styles.actionArea}>
          {task.verifyType === 'SELF_CONFIRM' && (
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleTapComplete}>
              <Text style={styles.btnText}>Tôi đã hoàn thành ✓</Text>
            </TouchableOpacity>
          )}

          {task.verifyType === 'TIMER' && (
            <>
              {!timerRunning && !timerFinished && (
                <TouchableOpacity
                  style={[styles.btn, styles.btnSecondary, { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}
                  onPress={() => setTimerRunning(true)}
                >
                  <Text style={[styles.btnText, { color: colors.primary }]}>
                    ▶ Bắt đầu ({Math.floor((task.durationSeconds ?? 0) / 60)}p)
                  </Text>
                </TouchableOpacity>
              )}
              {timerRunning && !timerFinished && (
                <CountdownTimer
                  seconds={task.durationSeconds ?? 60}
                  onFinish={handleTimerFinish}
                />
              )}
              {timerFinished && (
                <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleTapComplete}>
                  <Text style={styles.btnText}>Nhận thưởng 🎉</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {task.verifyType === 'PHOTO_REQUIRED' && (
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleTapComplete}>
              <Text style={styles.btnText}>📷 Chụp ảnh để hoàn thành</Text>
            </TouchableOpacity>
          )}

          {task.verifyType === 'PHOTO_OPTIONAL' && (
            <View style={styles.photoGroup}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleTapComplete}>
                <Text style={styles.btnText}>📷 Hoàn thành (có thể kèm ảnh)</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  flex: { flex: 1 },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  doneIcon: { fontSize: 24 },
  taskAvatar: { width: 44, height: 44, borderRadius: 22 },
  titleDone: {
    fontSize: 15, fontWeight: '600',
    textDecorationLine: 'line-through',
  },
  doneLabel: { fontSize: 12, marginTop: 2 },
  header: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  description: { fontSize: 13, lineHeight: 20 },
  rewardPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  rewardPillText: { fontSize: 12, fontWeight: '600' },
  reward: {
    alignItems: 'center', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  rewardEmoji: { fontSize: 18 },
  rewardAmt: { fontSize: 13, fontWeight: '700' },
  growthHint: { fontSize: 12 },
  actionArea: { gap: 8 },
  btn: {
    borderRadius: 12, height: 46,
    justifyContent: 'center', alignItems: 'center',
  },
  btnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  btnSecondary: {
    borderWidth: 1,
  },
  photoGroup: { gap: 6 },
  photoHint: { fontSize: 12, textAlign: 'center' },
});
