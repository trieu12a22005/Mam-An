// ── Các kiểu dữ liệu cho hệ thống theme theo thời gian ────────────────────────

export type DayPeriod = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';

export type AppThemeMode = 'AUTO' | 'LIGHT' | 'DARK';

export interface TimeThemeColors {
  background: string;
  surface: string;
  surfaceSoft: string;
  primary: string;
  primarySoft: string;
  text: string;
  textMuted: string;
  border: string;
  shadow: string;
  accent: string;
}

export interface TimeThemeSettings {
  themeMode: AppThemeMode;
  enableTimeTheme: boolean;
  enableNightEffects: boolean;
}
