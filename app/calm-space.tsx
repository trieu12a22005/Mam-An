import { AppText as Text } from '../src/components/common/AppText';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Platform, Modal } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { FocusSessionOption } from '../src/types/focusSession.type';
import { FOCUS_SESSION_OPTIONS, getFocusSessionEmoji } from '../src/constants/focusSessions';
import { COLORS } from '../src/constants/colors';
import { useFocusSession } from '../src/hooks/useFocusSession';
import { useCalmMusic } from '../src/hooks/useCalmMusic';
import { useVirtualPlant } from '../src/hooks/usePlant';
import { useZenPlant } from '../src/hooks/useZenPlant';
import { FocusSessionCard } from '../src/components/focus/FocusSessionCard';
import { GrowingPlant } from '../src/components/focus/GrowingPlant';
import { FocusTimer } from '../src/components/focus/FocusTimer';
import { FocusCompleteModal } from '../src/components/focus/FocusCompleteModal';
import { ThemedScreen } from '../src/components/theme/ThemedScreen';
import { useTimeTheme } from '../src/contexts/TimeThemeContext';
import { calmSessionStore } from '../src/store/calmSessionStore';
import { backgroundMusicControl } from '../src/utils/backgroundMusicControl';

export default function CalmSpace() {
  const {
    selectedOption, selectedDuration, status,
    remainingSeconds, completedSeconds, progress,
    startSession, pauseSession, resumeSession, cancelSession, resetSession,
  } = useFocusSession();

  const {
    selectedTrack, volume, isPlaying,
    selectTrack, togglePlayPause, stopAndClear, changeVolume,
  } = useCalmMusic();

  const { colors, isNight } = useTimeTheme();

  const { plant, addResource } = useVirtualPlant();
  const { selectedFlowerType, flowerTypes, selectZenPlant } = useZenPlant();

  const [activeType, setActiveType] = useState<string | null>(null);
  const [pendingDuration, setPendingDuration] = useState<Record<string, number>>({});
  const [showExitModal, setShowExitModal] = useState(false);

  // Tắt nhạc nền ngay khi vào Vườn Yên
  useEffect(() => {
    backgroundMusicControl.pause();
    return () => {
      // Khi rời khỏi màn hình mà không đang phát calm music, khôi phục nhạc nền
      backgroundMusicControl.resume();
    };
  }, []);

  // ── Reward ──────────────────────────────────────────────────────────────────
  const actualReward = useCallback(() => {
    if (!selectedOption) return { amount: 0, growth: 0 };
    const minDuration = selectedOption.durations[0] || 60;
    const ratio = selectedDuration > 0 ? (selectedDuration / minDuration) : 1;
    const scaledAmount = Math.max(1, Math.floor(selectedOption.rewardAmount * ratio));
    const scaledGrowth = Math.max(1, Math.floor(selectedOption.growthReward * ratio));
    if (status === 'COMPLETED') return { amount: scaledAmount, growth: scaledGrowth };
    if (status === 'PARTIAL') return {
      amount: Math.max(1, Math.floor(scaledAmount / 2)),
      growth: Math.max(1, Math.floor(scaledGrowth / 2)),
    };
    return { amount: 0, growth: 0 };
  }, [selectedOption, selectedDuration, status]);

  useEffect(() => {
    if (status === 'COMPLETED' || status === 'PARTIAL') {
      const { amount } = actualReward();
      if (selectedOption && amount > 0) addResource(selectedOption.rewardResource, amount);
    }
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Dừng nhạc khi session kết thúc
  useEffect(() => {
    if (status === 'COMPLETED' || status === 'CANCELLED') stopAndClear();
  }, [status, stopAndClear]);

  const statusRef = useRef(status);
  statusRef.current = status;

  // Ref lưu các hàm mới nhất để useFocusEffect dùng mà không cần re-create
  const pauseRef = useRef(pauseSession);
  const selectTrackRef = useRef(selectTrack);
  const startSessionRef = useRef(startSession);
  const selectZenPlantRef = useRef(selectZenPlant);
  useEffect(() => { pauseRef.current = pauseSession; }, [pauseSession]);
  useEffect(() => { selectTrackRef.current = selectTrack; }, [selectTrack]);
  useEffect(() => { startSessionRef.current = startSession; }, [startSession]);
  useEffect(() => { selectZenPlantRef.current = selectZenPlant; }, [selectZenPlant]);

  useFocusEffect(useCallback(() => {
    // Khi quay lại từ music-select: kiểm tra session đã xác nhận chưa
    const session = calmSessionStore.get();
    if (session?.confirmed) {
      const option = FOCUS_SESSION_OPTIONS.find(o => o.type === session.option.type) ?? session.option;
      if (session.zenPlantId) selectZenPlantRef.current(session.zenPlantId);
      selectTrackRef.current(session.selectedTrack);
      startSessionRef.current(option, session.duration);
      setActiveType(null);
      calmSessionStore.clear();
    }

    return () => {
      // Chỉ pause khi THẬT SỰ rời khỏi màn hình (không phải khi deps thay đổi)
      if (statusRef.current === 'RUNNING') pauseRef.current();
    };
  // deps rỗng: effect chỉ setup 1 lần, cleanup chỉ fire khi unfocus thật
  }, []));

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleStart = (option: FocusSessionOption) => {
    const duration = pendingDuration[option.type] ?? option.durations[0]!;
    calmSessionStore.setPending(option, duration);
    // Đi qua zen-setup (chọn cây) trước, sau đó zen-setup → music-select
    router.push('/zen-setup' as any);
  };

  const handleGoHome = () => { resetSession(); router.back(); };
  const handleResume = () => { setShowExitModal(false); resumeSession(); };
  const handleBackPress = () => {
    if (status === 'RUNNING' || status === 'PAUSED') {
      if (status === 'RUNNING') pauseSession();
      setShowExitModal(true);
    } else {
      router.back();
    }
  };

  const isRunning = status === 'RUNNING' || status === 'PAUSED';
  const isFinished = status === 'COMPLETED' || status === 'PARTIAL' || status === 'CANCELLED';
  const reward = actualReward();
  const nightIntensity = selectedOption?.type === 'STUDY' ? 'low' : 'normal';

  // ── Volume slider ─────────────────────────────────────────────────────────
  const [sliderWidth, setSliderWidth] = useState(1);
  const handleSliderTouch = useCallback((x: number) => {
    changeVolume(Math.max(0, Math.min(1, x / sliderWidth)));
  }, [sliderWidth, changeVolume]);

  // ── Step 2: Timer screen ──────────────────────────────────────────────────
  if (isRunning) {
    return (
      <ThemedScreen showNightEffects nightEffectIntensity={nightIntensity} avoidKeyboard={false}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.runHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBackPress}>
            <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <View style={styles.modeLabelContainer}>
            <View style={[styles.modeLabelPill, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
              <Text style={styles.modeLabelEmoji}>{selectedOption ? getFocusSessionEmoji(selectedOption.type) : '🌿'}</Text>
              <Text style={[styles.modeLabel, { color: colors.text }]} numberOfLines={1}>{selectedOption?.label}</Text>
            </View>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.runBody}>
          <GrowingPlant progress={progress} status={'GROWING'} flowerType={selectedFlowerType} />
          <FocusTimer
            remainingSeconds={remainingSeconds}
            totalSeconds={selectedDuration}
            progress={progress}
            sessionType={selectedOption!.type}
            isPaused={status === 'PAUSED'}
          />
        </View>

        {/* Mini Music Bar */}
        {selectedTrack && (
          <View style={styles.musicBar}>
            <TouchableOpacity style={styles.musicBarRow} onPress={togglePlayPause} activeOpacity={0.8}>
              <Text style={styles.musicBarIcon}>{isPlaying ? '🎵' : '⏸'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.musicBarTitle} numberOfLines={1}>{selectedTrack.titleVi}</Text>
                <Text style={styles.musicBarSub}>{selectedTrack.hasLyrics ? 'Có lời' : 'Không lời'} · {selectedTrack.category}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/music-select' as any)} style={styles.changeMusicBtn}>
                <RefreshCw size={18} color={COLORS.green.dark} />
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Volume slider */}
            <View style={styles.volumeRow}>
              <Text style={styles.volumeIcon}>{volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}</Text>
              <View
                style={styles.sliderTrack}
                onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(e) => handleSliderTouch(e.nativeEvent.locationX)}
                onResponderMove={(e) => handleSliderTouch(e.nativeEvent.locationX)}
              >
                <View style={[styles.sliderFill, { width: `${volume * 100}%` as any }]} pointerEvents="none" />
                <View style={[styles.sliderThumb, { left: `${Math.max(0, volume * 100 - 1)}%` as any }]} pointerEvents="none" />
              </View>
              <Text style={styles.volumeValue}>{Math.round(volume * 100)}%</Text>
            </View>
          </View>
        )}

        <View style={styles.runControls}>
          <TouchableOpacity style={[styles.ctrlBtn, styles.ctrlBtnPause]} onPress={status === 'RUNNING' ? pauseSession : resumeSession}>
            <Text style={styles.ctrlBtnPauseText}>{status === 'RUNNING' ? 'Tạm dừng  ⏸' : 'Tiếp tục  ▶'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.ctrlBtn, styles.ctrlBtnEnd]} onPress={() => { if (status === 'RUNNING') pauseSession(); setShowExitModal(true); }}>
            <Text style={styles.ctrlBtnEndText}>Kết thúc</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showExitModal} transparent animationType="fade">
          <View style={styles.confirmOverlay}>
            <View style={styles.confirmSheet}>
              <Text style={styles.confirmEmoji}>🌱</Text>
              <Text style={styles.confirmTitle}>Bạn muốn rời phiên này?</Text>
              <Text style={styles.confirmMsg}>Khoảng thời gian bạn đã ở cùng cây vẫn đáng quý.</Text>
              <TouchableOpacity style={styles.confirmStay} onPress={handleResume}>
                <Text style={styles.confirmStayText}>Ở lại</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmLeave} onPress={() => { setShowExitModal(false); cancelSession(); }}>
                <Text style={styles.confirmLeaveText}>Kết thúc phiên</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ThemedScreen>
    );
  }

  // ── Step 1: Chọn chế độ ──────────────────────────────────────────────────
  return (
    <ThemedScreen showNightEffects nightEffectIntensity="normal">
      <StatusBar barStyle="dark-content" />
      <FocusCompleteModal visible={isFinished} status={status as any} option={selectedOption} actualRewardAmount={reward.amount} actualGrowthReward={reward.growth} plant={plant} onGoHome={handleGoHome} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
          <Text style={[styles.backBtnText, { color: colors.text }]}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Góc yên 🌿</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.intro, isNight && { color: colors.textMuted }]}>
          Thở, thư giãn hoặc học cùng Mầm An.{'\n'}Cây sẽ lớn lên theo từng phút bạn dành cho bản thân.
        </Text>

        {/* Cây đang chọn */}
        <TouchableOpacity
          style={styles.zenPlantSelector}
          onPress={() => {
            // Cho phép đổi cây ngay ở đây mà không cần bắt đầu session
            router.push('/zen-setup' as any);
          }}
          activeOpacity={0.75}
        >
          <Text style={styles.zenPlantEmoji}>🌿</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.zenPlantLabel}>Cây thư giãn đang chọn</Text>
            <Text style={styles.zenPlantName}>
              {selectedFlowerType?.name ?? 'Nhấn để chọn cây'}
            </Text>
          </View>
          <Text style={styles.zenPlantChange}>Đổi ›</Text>
        </TouchableOpacity>

        {FOCUS_SESSION_OPTIONS.map((opt) => (
          <FocusSessionCard
            key={opt.type}
            option={opt}
            isSelected={activeType === opt.type}
            selectedDuration={pendingDuration[opt.type] ?? 0}
            onSelectDuration={(d) => { setActiveType(opt.type); setPendingDuration((p) => ({ ...p, [opt.type]: d })); }}
            onStart={() => handleStart(opt)}
          />
        ))}
        <View style={{ height: 48 }} />
      </ScrollView>
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  zenPlantSelector: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.green[50], borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    marginBottom: 12, marginTop: 4,
    borderWidth: 1, borderColor: COLORS.green[200],
  },
  zenPlantEmoji: { fontSize: 22 },
  zenPlantLabel: { fontSize: 11, color: COLORS.text.muted, marginBottom: 2 },
  zenPlantName: { fontSize: 15, fontWeight: '600', color: COLORS.green.dark },
  zenPlantChange: { fontSize: 18, color: COLORS.green.main, fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, justifyContent: 'space-between' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingRight: 8 },
  backIcon: { fontSize: 18, color: COLORS.green.dark, fontWeight: '400' },
  backBtnText: { fontSize: 14, color: COLORS.green.dark, fontWeight: '600' },
  screenTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text.primary },
  content: { padding: 20, gap: 16 },
  intro: { fontSize: 14, color: COLORS.text.secondary, lineHeight: 24, textAlign: 'center', marginBottom: 4 },

  runHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 12 },
  modeLabelContainer: { flex: 1, alignItems: 'center' },
  modeLabelPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
  },
  modeLabelEmoji: { fontSize: 16 },
  modeLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text.primary },
  musicBtn: { alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.green[50], borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, minWidth: 72, gap: 2 },
  musicIcon: { fontSize: 18 },
  musicLabel: { fontSize: 10, color: COLORS.text.muted, fontWeight: '500' },

  runBody: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, paddingHorizontal: 24, paddingBottom: 4 },

  musicBar: { marginHorizontal: 20, backgroundColor: COLORS.green[50], borderRadius: 16, padding: 12, borderWidth: 1, borderColor: COLORS.green[200], gap: 10, marginBottom: 4 },
  musicBarRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  musicBarIcon: { fontSize: 18 },
  musicBarTitle: { fontSize: 13, fontWeight: '600', color: COLORS.text.primary },
  musicBarSub: { fontSize: 11, color: COLORS.text.muted, marginTop: 1 },
  changeMusicBtn: { backgroundColor: COLORS.green[100], borderRadius: 20, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  volumeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  volumeIcon: { fontSize: 16 },
  sliderTrack: { flex: 1, height: 6, backgroundColor: COLORS.green[100], borderRadius: 3, position: 'relative', overflow: 'visible' },
  sliderFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: COLORS.green.main, borderRadius: 3 },
  sliderThumb: { position: 'absolute', top: -5, width: 16, height: 16, backgroundColor: COLORS.green.main, borderRadius: 8, borderWidth: 2, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2, elevation: 2 },
  volumeValue: { fontSize: 11, color: COLORS.text.muted, minWidth: 32, textAlign: 'right' },

  runControls: { flexDirection: 'row', paddingHorizontal: 24, paddingBottom: Platform.OS === 'android' ? 64 : 48, paddingTop: 12, gap: 12 },
  ctrlBtn: { flex: 1, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  ctrlBtnPause: { backgroundColor: COLORS.green[100] },
  ctrlBtnPauseText: { color: COLORS.green.dark, fontWeight: '700', fontSize: 14 },
  ctrlBtnEnd: { borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  ctrlBtnEndText: { color: COLORS.text.muted, fontSize: 14, fontWeight: '500' },

  confirmOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 28 },
  confirmSheet: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 28, width: '100%', alignItems: 'center', gap: 12 },
  confirmEmoji: { fontSize: 40 },
  confirmTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text.primary, textAlign: 'center' },
  confirmMsg: { fontSize: 13, color: COLORS.text.secondary, textAlign: 'center', lineHeight: 22 },
  confirmStay: { width: '100%', height: 48, backgroundColor: COLORS.green.main, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  confirmStayText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  confirmLeave: { width: '100%', height: 44, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  confirmLeaveText: { color: COLORS.text.muted, fontSize: 14, fontWeight: '500' },
});
