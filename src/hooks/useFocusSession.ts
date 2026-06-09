import { useState, useRef, useCallback, useEffect } from 'react';
import { FocusSessionOption, FocusSessionStatus } from '../types/focusSession.type';

interface UseFocusSessionReturn {
  selectedOption: FocusSessionOption | null;
  selectedDuration: number;
  status: FocusSessionStatus;
  remainingSeconds: number;
  completedSeconds: number;
  progress: number; // 0–1
  isMusicOn: boolean;
  startSession: (option: FocusSessionOption, duration: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  /** Kết thúc sớm — tính partial reward nếu >= 50% */
  cancelSession: () => void;
  resetSession: () => void;
  toggleMusic: () => void;
}

export function useFocusSession(): UseFocusSessionReturn {
  const [selectedOption, setSelectedOption] = useState<FocusSessionOption | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(0);
  const [status, setStatus] = useState<FocusSessionStatus>('IDLE');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [completedSeconds, setCompletedSeconds] = useState(0);
  const [isMusicOn, setIsMusicOn] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationRef = useRef(0);

  /** Xóa interval an toàn */
  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /** Cleanup khi unmount */
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const startSession = useCallback(
    (option: FocusSessionOption, duration: number) => {
      clearTimer();
      setSelectedOption(option);
      setSelectedDuration(duration);
      durationRef.current = duration;
      setRemainingSeconds(duration);
      setCompletedSeconds(0);
      setStatus('RUNNING');

      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setCompletedSeconds(durationRef.current);
            setStatus('COMPLETED');
            return 0;
          }
          setCompletedSeconds(durationRef.current - next);
          return next;
        });
      }, 1000);
    },
    [clearTimer],
  );

  const pauseSession = useCallback(() => {
    setStatus((prev) => {
      if (prev !== 'RUNNING') return prev;
      clearTimer();
      return 'PAUSED';
    });
  }, [clearTimer]);

  const resumeSession = useCallback(() => {
    setStatus((prev) => {
      if (prev !== 'PAUSED') return prev;
      
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prevSec) => {
          const next = prevSec - 1;
          if (next <= 0) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setCompletedSeconds(durationRef.current);
            setStatus('COMPLETED');
            return 0;
          }
          setCompletedSeconds(durationRef.current - next);
          return next;
        });
      }, 1000);
      
      return 'RUNNING';
    });
  }, [clearTimer]);

  const cancelSession = useCallback(() => {
    clearTimer();
    setStatus((prev) => {
      const done = durationRef.current - remainingSeconds;
      return done >= durationRef.current * 0.5 ? 'PARTIAL' : 'CANCELLED';
    });
  }, [clearTimer, remainingSeconds]);

  const resetSession = useCallback(() => {
    clearTimer();
    setSelectedOption(null);
    setSelectedDuration(0);
    setStatus('IDLE');
    setRemainingSeconds(0);
    setCompletedSeconds(0);
  }, [clearTimer]);

  const toggleMusic = useCallback(() => {
    setIsMusicOn((prev) => !prev);
  }, []);

  const progress =
    selectedDuration > 0
      ? Math.min(completedSeconds / selectedDuration, 1)
      : 0;

  return {
    selectedOption,
    selectedDuration,
    status,
    remainingSeconds,
    completedSeconds,
    progress,
    isMusicOn,
    startSession,
    pauseSession,
    resumeSession,
    cancelSession,
    resetSession,
    toggleMusic,
  };
}
