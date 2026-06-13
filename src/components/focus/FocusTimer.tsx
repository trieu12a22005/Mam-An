import { AppText as Text } from '../common/AppText';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { FocusSessionType } from '../../types/focusSession.type';
import { formatCountdown, formatSessionTitle, getRandomFocusMessage } from '../../constants/focusSessions';
import { COLORS } from '../../constants/colors';
import { useTimeTheme } from '../../contexts/TimeThemeContext';

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
  const { colors, isNight } = useTimeTheme();

  // Message thay đổi mỗi 30s
  const [hint, setHint] = useState(() => getRandomFocusMessage(sessionType));

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setHint((prev) => {
        let nextHint = getRandomFocusMessage(sessionType);
        // Tránh bị lặp lại cùng một câu liên tiếp
        let attempts = 0;
        while (nextHint === prev && attempts < 5) {
          nextHint = getRandomFocusMessage(sessionType);
          attempts++;
        }
        return nextHint;
      });
    }, 30000); // Đổi mỗi 30 giây

    return () => clearInterval(interval);
  }, [sessionType, isPaused]);
  const sessionTitle = formatSessionTitle(sessionType, totalSeconds);
  const pct = Math.round(progress * 100);

  return (
    <View style={styles.wrapper}>
      {/* Câu động viên */}
      <View style={styles.hintContainer}>
        <Text style={[styles.hint, isNight && { color: colors.textMuted }]}>"{hint}"</Text>
      </View>

      {/* Tiêu đề phiên */}
      <Text style={[styles.sessionTitle, { color: colors.textMuted }]}>{sessionTitle}</Text>

      {/* Countdown to lớn */}
      <Text style={[styles.countdown, { color: colors.text }]}>{formatCountdown(remainingSeconds)}</Text>

      {/* Trạng thái */}
      <Text style={styles.statusDot}>
        {isPaused ? '⏸ Đang tạm dừng' : '● Đang chạy'}
      </Text>


    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: 5, paddingHorizontal: 28 },

  sessionTitle: {
    fontSize: 13,
    color: COLORS.text.muted,
    fontWeight: '500',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  countdown: {
    fontSize: 52,
    fontWeight: '200',
    color: COLORS.text.primary,
    letterSpacing: 3,
    fontVariant: ['tabular-nums'],
    lineHeight: 60,
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
    marginTop: 6,
  },
  barBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
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
  hintContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
    minHeight: 44,
    justifyContent: 'center',
  },
  hint: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
    fontWeight: '500',
  },
});
