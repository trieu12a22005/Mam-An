import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  View, Modal, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Platform, Animated,
} from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { AppText as Text } from '../common/AppText';
import { CalmMusicTrack } from '../../api/calmMusicApi';
import { COLORS } from '../../constants/colors';

type FilterType = 'ALL' | 'INSTRUMENTAL' | 'LYRICS';

const PREVIEW_DURATION = 60; // giây nghe thử

const CATEGORY_LABELS: Record<string, string> = {
  rain:    '🌧 Mưa',
  nature:  '🌿 Thiên nhiên',
  piano:   '🎹 Piano',
  lofi:    '🎧 Lo-fi',
  general: '🎵 Tổng hợp',
};

interface Props {
  visible: boolean;
  tracks: CalmMusicTrack[];
  selectedTrack: CalmMusicTrack | null;
  isLoading: boolean;
  onSelect: (track: CalmMusicTrack | null) => void;
  /** Gọi khi nhấn "Bắt đầu phiên" — bắt đầu session với track đang chọn */
  onConfirm: () => void;
  onClose: () => void;
}

export function MusicPickerSheet({
  visible, tracks, selectedTrack, isLoading, onSelect, onConfirm, onClose,
}: Props) {
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(PREVIEW_DURATION);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previewingRef = useRef<string | null>(null);

  // Player riêng chỉ dùng để nghe thử trong picker
  const previewPlayer = useAudioPlayer(null);
  const previewStatus = useAudioPlayerStatus(previewPlayer);

  // Waveform animation
  const bars = useRef([...Array(5)].map(() => new Animated.Value(0.3))).current;
  const waveAnim = useRef<Animated.CompositeAnimation | null>(null);

  const startWave = useCallback(() => {
    waveAnim.current?.stop();
    waveAnim.current = Animated.loop(
      Animated.stagger(100, bars.map(b =>
        Animated.sequence([
          Animated.timing(b, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(b, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ])
      ))
    );
    waveAnim.current.start();
  }, [bars]);

  const stopWave = useCallback(() => {
    waveAnim.current?.stop();
    bars.forEach(b => b.setValue(0.3));
  }, [bars]);

  // Dọn dẹp khi đóng picker
  useEffect(() => {
    if (!visible) {
      stopPreview();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const stopPreview = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    try { previewPlayer.pause(); } catch (_) {}
    setPreviewingId(null);
    previewingRef.current = null;
    setCountdown(PREVIEW_DURATION);
    stopWave();
  }, [previewPlayer, stopWave]);

  const startPreview = useCallback(async (track: CalmMusicTrack) => {
    // Nếu đang nghe thử track này → dừng
    if (previewingRef.current === track.id) {
      stopPreview();
      return;
    }

    // Dừng preview cũ
    if (countdownRef.current) clearInterval(countdownRef.current);
    try { previewPlayer.pause(); } catch (_) {}

    setPreviewingId(track.id);
    previewingRef.current = track.id;
    setCountdown(PREVIEW_DURATION);
    startWave();

    try {
      previewPlayer.replace({ uri: track.publicUrl });
      await new Promise(res => setTimeout(res, 150));
      if (previewingRef.current !== track.id) return;
      previewPlayer.volume = 0.8;
      previewPlayer.play();
    } catch (err) {
      console.warn('[Preview] error:', err);
    }

    // Đếm ngược 60s
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          stopPreview();
          return PREVIEW_DURATION;
        }
        return prev - 1;
      });
    }, 1000);
  }, [previewPlayer, startWave, stopPreview]);

  const handleSelectTrack = (track: CalmMusicTrack) => {
    if (track.id === selectedTrack?.id) {
      onSelect(null); // bỏ chọn
    } else {
      onSelect(track);
    }
  };

  const handleConfirmAndClose = () => {
    stopPreview();
    onConfirm();
  };

  const handleClose = () => {
    stopPreview();
    onClose();
  };

  const filteredTracks = useMemo(() => {
    if (filter === 'INSTRUMENTAL') return tracks.filter(t => !t.hasLyrics);
    if (filter === 'LYRICS')       return tracks.filter(t => t.hasLyrics);
    return tracks;
  }, [tracks, filter]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />

      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>🎵 Chọn nhạc nền</Text>
            <Text style={styles.subtitle}>Nhấn vào bản nhạc để nghe thử 60 giây</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {(['ALL', 'INSTRUMENTAL', 'LYRICS'] as FilterType[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.tab, filter === f && styles.tabActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.tabText, filter === f && styles.tabTextActive]}>
                {f === 'ALL' ? 'Tất cả' : f === 'INSTRUMENTAL' ? '🎹 Không lời' : '🎤 Có lời'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Track list */}
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={COLORS.green.main} />
            <Text style={styles.loadingText}>Đang tải nhạc…</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {/* Không nhạc */}
            <TouchableOpacity
              style={[styles.trackRow, !selectedTrack && styles.trackRowSelected]}
              onPress={() => { onSelect(null); }}
              activeOpacity={0.7}
            >
              <View style={styles.trackIconBox}>
                <Text style={styles.trackEmoji}>🔇</Text>
              </View>
              <View style={styles.trackMeta}>
                <Text style={styles.trackName}>Không nhạc</Text>
                <Text style={styles.trackSub}>Tận hưởng sự yên tĩnh</Text>
              </View>
              {!selectedTrack && <View style={styles.checkCircle}><Text style={styles.checkText}>✓</Text></View>}
            </TouchableOpacity>

            <View style={styles.divider} />

            {filteredTracks.length === 0 ? (
              <Text style={styles.emptyText}>
                {tracks.length === 0 ? 'Chưa có bản nhạc nào.' : 'Không có bản nhạc phù hợp.'}
              </Text>
            ) : (
              filteredTracks.map((track) => {
                const isSelected = track.id === selectedTrack?.id;
                const isPreviewing = previewingId === track.id;
                const catLabel = CATEGORY_LABELS[track.category] ?? track.category;

                return (
                  <View key={track.id}>
                    <View style={[styles.trackRow, isSelected && styles.trackRowSelected]}>
                      {/* Icon — nhấn để preview */}
                      <TouchableOpacity
                        style={[styles.trackIconBox, isPreviewing && styles.trackIconBoxPlaying]}
                        onPress={() => startPreview(track)}
                        activeOpacity={0.7}
                      >
                        {isPreviewing ? (
                          // Waveform animation
                          <View style={styles.waveform}>
                            {bars.map((anim, i) => (
                              <Animated.View
                                key={i}
                                style={[styles.waveBar, { transform: [{ scaleY: anim }] }]}
                              />
                            ))}
                          </View>
                        ) : (
                          <Text style={styles.trackEmoji}>
                            {track.hasLyrics ? '🎤' : '🎹'}
                          </Text>
                        )}
                      </TouchableOpacity>

                      {/* Info — nhấn để chọn */}
                      <TouchableOpacity
                        style={styles.trackMeta}
                        onPress={() => handleSelectTrack(track)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.trackName} numberOfLines={1}>{track.titleVi}</Text>
                        <View style={styles.badgeRow}>
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>{catLabel}</Text>
                          </View>
                          <View style={[styles.badge, track.hasLyrics ? styles.badgeLyrics : styles.badgeInstrumental]}>
                            <Text style={styles.badgeText}>{track.hasLyrics ? 'Có lời' : 'Không lời'}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>

                      {/* Check / Preview action */}
                      {isSelected ? (
                        <View style={styles.checkCircle}><Text style={styles.checkText}>✓</Text></View>
                      ) : (
                        <TouchableOpacity
                          style={styles.previewBtn}
                          onPress={() => handleSelectTrack(track)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.previewBtnText}>Chọn</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Preview countdown bar */}
                    {isPreviewing && (
                      <View style={styles.previewBar}>
                        <View style={[styles.previewProgress, { width: `${(countdown / PREVIEW_DURATION) * 100}%` as any }]} />
                        <View style={styles.previewBarLabels}>
                          <Text style={styles.previewBarText}>🎧 Đang nghe thử</Text>
                          <Text style={styles.previewBarText}>{countdown}s</Text>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })
            )}
            <View style={{ height: 16 }} />
          </ScrollView>
        )}

        {/* Bottom: Bắt đầu phiên */}
        <View style={styles.footer}>
          {selectedTrack && (
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedInfoText} numberOfLines={1}>
                🎵 {selectedTrack.titleVi}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.startBtn, !selectedTrack && styles.startBtnNoMusic]}
            onPress={handleConfirmAndClose}
            activeOpacity={0.85}
          >
            <Text style={styles.startBtnText}>
              {selectedTrack ? '▶  Bắt đầu với nhạc này' : '▶  Bắt đầu không có nhạc'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '82%',
    paddingTop: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 24,
  },
  handle: {
    width: 40, height: 4, backgroundColor: COLORS.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', paddingHorizontal: 20, marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text.primary },
  subtitle: { fontSize: 12, color: COLORS.text.muted, marginTop: 2 },
  closeBtn: {
    width: 30, height: 30, backgroundColor: COLORS.green[50],
    borderRadius: 15, alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontSize: 12, color: COLORS.text.muted, fontWeight: '600' },

  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  tab: {
    flex: 1, height: 34, borderRadius: 10,
    backgroundColor: COLORS.green[50],
    alignItems: 'center', justifyContent: 'center',
  },
  tabActive: { backgroundColor: COLORS.green.main },
  tabText: { fontSize: 12, fontWeight: '600', color: COLORS.text.secondary },
  tabTextActive: { color: '#fff' },

  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },

  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 4 },

  trackRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 10,
    borderRadius: 14, marginBottom: 4, gap: 10,
  },
  trackRowSelected: {
    backgroundColor: COLORS.green[50],
    borderWidth: 1.5, borderColor: COLORS.green.main,
  },
  trackIconBox: {
    width: 46, height: 46,
    backgroundColor: COLORS.green[100],
    borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  trackIconBoxPlaying: { backgroundColor: COLORS.green.main },
  trackEmoji: { fontSize: 22 },

  // Waveform bars
  waveform: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 22 },
  waveBar: {
    width: 3, height: 16,
    backgroundColor: '#fff', borderRadius: 2,
  },

  trackMeta: { flex: 1, gap: 4 },
  trackName: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary },
  trackSub: { fontSize: 12, color: COLORS.text.muted },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge: {
    backgroundColor: COLORS.green[100], borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  badgeLyrics: { backgroundColor: '#FEF3C7' },
  badgeInstrumental: { backgroundColor: '#E0F2FE' },
  badgeText: { fontSize: 10, color: COLORS.text.secondary, fontWeight: '500' },

  checkCircle: {
    width: 26, height: 26, backgroundColor: COLORS.green.main,
    borderRadius: 13, alignItems: 'center', justifyContent: 'center',
  },
  checkText: { fontSize: 13, color: '#fff', fontWeight: '700' },

  previewBtn: {
    backgroundColor: COLORS.green[50],
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  previewBtnText: { fontSize: 12, color: COLORS.green.dark, fontWeight: '600' },

  // Preview countdown
  previewBar: {
    marginHorizontal: 4, marginBottom: 8,
    backgroundColor: COLORS.green[100],
    borderRadius: 10, overflow: 'hidden', height: 28,
    justifyContent: 'center',
  },
  previewProgress: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    backgroundColor: COLORS.green[200], borderRadius: 10,
  },
  previewBarLabels: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 10, zIndex: 1,
  },
  previewBarText: { fontSize: 11, color: COLORS.green.dark, fontWeight: '600' },

  loadingBox: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  loadingText: { fontSize: 13, color: COLORS.text.muted },
  emptyText: { textAlign: 'center', padding: 32, fontSize: 13, color: COLORS.text.muted },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'android' ? 28 : 12,
    paddingTop: 12,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    gap: 10,
  },
  selectedInfo: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.green[50],
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
  },
  selectedInfoText: { fontSize: 13, color: COLORS.text.secondary, fontWeight: '500', flex: 1 },
  startBtn: {
    height: 52, backgroundColor: COLORS.green.main,
    borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.green.main, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  startBtnNoMusic: { backgroundColor: COLORS.text.muted },
  startBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
