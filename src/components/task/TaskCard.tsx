import { AppText as Text } from '../common/AppText';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { CareTask } from '../../types/task.type';
import { RESOURCES } from '../../constants/resources';
import { COLORS } from '../../constants/colors';

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
      <View style={timerStyles.barBg}>
        <View style={[timerStyles.barFill, { width: `${progress * 100}%` as any }]} />
      </View>
      <Text style={timerStyles.label}>
        ⏱ {mins > 0 ? `${mins}m ` : ''}{secs.toString().padStart(2, '0')}s
      </Text>
    </View>
  );
};


const timerStyles = StyleSheet.create({
  wrapper: { gap: 4 },
  barBg: {
    height: 6, borderRadius: 3,
    backgroundColor: COLORS.green.light, overflow: 'hidden',
  },
  barFill: {
    height: '100%', borderRadius: 3,
    backgroundColor: COLORS.green.main,
  },
  label: { fontSize: 13, color: COLORS.text.muted, textAlign: 'center' },
});

// ── Main TaskCard ────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: CareTask;
  onComplete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete }) => {
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);
  const resource = RESOURCES[task.rewardResource];
  const emoji = RESOURCE_EMOJI[task.rewardResource];

  const handleTimerFinish = useCallback(() => {
    setTimerFinished(true);
  }, []);

  const handleComplete = () => {
    if (!task.completedToday) {
      onComplete(task.id);
    }
  };

  // ── Completed state ──
  if (task.completedToday) {
    return (
      <View style={[styles.card, styles.cardDone]}>
        <View style={styles.doneRow}>
          <Text style={styles.doneIcon}>✅</Text>
          <View style={styles.flex}>
            <Text style={styles.titleDone}>{task.title}</Text>
            <Text style={styles.doneLabel}>Đã hoàn thành hôm nay</Text>
          </View>
          <View style={[styles.reward, { backgroundColor: resource.color + '22' }]}>
            <Text style={styles.rewardEmoji}>{emoji}</Text>
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
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.flex}>
          <Text style={styles.title}>{task.title}</Text>
          {task.description && (
            <Text style={styles.description}>{task.description}</Text>
          )}
        </View>
        {/* Reward pill */}
        <View style={[styles.rewardPill, { backgroundColor: resource.color + '22' }]}>
          <Text>{emoji}</Text>
          <Text style={[styles.rewardPillText, { color: resource.color }]}>
            +{task.rewardAmount} {resource.label}
          </Text>
        </View>
      </View>

      {/* Growth reward */}
      <Text style={styles.growthHint}>🌱 +{task.growthReward} điểm phát triển</Text>

      {/* Actions by verifyType */}
      <View style={styles.actionArea}>
        {task.verifyType === 'SELF_CONFIRM' && (
          <TouchableOpacity style={styles.btn} onPress={handleComplete}>
            <Text style={styles.btnText}>Tôi đã hoàn thành ✓</Text>
          </TouchableOpacity>
        )}

        {task.verifyType === 'TIMER' && (
          <>
            {!timerRunning && !timerFinished && (
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                onPress={() => setTimerRunning(true)}
              >
                <Text style={[styles.btnText, styles.btnSecondaryText]}>
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
              <TouchableOpacity style={styles.btn} onPress={handleComplete}>
                <Text style={styles.btnText}>Nhận thưởng 🎉</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {task.verifyType === 'OPTIONAL_PHOTO' && (
          <View style={styles.photoGroup}>
            <TouchableOpacity style={styles.btn} onPress={handleComplete}>
              <Text style={styles.btnText}>Tôi đã hoàn thành ✓</Text>
            </TouchableOpacity>
            <Text style={styles.photoHint}>📷 Ảnh là tùy chọn, không bắt buộc</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDone: {
    backgroundColor: COLORS.green[50],
    borderWidth: 1,
    borderColor: COLORS.green.light,
  },
  flex: { flex: 1 },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  doneIcon: { fontSize: 24 },
  titleDone: {
    fontSize: 15, fontWeight: '600', color: COLORS.text.secondary,
    textDecorationLine: 'line-through',
  },
  doneLabel: { fontSize: 12, color: COLORS.green.main, marginTop: 2 },
  header: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.text.primary, marginBottom: 4 },
  description: { fontSize: 13, color: COLORS.text.secondary, lineHeight: 20 },
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
  growthHint: { fontSize: 12, color: COLORS.text.muted },
  actionArea: { gap: 8 },
  btn: {
    backgroundColor: COLORS.green.main,
    borderRadius: 12, height: 46,
    justifyContent: 'center', alignItems: 'center',
  },
  btnText: { color: COLORS.white, fontWeight: '600', fontSize: 15 },
  btnSecondary: {
    backgroundColor: COLORS.green.light,
    borderWidth: 1, borderColor: COLORS.green.main,
  },
  btnSecondaryText: { color: COLORS.green.dark },
  photoGroup: { gap: 6 },
  photoHint: { fontSize: 12, color: COLORS.text.muted, textAlign: 'center' },
});
