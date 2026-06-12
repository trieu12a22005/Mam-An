import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Platform, ActivityIndicator, Animated,
  Modal, Pressable, Image
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { AppText as Text } from '../src/components/common/AppText';
import { COLORS } from '../src/constants/colors';
import { fetchCalmMusicTracks, CalmMusicTrack, fetchMyPoints, unlockTrack } from '../src/api/calmMusicApi';
import { Alert } from 'react-native';
import { calmSessionStore } from '../src/store/calmSessionStore';
import { ThemedScreen } from '../src/components/theme/ThemedScreen';
import { useTimeTheme } from '../src/contexts/TimeThemeContext';

const MASCOT_IMAGES = {
  thinking: require('../assets/thinking.png'),
  happy: require('../assets/happy.png'),
  wow: require('../assets/wow.png'),
  boring: require('../assets/boring.png'),
};

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
  const { colors } = useTimeTheme();
  const insets = useSafeAreaInsets();
  const [tracks, setTracks] = useState<CalmMusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [selectedTrack, setSelectedTrack] = useState<CalmMusicTrack | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Điểm tích lũy
  const [availablePoints, setAvailablePoints] = useState(0);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [maxRedeemSongs, setMaxRedeemSongs] = useState(0);
  const [isUnlocking, setIsUnlocking] = useState<string | null>(null);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    type: 'error' | 'confirm' | 'success';
    title: string;
    message: string;
    mascot?: 'thinking' | 'happy' | 'wow' | 'boring';
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    visible: false,
    type: 'error',
    title: '',
    message: '',
  });

  // Waveform animation
  const bars = useRef([...Array(5)].map(() => new Animated.Value(0.3))).current;
  const waveAnim = useRef<Animated.CompositeAnimation | null>(null);

  // Load tracks
  useEffect(() => {
    fetchCalmMusicTracks()
      .then(setTracks)
      .catch(console.error)
      .finally(() => setIsLoading(false));
    // Tải điểm của user
    fetchMyPoints()
      .then((p) => {
        setAvailablePoints(p.availablePoints);
        setUnlockedCount(p.unlockedCount);
        setMaxRedeemSongs(p.maxRedeemSongs);
      })
      .catch(() => {});
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
    if (!track.isUnlocked) return; // Chưa unlock → không chọn được
    setSelectedTrack(prev => prev?.id === track.id ? null : track);
  }, []);

  // Mở khóa bài hát bằng điểm
  const handleUnlock = useCallback((track: CalmMusicTrack) => {
    if (availablePoints < track.pointCost) {
      setModalConfig({
        visible: true,
        type: 'error',
        title: 'Chưa đủ điểm rồi! 🌱',
        message: `Bài "${track.titleVi}" cần ${track.pointCost} điểm.\nĐiểm của bạn hiện tại: ${availablePoints} ⭐\n\nHãy chăm cây thêm để tích lũy điểm nhé! 🪴`,
        mascot: 'thinking',
        confirmText: 'Được rồi!',
        onConfirm: () => setModalConfig(prev => ({ ...prev, visible: false }))
      });
      return;
    }

    setModalConfig({
      visible: true,
      type: 'confirm',
      title: 'Mở khóa bài hát 🔓',
      message: `Mầm An muốn dùng ${track.pointCost} ⭐ điểm để mở khóa:\n\n🎵 "${track.titleVi}"\n\nSau khi mở khóa bạn còn ${availablePoints - track.pointCost} điểm.`,
      mascot: 'wow',
      confirmText: '✨ Mở khóa ngay!',
      cancelText: 'Thôi để sau',
      onConfirm: async () => {
        setModalConfig(prev => ({ ...prev, visible: false }));
        setIsUnlocking(track.id);
        try {
          const result = await unlockTrack(track.id);
          setAvailablePoints(result.remainingPoints);
          setUnlockedCount(prev => prev + 1);
          setTracks(prev => prev.map(t =>
            t.id === track.id ? { ...t, isUnlocked: true } : t
          ));
          setModalConfig({
            visible: true,
            type: 'success',
            title: '🎉 Mở khóa thành công!',
            message: `Tuyệt vời! Bạn đã mở khóa:\n🎵 "${track.titleVi}"\n\nCòn lại: ${result.remainingPoints} ⭐ điểm\n\nHãy tận hưởng khoảnh khắc yên tĩnh nhé! 🌸`,
            mascot: 'happy',
            confirmText: 'Cảm ơn Mầm An! 💚',
            onConfirm: () => setModalConfig(prev => ({ ...prev, visible: false }))
          });
        } catch (e: any) {
          const msg = e?.response?.data?.message ?? e.message ?? '';
          let friendlyMsg = 'Mầm An gặp sự cố nhỏ, bạn thử lại sau nhé!';
          let mascotType: 'thinking' | 'boring' = 'thinking';
          
          if (msg.includes('đủ điểm') || msg.includes('cần')) {
            friendlyMsg = `Bạn cần thêm điểm để mở khóa bài này.\n\nHãy chăm cây thêm để tích lũy điểm nhé! 🪴`;
          } else if (msg.includes('tối đa') || msg.includes('giới hạn')) {
            friendlyMsg = `Gói hiện tại của bạn đã đạt giới hạn mở khóa.\n\nNâng cấp gói để mở thêm nhiều bài hơn nhé! 🌻`;
            mascotType = 'boring';
          } else if (msg.includes('đã mở')) {
            friendlyMsg = `Bài hát này bạn đã mở khóa rồi! 🎵`;
          } else if (msg.includes('404') || msg.includes('tìm thấy')) {
            friendlyMsg = `Mầm An không tìm thấy bài hát này, thử tải lại danh sách nhé! 🔄`;
          }
          
          setModalConfig({
            visible: true,
            type: 'error',
            title: '🌿 Ối, có gì đó sai sai!',
            message: friendlyMsg,
            mascot: mascotType,
            confirmText: 'OK, mình hiểu rồi!',
            onConfirm: () => setModalConfig(prev => ({ ...prev, visible: false }))
          });
        } finally {
          setIsUnlocking(null);
        }
      }
    });
  }, [availablePoints]);

  // Xác nhận bắt đầu phiên
  const handleConfirm = () => {
    stopPreviewCountdown();
    setPreviewingId(null);

    calmSessionStore.setTrack(selectedTrack);
    calmSessionStore.confirm();
    // zen-setup dùng router.replace nên stack chỉ còn calm-space → music-select
    // → back 1 lần là về calm-space
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
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.surfaceSoft }]} onPress={() => router.back()}>
          <Text style={[styles.backIcon, { color: colors.primary }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Chọn nhạc nền 🎵</Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>Nhấn icon để nghe thử · nhấn hàng để chọn</Text>
        </View>
        {/* Điểm tích lũy */}
        <View style={[styles.pointsBadge, { backgroundColor: colors.primarySoft }]}>
          <Text style={[styles.pointsText, { color: colors.primary }]}>⭐ {availablePoints}</Text>
        </View>
      </View>

      {/* Thông tin giới hạn gói */}
      {maxRedeemSongs > 0 && (
        <View style={[styles.limitBar, { backgroundColor: colors.surfaceSoft }]}>
          <Text style={[styles.limitText, { color: colors.textMuted }]}>
            🔓 Đã mở: {unlockedCount}/{maxRedeemSongs} bài · Còn: {availablePoints} điểm
          </Text>
        </View>
      )}

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {(['ALL', 'INSTRUMENTAL', 'LYRICS'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.tab, { backgroundColor: colors.surfaceSoft }, filter === f && { backgroundColor: colors.primary }]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.tabText, { color: colors.textMuted }, filter === f && styles.tabTextActive]}>
              {f === 'ALL' ? 'Tất cả' : f === 'INSTRUMENTAL' ? '🎹 Không lời' : '🎤 Có lời'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Track list */}
      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Đang tải danh sách nhạc…</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Không nhạc option */}
          <TouchableOpacity
            style={[styles.trackRow, { borderColor: 'transparent' }, !selectedTrack && { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}
            onPress={() => setSelectedTrack(null)}
            activeOpacity={0.75}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.surfaceSoft }, !selectedTrack && { backgroundColor: colors.primarySoft }]}>
              <Text style={styles.emoji}>🔇</Text>
            </View>
            <View style={styles.trackInfo}>
              <Text style={[styles.trackTitle, { color: colors.text }]}>Không nhạc</Text>
              <Text style={[styles.trackSub, { color: colors.textMuted }]}>Tận hưởng sự yên tĩnh</Text>
            </View>
            {!selectedTrack && (
              <View style={styles.checkBadge}>
                <Text style={styles.checkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.separator}>
            <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.separatorText, { color: colors.textMuted }]}>Danh sách nhạc</Text>
            <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
          </View>

          {filteredTracks.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
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
                  <View style={[
                    styles.trackRow, 
                    { borderColor: 'transparent' },
                    isSelected && { backgroundColor: colors.primarySoft, borderColor: colors.primary }
                  ]}>
                    {/* Icon — nhấn để preview */}
                    <TouchableOpacity
                      style={[
                        styles.iconBox,
                        { backgroundColor: colors.surfaceSoft },
                        isSelected && { backgroundColor: colors.primarySoft },
                        isPreviewing && { backgroundColor: colors.primary },
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
                      <Text style={[styles.trackTitle, { color: colors.text }]} numberOfLines={2}>{track.titleVi}</Text>
                      <View style={styles.badgeRow}>
                        <View style={[styles.badge, { backgroundColor: colors.surfaceSoft }]}>
                          <Text style={[styles.badgeText, { color: colors.textMuted }]}>
                            {CATEGORY_LABELS[track.category] ?? track.category}
                          </Text>
                        </View>
                        <View style={[styles.badge, track.hasLyrics ? styles.badgeLyrics : styles.badgeInstr]}>
                          <Text style={[styles.badgeText, track.hasLyrics ? { color: '#B45309' } : { color: '#0369A1' }]}>
                            {track.hasLyrics ? 'Có lời' : 'Không lời'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Action */}
                    {isSelected ? (
                      <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.checkText}>✓</Text>
                      </View>
                    ) : !track.isUnlocked ? (
                      // Bài chưa unlock — hiện nút "Mở khóa X đ"
                      <TouchableOpacity
                        style={[styles.unlockBtn, { borderColor: colors.primary }]}
                        onPress={() => handleUnlock(track)}
                        disabled={isUnlocking === track.id}
                      >
                        {isUnlocking === track.id ? (
                          <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                          <Text style={[styles.unlockBtnText, { color: colors.primary }]}>🔓 {track.pointCost}đ</Text>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.selectBtn, { backgroundColor: colors.surfaceSoft }]}
                        onPress={() => handleSelectTrack(track)}
                      >
                        <Text style={[styles.selectBtnText, { color: colors.textMuted }]}>Chọn</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Preview progress bar */}
                  {isPreviewing && (
                    <View style={[styles.previewBar, { backgroundColor: colors.surfaceSoft }]}>
                      <View style={[
                        styles.previewFill,
                        { backgroundColor: colors.primary, width: `${(countdown / 60) * 100}%` as any },
                      ]} />
                      <View style={styles.previewLabels}>
                        <Text style={[styles.previewLabelText, { color: colors.text }]}>🎧 Đang nghe thử</Text>
                        <Text style={[styles.previewLabelText, { color: colors.textMuted }]}>{countdown}s còn lại</Text>
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
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom + 16, 32) }]}>
        {selectedTrack && (
          <View style={[styles.selectedBanner, { backgroundColor: colors.surfaceSoft }]}>
            <Text style={[styles.selectedBannerText, { color: colors.primary }]} numberOfLines={1}>
              🎵  {selectedTrack.titleVi}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: colors.primary }, !selectedTrack && styles.confirmBtnGray]}
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

      {/* ── Mascot Modal ── */}
      <Modal transparent animationType="fade" visible={modalConfig.visible} onRequestClose={() => setModalConfig(prev => ({ ...prev, visible: false }))}>
        <Pressable style={styles.modalBackdrop} onPress={() => setModalConfig(prev => ({ ...prev, visible: false }))}>
          <Pressable style={[styles.modalCard, { backgroundColor: colors.surface }]} onPress={() => {}}>
            {/* Mascot */}
            {modalConfig.mascot && (
              <View style={[styles.mascotWrap, { backgroundColor: colors.surfaceSoft }]}>
                <Image
                  source={MASCOT_IMAGES[modalConfig.mascot]}
                  style={styles.mascotImg}
                  resizeMode="contain"
                />
              </View>
            )}

            <Text style={[styles.modalTitle, { color: colors.text }]}>{modalConfig.title}</Text>
            <Text style={[styles.modalMessage, { color: colors.text }]}>{modalConfig.message}</Text>

            <View style={styles.modalActions}>
              {modalConfig.cancelText && (
                <TouchableOpacity
                  style={[styles.modalBtnCancel, { backgroundColor: colors.surfaceSoft }]}
                  onPress={() => setModalConfig(prev => ({ ...prev, visible: false }))}
                >
                  <Text style={[styles.modalBtnCancelText, { color: colors.textMuted }]}>{modalConfig.cancelText}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.modalBtnConfirm}
                onPress={() => modalConfig.onConfirm ? modalConfig.onConfirm() : setModalConfig(prev => ({ ...prev, visible: false }))}
              >
                <Text style={styles.modalBtnConfirmText}>{modalConfig.confirmText || 'OK'}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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

  // Points & Unlock
  pointsBadge: {
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
    alignItems: 'center', justifyContent: 'center',
  },
  pointsText: { fontSize: 13, fontWeight: '700' },
  limitBar: {
    marginHorizontal: 16, marginBottom: 6,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
  },
  limitText: { fontSize: 12, fontWeight: '500', textAlign: 'center' },
  unlockBtn: {
    borderWidth: 1.5, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6,
    alignItems: 'center', justifyContent: 'center',
    minWidth: 72,
  },
  unlockBtnText: { fontSize: 11, fontWeight: '700' },

  // Modal
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%', borderRadius: 24,
    padding: 24, alignItems: 'center',
    elevation: 10, shadowColor: '#000',
    shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: 10 },
  },
  mascotWrap: {
    width: 100, height: 100,
    marginTop: -50, marginBottom: 16,
    borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
    elevation: 5, shadowColor: '#000',
    shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  mascotImg: { width: 90, height: 90 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  modalMessage: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  modalActions: { flexDirection: 'row', gap: 12, width: '100%' },
  modalBtnCancel: {
    flex: 1, height: 48, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  modalBtnCancelText: { fontSize: 15, fontWeight: '600' },
  modalBtnConfirm: {
    flex: 1, height: 48, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.green.main,
  },
  modalBtnConfirmText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
