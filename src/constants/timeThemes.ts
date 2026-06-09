import { DayPeriod, TimeThemeColors } from '../types/theme.type';

// ── Bộ màu theo từng khung giờ ─────────────────────────────────────────────────

export const TIME_THEMES: Record<DayPeriod, TimeThemeColors> = {
  MORNING: {
    background:  '#F4FBF5',
    surface:     '#FFFFFF',
    surfaceSoft: '#EAF7EF',
    primary:     '#1F6B3A',
    primarySoft: '#CDEFD8',
    text:        '#143D25',
    textMuted:   '#7FA08A',
    border:      '#DDEEE3',
    shadow:      'rgba(20, 61, 37, 0.12)',
    accent:      '#F5C95A',
  },
  AFTERNOON: {
    background:  '#F7FBF2',
    surface:     '#FFFFFF',
    surfaceSoft: '#F0F7DF',
    primary:     '#2E7D46',
    primarySoft: '#D9F1C8',
    text:        '#173D26',
    textMuted:   '#86A48C',
    border:      '#E1EED8',
    shadow:      'rgba(20, 61, 37, 0.10)',
    accent:      '#F2D36B',
  },
  EVENING: {
    background:  '#FFF7EC',
    surface:     '#FFFFFF',
    surfaceSoft: '#FBEAD4',
    primary:     '#2F6B45',
    primarySoft: '#FFE3B5',
    text:        '#173D26',
    textMuted:   '#9B8B73',
    border:      '#F1DFC4',
    shadow:      'rgba(86, 61, 35, 0.12)',
    accent:      '#F0A35A',
  },
  NIGHT: {
    background:  '#10251B',
    surface:     '#173426',
    surfaceSoft: '#1F4632',
    primary:     '#8BE0A4',
    primarySoft: '#244F38',
    text:        '#F0FFF4',
    textMuted:   '#B4CDBD',
    border:      '#2E5A42',
    shadow:      'rgba(0, 0, 0, 0.25)',
    accent:      '#F8D78A',
  },
};

// ── Xác định khung giờ hiện tại ────────────────────────────────────────────────
export function getDayPeriod(date?: Date): DayPeriod {
  const hour = (date ?? new Date()).getHours();
  if (hour >= 5 && hour < 11)  return 'MORNING';
  if (hour >= 11 && hour < 17) return 'AFTERNOON';
  if (hour >= 17 && hour < 20) return 'EVENING';
  return 'NIGHT'; // 20:00 – 05:00
}

// ── Lấy màu theo khung giờ ─────────────────────────────────────────────────────
export function getColorsByPeriod(period: DayPeriod): TimeThemeColors {
  return TIME_THEMES[period];
}
