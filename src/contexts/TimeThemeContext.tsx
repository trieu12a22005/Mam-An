import React, {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, useMemo,
} from 'react';
import { DayPeriod, AppThemeMode, TimeThemeColors, TimeThemeSettings } from '../types/theme.type';
import { getDayPeriod, getColorsByPeriod } from '../constants/timeThemes';
import { themeStorage, DEFAULT_THEME_SETTINGS } from '../storage/theme.storage';

// ── Context shape ──────────────────────────────────────────────────────────────
interface TimeThemeContextValue {
  dayPeriod: DayPeriod;
  colors: TimeThemeColors;
  settings: TimeThemeSettings;
  isNight: boolean;
  isLoading: boolean;
  updateSettings: (partial: Partial<TimeThemeSettings>) => void;
  setThemeMode: (mode: AppThemeMode) => void;
  toggleTimeTheme: () => void;
  toggleNightEffects: () => void;
  refreshPeriod: () => void;
}

const TimeThemeContext = createContext<TimeThemeContextValue | null>(null);

// ── Tính màu hiện tại dựa trên settings ───────────────────────────────────────
function resolveColors(period: DayPeriod, settings: TimeThemeSettings): TimeThemeColors {
  if (!settings.enableTimeTheme || settings.themeMode === 'LIGHT') {
    return getColorsByPeriod('MORNING');
  }
  if (settings.themeMode === 'DARK') {
    return getColorsByPeriod('NIGHT');
  }
  // AUTO: dùng màu theo giờ
  return getColorsByPeriod(period);
}

function resolveEffectivePeriod(period: DayPeriod, settings: TimeThemeSettings): DayPeriod {
  if (settings.themeMode === 'DARK') return 'NIGHT';
  if (settings.themeMode === 'LIGHT') return 'MORNING';
  return period;
}

// ── Provider ───────────────────────────────────────────────────────────────────
export const TimeThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<TimeThemeSettings>(DEFAULT_THEME_SETTINGS);
  const [dayPeriod, setDayPeriod] = useState<DayPeriod>(getDayPeriod());
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load settings từ storage khi mount
  useEffect(() => {
    themeStorage.getThemeSettings().then((saved) => {
      setSettings(saved);
      setIsLoading(false);
    });
  }, []);

  // Cập nhật period mỗi 60 giây
  useEffect(() => {
    const tick = () => setDayPeriod(getDayPeriod());
    intervalRef.current = setInterval(tick, 60_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────
  const updateSettings = useCallback((partial: Partial<TimeThemeSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      themeStorage.saveThemeSettings(next); // fire-and-forget
      return next;
    });
  }, []);

  const setThemeMode = useCallback((mode: AppThemeMode) => {
    updateSettings({ themeMode: mode });
  }, [updateSettings]);

  const toggleTimeTheme = useCallback(() => {
    setSettings((prev) => {
      const next = { ...prev, enableTimeTheme: !prev.enableTimeTheme };
      themeStorage.saveThemeSettings(next);
      return next;
    });
  }, []);

  const toggleNightEffects = useCallback(() => {
    setSettings((prev) => {
      const next = { ...prev, enableNightEffects: !prev.enableNightEffects };
      themeStorage.saveThemeSettings(next);
      return next;
    });
  }, []);

  const refreshPeriod = useCallback(() => {
    setDayPeriod(getDayPeriod());
  }, []);

  // ── Derived values ─────────────────────────────────────────────────────────
  const effectivePeriod = resolveEffectivePeriod(dayPeriod, settings);
  const colors = useMemo(() => resolveColors(dayPeriod, settings), [dayPeriod, settings]);
  const isNight = effectivePeriod === 'NIGHT';

  const value: TimeThemeContextValue = useMemo(() => ({
    dayPeriod: effectivePeriod,
    colors,
    settings,
    isNight,
    isLoading,
    updateSettings,
    setThemeMode,
    toggleTimeTheme,
    toggleNightEffects,
    refreshPeriod,
  }), [
    effectivePeriod, colors, settings, isNight, isLoading,
    updateSettings, setThemeMode, toggleTimeTheme, toggleNightEffects, refreshPeriod,
  ]);

  return (
    <TimeThemeContext.Provider value={value}>
      {children}
    </TimeThemeContext.Provider>
  );
};

// ── Hook ───────────────────────────────────────────────────────────────────────
export const useTimeTheme = (): TimeThemeContextValue => {
  const ctx = useContext(TimeThemeContext);
  if (!ctx) throw new Error('useTimeTheme phải được dùng trong TimeThemeProvider');
  return ctx;
};
