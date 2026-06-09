import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Platform, ActivityIndicator, Animated,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { AppText as Text } from '../src/components/common/AppText';
import { COLORS } from '../src/constants/colors';
import { fetchCalmMusicTracks, CalmMusicTrack } from '../src/api/calmMusicApi';
import { calmSessionStore } from '../src/store/calmSessionStore';
import { ThemedScreen } from '../src/components/theme/ThemedScreen';

// ── Preview Player (component pattern: mount/unmount để tạo fresh player) ─────
function PreviewPlayer({ uri, onStop }: { uri: string; onStop: () => void }) {
  const player = useAudioPlayer({ uri }, 200);

  useEffect(() => {
    // Cấu hình audio mode đúng tham số
    setAudioModeAsync({ playsInSilentMode: true, staysActiveInBackground: false })
      .catch(() => {});

    // Delay nhỏ để source load trước khi play
    const t = setTimeout(() => {
      try {
        player.volume = 0.85;
        player.play();
      } catch (e) {
        console.warn('[Preview] play error:', e);
      }
    }, 250);

    // Auto-stop sau 60 giây
    const stop = setTimeout(() => {
      try { player.pause(); } catch {}
      onStop();
    }, 60_000);

    return () => {
      clearTimeout(t);
      clearTimeout(stop);
      try { player.pause(); } catch {}
      try { player.remove(); } catch {}
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null; // Không render UI, chỉ xử lý audio
}

// ── Constants ─────────────────────────────────────────────────────────────────
type FilterType = 'ALL' | 'INSTRUMENTAL' | 'LYRICS';

const CATEGORY_LABELS: Record<string, string> = {
  rain: '🌧 Mưa', nature: '🌿 Thiên nhiên',
  piano: '🎹 Piano', lofi: '🎧 Lo-fi', general: '🎵 Tổng hợp',
};

// ── Screen ────────────────────────────────────────────────────────────────────
export default function MusicSelectScreen() {
  const [tracks, setTracks] = useState<CalmMusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [selectedTrack, setSelectedTrack] = useState<CalmMusicTrack | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Waveform animation
  const bars = useRef([...Array(5)].map(() => new Animated.Value(0.3))).current;
  const waveAnim = useRef<Animated.CompositeAnimation | null>(null);

  // Load tracks
  useEffect(() => {
    fetchCalmMusicTracks()
      .then(setTracks)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // Waveform helpers
  const startWave = useCallback(() => {
    waveAnim.current?.stop();
    waveAnim.current = Animated.loop(
      Animated.stagger(80, bars.map(b =>
        Animated.sequence([
          Animated.timing(b, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(b, { toValue: 0.25, duration: 350, useNativeDriver: true }),
        ])
      ))
    );
    waveAnim.current.start();
  }, [bars]);

  const stopWave = useCallback(() => {
    waveAnim.current?.stop();
    bars.forEach(b => b.setValue(0.3));
  }, [bars]);

  // Stop preview countdown
  const stopPreviewCountdown = useCallback(() => {
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    stopWave();
  }, [stopWave]);

  const handlePreviewStop = useCallback(() => {
    stopPreviewCountdown();
    setPreviewingId(null);
    setCountdown(60);
  }, [stopPreviewCountdown]);

  // Tap icon để preview / dừng preview
  const handleTogglePreview = useCallback((track: CalmMusicTrack) => {
    if (previewingId === track.id) {
      // Đang nghe thử → dừng
      handlePreviewStop();
      return;
    }
    // Bắt đầu nghe thử mới
    stopPreviewCountdown();
    setPreviewingId(track.id);
    setCountdown(60);
    startWave();

    // Bắt đầu đếm ngược
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handlePreviewStop();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
  }, [previewingId, startWave, stopPreviewCountdown, handlePreviewStop]);

  // Tap text/row để chọn track
  const handleSelectTrack = useCallback((track: CalmMusicTrack) => {
    setSelectedTrack(prev => prev?.id === track.id ? null : track);
  }, []);

  // Xác nhận bắt đầu phiên
  const handleConfirm = () => {
    // Dừng preview trước
    stopPreviewCountdown();
    setPreviewingId(null);

    calmSessionStore.setTrack(selectedTrack);
    calmSessionStore.confirm();
    router.back();
  };

  const filteredTracks = useMemo(() => {
    if (filter === 'INSTRUMENTAL') return tracks.filter(t => !t.hasLyrics);
    if (filter === 'LYRICS') return tracks.filter(t => t.hasLyrics);
    return tracks;
  }, [tracks, filter]);

  // Dọn dẹp khi rời màn hình
  useFocusEffect(useCallback(() => {
    return () => {
      stopPreviewCountdown();
      setPreviewingId(null);
    };
  }, [stopPreviewCountdown]));

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <ThemedScreen>
      <StatusBar barStyle="dark-content" />

      {/* Preview Player — mount/unmount khi previewingId đổi */}
      {previewingId !== null && (() => {
        const track = tracks.find(t => t.id === previewingId);
        return track
          ? <PreviewPlayer key={previewingId} uri={track.publicUrl} onStop={handlePreviewStop} />
          : null;
      })()}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Chọn nhạc nền 🎵</Text>
          <Text style={styles.headerSub}>Nhấn icon để nghe thử · nhấn hàng để chọn</Text>
        </View>
        <View style={{ width: 40 }} />
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
          <ActivityIndicator color={COLORS.green.main} size="large" />
          <Text style={styles.loadingText}>Đang tải danh sách nhạc…</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Không nhạc option */}
          <TouchableOpacity
            style={[styles.trackRow, !selectedTrack && styles.trackRowSelected]}
            onPress={() => setSelectedTrack(null)}
            activeOpacity={0.75}
          >
            <View style={[styles.iconBox, !selectedTrack && styles.iconBoxSelected]}>
              <Text style={styles.emoji}>🔇</Text>
            </View>
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle}>Không nhạc</Text>
              <Text style={styles.trackSub}>Tận hưởng sự yên tĩnh</Text>
            </View>
            {!selectedTrack && (
              <View style={styles.checkBadge}>
                <Text style={styles.checkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>Danh sách nhạc</Text>
            <View style={styles.separatorLine} />
          </View>

          {filteredTracks.length === 0 ? (
            <Text style={styles.emptyText}>
              {tracks.length === 0
                ? 'Chưa có bản nhạc nào trong thư viện.'
                : 'Không có nhạc phù hợp với bộ lọc.'}
            </Text>
          ) : (
            filteredTracks.map(track => {
              const isSelected = selectedTrack?.id === track.id;
              const isPreviewing = previewingId === track.id;

              return (
                <View key={track.id}>
                  <View style={[styles.trackRow, isSelected && styles.trackRowSelected]}>
                    {/* Icon — nhấn để preview */}
                    <TouchableOpacity
                      style={[
                        styles.iconBox,
                        isSelected && styles.iconBoxSelected,
                        isPreviewing && styles.iconBoxPreviewing,
                      ]}
                      onPress={() => handleTogglePreview(track)}
                      activeOpacity={0.7}
                    >
                      {isPreviewing ? (
                        <View style={styles.waveform}>
                          {bars.map((anim, i) => (
                            <Animated.View
                              key={i}
                              style={[styles.waveBar, { transform: [{ scaleY: anim }] }]}
                            />
                          ))}
                        </View>
                      ) : (
                        <Text style={styles.emoji}>
                          {track.hasLyrics ? '🎤' : '🎹'}
                        </Text>
                      )}
                    </TouchableOpacity>

                    {/* Info — nhấn để chọn */}
                    <TouchableOpacity
                      style={styles.trackInfo}
                      onPress={() => handleSelectTrack(track)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.trackTitle} numberOfLines={2}>{track.titleVi}</Text>
                      <View style={styles.badgeRow}>
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>
                            {CATEGORY_LABELS[track.category] ?? track.category}
                          </Text>
                        </View>
                        <View style={[styles.badge,
                          track.hasLyrics ? styles.badgeLyrics : styles.badgeInstr]}>
                          <Text style={styles.badgeText}>
                            {track.hasLyrics ? 'Có lời' : 'Không lời'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Action */}
                    {isSelected ? (
                      <View style={styles.checkBadge}>
                        <Text style={styles.checkText}>✓</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.selectBtn}
                        onPress={() => handleSelectTrack(track)}
                      >
                        <Text style={styles.selectBtnText}>Chọn</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Preview progress bar */}
                  {isPreviewing && (
                    <View style={styles.previewBar}>
                      <View style={[
                        styles.previewFill,
                        { width: `${(countdown / 60) * 100}%` as any },
                      ]} />
                      <View style={styles.previewLabels}>
                        <Text style={styles.previewLabelText}>🎧 Đang nghe thử</Text>
                        <Text style={styles.previewLabelText}>{countdown}s còn lại</Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          )}
          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      {/* Bottom confirm */}
      <View style={styles.footer}>
        {selectedTrack && (
          <View style={styles.selectedBanner}>
            <Text style={styles.selectedBannerText} numberOfLines={1}>
              🎵  {selectedTrack.titleVi}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.confirmBtn, !selectedTrack && styles.confirmBtnGray]}
          onPress={handleConfirm}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmBtnText}>
            {selectedTrack
              ? `▶  Bắt đầu · ${selectedTrack.titleVi}`
              : '▶  Bắt đầu không nhạc'}
          </Text>
        </TouchableOpacity>
      </View>
    </ThemedScreen>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 8,
    paddingTop: Platform.OS === 'android' ? 36 : 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.green[50],
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 20, color: COLORS.green.dark },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text.primary },
  headerSub: { fontSize: 11, color: COLORS.text.muted, marginTop: 2 },

  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  tab: {
    flex: 1, height: 36, borderRadius: 10,
    backgroundColor: COLORS.green[50],
    alignItems: 'center', justifyContent: 'center',
  },
  tabActive: { backgroundColor: COLORS.green.main },
  tabText: { fontSize: 12, fontWeight: '600', color: COLORS.text.secondary },
  tabTextActive: { color: '#fff' },

  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: COLORS.text.muted },

  listContent: { paddingHorizontal: 16, paddingTop: 4 },

  separator: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginVertical: 12,
  },
  separatorLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  separatorText: { fontSize: 11, color: COLORS.text.muted, fontWeight: '500' },

  trackRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 10,
    borderRadius: 16, marginBottom: 6, gap: 12,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  trackRowSelected: {
    backgroundColor: COLORS.green[50],
    borderColor: COLORS.green.main,
  },

  iconBox: {
    width: 50, height: 50, borderRadius: 14,
    backgroundColor: COLORS.green[100],
    alignItems: 'center', justifyContent: 'center',
  },
  iconBoxSelected: { backgroundColor: COLORS.green[200] },
  iconBoxPreviewing: { backgroundColor: COLORS.green.main },
  emoji: { fontSize: 24 },

  // Waveform bars
  waveform: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 24 },
  waveBar: { width: 3.5, height: 18, backgroundColor: '#fff', borderRadius: 2 },

  trackInfo: { flex: 1, gap: 5 },
  trackTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary, lineHeight: 20 },
  trackSub: { fontSize: 12, color: COLORS.text.muted },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge: {
    backgroundColor: COLORS.green[100], borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  badgeLyrics: { backgroundColor: '#FEF3C7' },
  badgeInstr: { backgroundColor: '#E0F2FE' },
  badgeText: { fontSize: 10, color: COLORS.text.secondary, fontWeight: '500' },

  checkBadge: {
    width: 28, height: 28, backgroundColor: COLORS.green.main,
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
  checkText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  selectBtn: {
    backgroundColor: COLORS.green[50], borderRadius: 9,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: COLORS.green[200],
  },
  selectBtnText: { fontSize: 12, color: COLORS.green.dark, fontWeight: '600' },

  // Preview bar
  previewBar: {
    marginHorizontal: 2, marginBottom: 8,
    height: 30, borderRadius: 10,
    backgroundColor: COLORS.green[100], overflow: 'hidden',
    justifyContent: 'center',
  },
  previewFill: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    backgroundColor: COLORS.green[200], borderRadius: 10,
  },
  previewLabels: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 12, zIndex: 1,
  },
  previewLabelText: { fontSize: 11, color: COLORS.green.dark, fontWeight: '600' },

  emptyText: { textAlign: 'center', padding: 40, fontSize: 14, color: COLORS.text.muted, lineHeight: 24 },

  // Footer
  footer: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'android' ? 32 : 16,
    paddingTop: 12,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    gap: 10, backgroundColor: COLORS.surface,
  },
  selectedBanner: {
    backgroundColor: COLORS.green[50],
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10,
  },
  selectedBannerText: { fontSize: 13, color: COLORS.green.dark, fontWeight: '600' },
  confirmBtn: {
    height: 54, backgroundColor: COLORS.green.main,
    borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.green.main, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
  },
  confirmBtnGray: { backgroundColor: '#9DB0A0', shadowOpacity: 0 },
  confirmBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
