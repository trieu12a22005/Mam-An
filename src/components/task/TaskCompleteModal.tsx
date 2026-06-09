import { AppText as Text } from '../common/AppText';
import React, { useState, useCallback, useRef } from 'react';
import {
  Modal, View, TouchableOpacity, StyleSheet,
  Image, TextInput, Switch, ActivityIndicator,
  ScrollView, KeyboardAvoidingView, Platform, Keyboard, Animated,
} from 'react-native';
import { CareTask, SelectedImage } from '../../types/task.type';
import { COLORS } from '../../constants/colors';
import { PlantResourceType } from '../../types/plant.type';
import { takePhotoWithCamera, pickImageFromLibrary } from '../../services/imagePicker.service';

// ── Resource emoji map ────────────────────────────────────────────────────────
const RESOURCE_EMOJI: Record<string, string> = {
  WATER: '💧', SUNLIGHT: '☀️', FERTILIZER: '🌿',
  AIR: '🌬️', LOVE: '💚', DEW: '✨',
};
const RESOURCE_LABEL: Record<string, string> = {
  WATER: 'Nước', SUNLIGHT: 'Ánh sáng', FERTILIZER: 'Phân bón',
  AIR: 'Không khí', LOVE: 'Yêu thương', DEW: 'Sương mai',
};
// ── Reward messages ───────────────────────────────────────────────────────────
const REWARD_MESSAGES: Record<string, string> = {
  WATER:      'Cây nhận được một giọt nước mát lành từ bạn 💧',
  SUNLIGHT:   'Cây nhận được một chút ánh sáng dịu dàng từ bạn ☀️',
  FERTILIZER: 'Cây có thêm dinh dưỡng để lớn lên 🌱',
  AIR:        'Một làn gió nhẹ vừa ghé qua khu vườn 🍃',
  LOVE:       'Cây nhận được một chút yêu thương từ bạn 💚',
  DEW:        'Cây giữ lại giọt sương dịu dàng của hôm nay 🌿',
};

// ── Types ─────────────────────────────────────────────────────────────────────
export interface TaskCompleteResult {
  task: CareTask;
  note?: string;
  photo?: SelectedImage;
  shareToCommunity?: boolean;
  visibility?: 'PUBLIC' | 'ANONYMOUS';
}

/** Dữ liệu bonus share trả về từ caller sau khi API xong */
export interface ShareBonusInfo {
  resourceType: PlantResourceType;
  bonusAmount: number;
}

interface Props {
  task: CareTask | null;
  visible: boolean;
  onClose: () => void;
  /** Được gọi khi user xác nhận hoàn thành — caller tự gọi API */
  onConfirm: (result: TaskCompleteResult) => Promise<ShareBonusInfo | void>;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const TaskCompleteModal: React.FC<Props> = ({ task, visible, onClose, onConfirm }) => {
  const [photo, setPhoto] = useState<SelectedImage | null>(null);
  const [note, setNote] = useState('');
  const [share, setShare] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const [success, setSuccess] = useState(false);
  const [shareBonus, setShareBonus] = useState<ShareBonusInfo | null>(null);
  const sharedRef = useRef(false); // Ghi nhớ trạng thái share khi submit
  const bonusPulse = useRef(new Animated.Value(1)).current;

  // Pulse animation cho bonus badge khi bật share
  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bonusPulse, { toValue: 1.06, duration: 600, useNativeDriver: true }),
        Animated.timing(bonusPulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      { iterations: 4 },
    ).start();
  }, [bonusPulse]);

  const reset = useCallback(() => {
    setPhoto(null);
    setNote('');
    setShare(false);
    setLoading(false);
    setErrorMsg('');
    setSuccess(false);
    setShareBonus(null);
  }, []);

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose();
  };

  const handlePickCamera = async () => {
    setErrorMsg('');
    const img = await takePhotoWithCamera();
    if (img) {
      setPhoto(img);
      // Tự động bật share và bắt animation để user thấy bonus
      setShare(true);
      setTimeout(() => startPulse(), 300);
    }
  };

  const handlePickLibrary = async () => {
    setErrorMsg('');
    const img = await pickImageFromLibrary();
    if (img) {
      setPhoto(img);
      setShare(true);
      setTimeout(() => startPulse(), 300);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setShare(false); // Rối share khi xóa ảnh vì backend yêu cầu có ảnh
  };

  const handleConfirm = async () => {
    if (!task) return;
    setErrorMsg('');

    if (task.verifyType === 'PHOTO_REQUIRED' && !photo) {
      setErrorMsg('Nhiệm vụ này cần một bức ảnh để hoàn thành nhé.');
      return;
    }

    setLoading(true);
    try {
      sharedRef.current = share;
      const bonusResult = await onConfirm({
        task,
        note: note.trim() || undefined,
        photo: photo ?? undefined,
        shareToCommunity: share,
        visibility: 'ANONYMOUS',
      });
      if (bonusResult) setShareBonus(bonusResult);
      setSuccess(true);
      // Tự đóng sau 2.8 giây (lâu hơn chút để user đọc bonus)
      setTimeout(() => {
        reset();
        onClose();
      }, share ? 3000 : 2000);
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!task) return null;

  console.log('[TaskCompleteModal] rendered | verifyType:', task.verifyType, '| visible:', visible);

  const needsPhoto = task.verifyType === 'PHOTO_REQUIRED' || task.verifyType === 'PHOTO_OPTIONAL';
  const photoRequired = task.verifyType === 'PHOTO_REQUIRED';
  const rewardMsg = REWARD_MESSAGES[task.rewardResource] ?? '';

  // ── Success state ──
  if (success) {
    const didShare = sharedRef.current;
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.successEmoji}>{didShare ? '🌻' : '🌱'}</Text>
            <Text style={styles.successTitle}>Nhiệm vụ đã hoàn thành!</Text>
            <Text style={styles.successMsg}>
              {didShare
                ? 'Khoảnh khắc nhỏ của bạn đã được gửi đến Vườn chung 🌻'
                : rewardMsg
              }
            </Text>
            {/* Bonus badge khi share thành công */}
            {didShare && shareBonus && (
              <View style={styles.bonusBadgeSuccess}>
                <Text style={styles.bonusBadgeSuccessIcon}>
                  {RESOURCE_EMOJI[shareBonus.resourceType] ?? '🎁'}
                </Text>
                <View>
                  <Text style={styles.bonusBadgeSuccessTitle}>Thưởng chia sẻ!</Text>
                  <Text style={styles.bonusBadgeSuccessText}>
                    +{shareBonus.bonusAmount} {RESOURCE_LABEL[shareBonus.resourceType] ?? shareBonus.resourceType}
                  </Text>
                </View>
              </View>
            )}
            {didShare && !shareBonus && (
              <View style={styles.bonusBadgeSuccess}>
                <Text style={styles.bonusBadgeSuccessIcon}>🎁</Text>
                <View>
                  <Text style={styles.bonusBadgeSuccessTitle}>Thưởng chia sẻ!</Text>
                  <Text style={styles.bonusBadgeSuccessText}>+5 tài nguyên đã được thêm vào cây</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  }

  // ── SELF_CONFIRM modal ──
  if (task.verifyType === 'SELF_CONFIRM') {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.title}>{task.title}</Text>
            <Text style={styles.subtitle}>
              Bạn đã hoàn thành nhiệm vụ này rồi chứ?{'\n'}Hãy xác nhận để nhận thưởng nhé 🌱
            </Text>
            {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
            <TouchableOpacity
              style={[styles.btnPrimary, loading && styles.btnDisabled]}
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnPrimaryText}>Hoàn thành ✓</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnGhost} onPress={handleClose} disabled={loading}>
              <Text style={styles.btnGhostText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // ── PHOTO_REQUIRED / PHOTO_OPTIONAL modal ──
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.kavWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Overlay trong suốt phía trên sheet */}
        <TouchableOpacity
          style={styles.overlayTop}
          activeOpacity={1}
          onPress={handleClose}
        />

        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={styles.sheet}>

            {/* ── Scrollable area: header + photo + note ── */}
            <ScrollView
              ref={scrollRef}
              style={styles.scrollArea}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="none"
              bounces={false}
              contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <Text style={styles.title}>
                  {photoRequired ? 'Lưu lại khoảnh khắc này 📷' : task.title}
                </Text>
                <Text style={styles.subtitle}>
                  {photoRequired
                    ? 'Nhiệm vụ này cần một bức ảnh nhỏ để hoàn thành.\nBạn không cần chụp mặt hoặc thông tin cá nhân.'
                    : 'Bạn có muốn thêm một bức ảnh kỷ niệm không?'}
                </Text>

                {/* Photo preview / picker */}
                {photo ? (
                  <View style={styles.previewWrap}>
                    <Image source={{ uri: photo.uri }} style={styles.preview} resizeMode="cover" />
                    <TouchableOpacity style={styles.changePhoto} onPress={handleRemovePhoto}>
                      <Text style={styles.changePhotoText}>✕ Xóa ảnh</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.pickerRow}>
                    <TouchableOpacity style={styles.pickerBtn} onPress={handlePickCamera}>
                      <Text style={styles.pickerIcon}>📷</Text>
                      <Text style={styles.pickerLabel}>Chụp ảnh</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.pickerBtn} onPress={handlePickLibrary}>
                      <Text style={styles.pickerIcon}>🖼️</Text>
                      <Text style={styles.pickerLabel}>Thư viện</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Note input */}
                <TextInput
                  style={styles.noteInput}
                  placeholder="Viết một dòng ngắn nếu bạn muốn..."
                  placeholderTextColor={COLORS.text.muted}
                  value={note}
                  onChangeText={(t) => setNote(t.slice(0, 300))}
                  multiline
                  maxLength={300}
                  scrollEnabled={false}
                  onFocus={() =>
                    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 350)
                  }
                />
                <Text style={styles.noteCount}>{note.length}/300</Text>
            </ScrollView>

            {/* ── Sticky footer: luôn bám dưới, không scroll ── */}
            <View style={styles.stickyFooter}>
                {/* Toggle chia sẻ Vườn chung — luôn hiển thị */}
                <View style={[styles.shareRow, share && styles.shareRowActive]}>
                  <View style={styles.flex}>
                    <Text style={styles.shareLabel}>Chia sẻ lên Vườn chung 🌻</Text>
                    <Text style={styles.shareHint}>Ẩn danh — tên bạn sẽ không hiển thị</Text>
                    {photo ? (
                      <Animated.View
                        style={[
                          styles.shareBonusBadge,
                          { transform: [{ scale: share ? bonusPulse : 1 }] },
                        ]}
                      >
                        <Text style={styles.shareBonusEmoji}>
                          {RESOURCE_EMOJI[task.rewardResource] ?? '🎁'}
                        </Text>
                        <Text style={styles.shareBonusText}>
                          +5 {RESOURCE_LABEL[task.rewardResource] ?? 'tài nguyên'} khi chia sẻ
                        </Text>
                      </Animated.View>
                    ) : (
                      <Animated.View style={styles.shareBonusBadgeDisabled}>
                        <Text style={styles.shareBonusEmoji}>📷</Text>
                        <Text style={styles.shareBonusTextDisabled}>
                          Thêm ảnh để mở khóa +5 thưởng chia sẻ
                        </Text>
                      </Animated.View>
                    )}
                  </View>
                  <Switch
                    value={share}
                    onValueChange={(v) => {
                      if (!photo && v) return;
                      setShare(v);
                      if (v && photo) startPulse();
                    }}
                    trackColor={{ false: '#ddd', true: COLORS.green.main }}
                    thumbColor="#fff"
                    disabled={!photo}
                  />
                </View>

                {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

                <TouchableOpacity
                  style={[styles.btnPrimary, loading && styles.btnDisabled]}
                  onPress={handleConfirm}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.btnPrimaryText}>Hoàn thành nhiệm vụ ✓</Text>
                  }
                </TouchableOpacity>

                {task.verifyType === 'PHOTO_OPTIONAL' && !photo && (
                  <TouchableOpacity
                    style={styles.btnGhost}
                    onPress={async () => {
                      setLoading(true);
                      try {
                        await onConfirm({ task, note: note.trim() || undefined });
                        setSuccess(true);
                        setTimeout(() => { reset(); onClose(); }, 1500);
                      } catch (err: any) {
                        setErrorMsg(err?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.');
                      } finally { setLoading(false); }
                    }}
                    disabled={loading}
                  >
                    <Text style={styles.btnGhostText}>Hoàn thành không cần ảnh</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.btnGhost} onPress={handleClose} disabled={loading}>
                  <Text style={styles.btnGhostText}>Hủy</Text>
                </TouchableOpacity>
            </View>

          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Layout wrapper
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  kavWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayTop: {
    flex: 1, // chiếm phần trên (tap để đóng)
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
  },
  scrollArea: {
    flexShrink: 1, // co lại khi bàn phím lên
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 8,
    gap: 16,
  },
  stickyFooter: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 28,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Photo picker
  pickerRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  pickerBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.background,
  },
  pickerIcon: { fontSize: 28 },
  pickerLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text.secondary },
  // Preview
  previewWrap: { borderRadius: 16, overflow: 'hidden' },
  preview: { width: '100%', height: 200 },
  changePhoto: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12,
  },
  changePhotoText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  // Note
  noteInput: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  noteCount: { fontSize: 11, color: COLORS.text.muted, textAlign: 'right' },
  // Share
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.green[50],
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  shareRowActive: {
    borderColor: COLORS.green.main + '60',
    backgroundColor: COLORS.green[50],
  },
  flex: { flex: 1 },
  shareLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary },
  shareHint: { fontSize: 12, color: COLORS.text.muted, marginTop: 2 },
  // Share bonus badge (inline)
  shareBonusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FFD54F',
  },
  shareBonusEmoji: { fontSize: 14 },
  shareBonusText: { fontSize: 12, fontWeight: '700', color: '#E65100' },
  // Disabled badge (chưa có ảnh)
  shareBonusBadgeDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  shareBonusTextDisabled: { fontSize: 12, fontWeight: '600', color: '#9E9E9E' },
  // Buttons
  btnPrimary: {
    backgroundColor: COLORS.green.main,
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnDisabled: { opacity: 0.6 },
  btnGhost: {
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnGhostText: { color: COLORS.text.muted, fontSize: 14, fontWeight: '500' },
  // Error
  error: { fontSize: 13, color: COLORS.danger, textAlign: 'center' },
  // Success
  successEmoji: { fontSize: 48, textAlign: 'center' },
  successTitle: {
    fontSize: 20, fontWeight: '700',
    color: COLORS.text.primary, textAlign: 'center',
  },
  successMsg: {
    fontSize: 14, color: COLORS.text.secondary,
    textAlign: 'center', lineHeight: 22,
  },
  // Success bonus badge
  bonusBadgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF3E0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#FFB74D',
    alignSelf: 'stretch',
  },
  bonusBadgeSuccessIcon: { fontSize: 28 },
  bonusBadgeSuccessTitle: {
    fontSize: 12, fontWeight: '700', color: '#E65100',
  },
  bonusBadgeSuccessText: {
    fontSize: 15, fontWeight: '800', color: '#BF360C',
  },
});
