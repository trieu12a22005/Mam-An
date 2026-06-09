import { AppText as Text } from '../common/AppText';
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { FocusSessionType } from '../../types/focusSession.type';
import { formatCountdown, formatSessionTitle, getRandomFocusMessage } from '../../constants/focusSessions';
import { COLORS } from '../../constants/colors';

interface Props {
  remainingSeconds: number;
  totalSeconds: number;
  progress: number; // 0–1
  sessionType: FocusSessionType;
  isPaused: boolean;
}

export const FocusTimer: React.FC<Props> = ({
  remainingSeconds, totalSeconds, progress, sessionType, isPaused,
}) => {
  // Lấy message ngẫu nhiên 1 lần khi mount (không đổi trong phiên)
  const hintRef = useRef(getRandomFocusMessage(sessionType));
  const sessionTitle = formatSessionTitle(sessionType, totalSeconds);
  const pct = Math.round(progress * 100);

  return (
    <View style={styles.wrapper}>
      {/* Tiêu đề phiên */}
      <Text style={styles.sessionTitle}>{sessionTitle}</Text>

      {/* Countdown to lớn */}
      <Text style={styles.countdown}>{formatCountdown(remainingSeconds)}</Text>

      {/* Trạng thái */}
      <Text style={styles.statusDot}>
        {isPaused ? '⏸ Đang tạm dừng' : '● Đang chạy'}
      </Text>

      {/* Progress bar + % */}
      <View style={styles.progressRow}>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${pct}%` as any }]} />
        </View>
        <Text style={styles.pctLabel}>{pct}%</Text>
      </View>

      {/* Câu động viên */}
      <Text style={styles.hint}>{hintRef.current}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: 8, paddingHorizontal: 28 },

  sessionTitle: {
    fontSize: 13,
    color: COLORS.text.muted,
    fontWeight: '500',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  countdown: {
    fontSize: 76,
    fontWeight: '200',
    color: COLORS.text.primary,
    letterSpacing: 4,
    // tabular nums để không nhảy layout
    fontVariant: ['tabular-nums'],
    lineHeight: 84,
  },
  statusDot: {
    fontSize: 12,
    color: COLORS.green.main,
    fontWeight: '600',
    letterSpacing: 0.4,
    marginTop: 2,
  },

  // Progress
  progressRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  barBg: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.green.light,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.green.main,
  },
  pctLabel: {
    fontSize: 12,
    color: COLORS.text.muted,
    fontWeight: '600',
    width: 32,
    textAlign: 'right',
  },

  // Câu động viên
  hint: {
    fontSize: 13,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
    marginTop: 12,
  },
});
