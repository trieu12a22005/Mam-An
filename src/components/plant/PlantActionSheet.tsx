import { AppText as Text } from '../common/AppText';
import React, { useRef, useState, useEffect } from 'react';
import {
  Modal, View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback,
  Animated, Text as RNText, Image,
} from 'react-native';
import { PlantResourceType } from '../../types/plant.type';
import { RESOURCES } from '../../constants/resources';
import { COLORS } from '../../constants/colors';

// ── Config hành động chăm cây ─────────────────────────────────────────────────
export const ACTION_COST = 5; // tài nguyên cần để thực hiện 1 lần chăm sóc

const RESOURCE_ORDER: PlantResourceType[] = [
  'WATER', 'SUNLIGHT', 'FERTILIZER', 'AIR', 'LOVE', 'DEW',
];

const RESOURCE_EMOJI: Record<PlantResourceType, string> = {
  WATER: '💧', SUNLIGHT: '☀️', FERTILIZER: '🌿',
  AIR: '🌬️', LOVE: '💚', DEW: '✨',
};

const ACTION_LABEL: Record<PlantResourceType, string> = {
  WATER: 'Tưới nước',
  SUNLIGHT: 'Phơi nắng',
  FERTILIZER: 'Bón phân',
  AIR: 'Thổi gió',
  LOVE: 'Yêu thương',
  DEW: 'Sương mai',
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface PlantActionSheetProps {
  visible: boolean;
  resources: Record<PlantResourceType, number>;
  onClose: () => void;
  /** Callback khi người dùng chọn hành động có đủ tài nguyên */
  onAction: (type: PlantResourceType) => void;
}

// ── ActionButton ──────────────────────────────────────────────────────────────
const ActionButton: React.FC<{
  type: PlantResourceType;
  amount: number;
  onPress: (type: PlantResourceType) => void;
  onNotEnough: (type: PlantResourceType) => void;
}> = ({ type, amount, onPress, onNotEnough }) => {
  const enough = amount >= ACTION_COST;
  const resource = RESOURCES[type];
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    if (!enough) {
      // Shake animation khi không đủ
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 4, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
      onNotEnough(type);
      return;
    }
    onPress(type);
  };

  return (
    <Animated.View style={[{ width: '48%' }, { transform: [{ translateX: shakeAnim }] }]}>
      <TouchableOpacity
        style={[
          styles.actionBtn,
          enough
            ? { borderColor: resource.color + '60', backgroundColor: resource.color + '0F' }
            : styles.actionBtnDisabled,
        ]}
        onPress={handlePress}
        activeOpacity={0.75}
      >
        {type === 'FERTILIZER' ? (
          <Image source={require('../../../assets/phan_bon.png')} style={styles.imageIcon} />
        ) : type === 'DEW' ? (
          <Image source={require('../../../assets/suong_mai.png')} style={styles.imageIcon} />
        ) : type === 'SUNLIGHT' ? (
          <Image source={require('../../../assets/mat_troi.png')} style={styles.imageIcon} />
        ) : type === 'LOVE' ? (
          <Image source={require('../../../assets/yeu_thuong.png')} style={styles.imageIcon} />
        ) : (
          <RNText style={styles.actionEmoji}>{RESOURCE_EMOJI[type]}</RNText>
        )}
        <Text style={[styles.actionLabel, !enough && styles.textMuted]}>
          {ACTION_LABEL[type]}
        </Text>

        {/* Thanh tài nguyên nhỏ */}
        <View style={styles.amountRow}>
          <View style={[styles.amountBarBg, { borderColor: enough ? resource.color + '40' : '#E0E0E0' }]}>
            <View
              style={[
                styles.amountBarFill,
                {
                  backgroundColor: enough ? resource.color : '#D0D0D0',
                  width: `${Math.min((amount / Math.max(ACTION_COST, 1)) * 100, 100)}%` as any,
                },
              ]}
            />
          </View>
          <Text style={[styles.amountText, { color: enough ? resource.color : '#AAAAAA' }]}>
            {amount}/{ACTION_COST}
          </Text>
        </View>

        {!enough && (
          <View style={styles.lockBadge}>
            <RNText style={styles.lockIcon}>🔒</RNText>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export const PlantActionSheet: React.FC<PlantActionSheetProps> = ({
  visible, resources, onClose, onAction,
}) => {
  const slideAnim = useRef(new Animated.Value(400)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const [feedback, setFeedback] = useState<{ type: PlantResourceType } | null>(null);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 100, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 400, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleNotEnough = (type: PlantResourceType) => {
    setFeedback({ type });
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleAction = (type: PlantResourceType) => {
    onAction(type);
    // Đóng sheet sau khi chọn
    setTimeout(onClose, 100);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
            >
              {/* Handle */}
              <View style={styles.handle} />

              {/* Header */}
              <Text style={styles.title}>Chăm sóc cây của bạn 🌱</Text>
              <Text style={styles.subtitle}>
                Mỗi hành động tiêu {ACTION_COST} tài nguyên. Hoàn thành nhiệm vụ để tích lũy thêm!
              </Text>

              {/* Feedback khi không đủ tài nguyên */}
              {feedback && (
                <Animated.View style={styles.feedbackBox}>
                  <RNText style={styles.feedbackIcon}>😢</RNText>
                  <Text style={styles.feedbackText}>
                    Chưa đủ {RESOURCES[feedback.type].label} để {ACTION_LABEL[feedback.type].toLowerCase()}.{'\n'}
                    Hoàn thành nhiệm vụ để tích lũy thêm nhé!
                  </Text>
                </Animated.View>
              )}

              {/* Lưới hành động 2 cột */}
              <View style={styles.grid}>
                {RESOURCE_ORDER.map((type) => (
                  <ActionButton
                    key={type}
                    type={type}
                    amount={resources[type] ?? 0}
                    onPress={handleAction}
                    onNotEnough={handleNotEnough}
                  />
                ))}
              </View>

              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeBtnText}>Đóng</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FAFCFA',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 20,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#DADADA',
    alignSelf: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18, fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13, color: COLORS.text.muted,
    textAlign: 'center', lineHeight: 19,
    marginTop: -6,
  },

  // ── Feedback ───────────────────────────────────────────────────────────────
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF8E1',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFE082',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  feedbackIcon: { fontSize: 22 },
  feedbackText: {
    flex: 1,
    fontSize: 13, color: '#795548', lineHeight: 18,
  },

  // ── Grid ─────────────────────────────────────────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionBtn: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 12,
    gap: 8,
    position: 'relative',
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnDisabled: {
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },
  actionEmoji: { fontSize: 28 },
  imageIcon: { width: 44, height: 44, borderRadius: 22 },
  actionLabel: {
    fontSize: 14, fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  textMuted: { color: '#AAAAAA' },

  // ── Amount bar ─────────────────────────────────────────────────────────────
  amountRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  amountBarBg: {
    flex: 1, height: 5, borderRadius: 3, borderWidth: 1,
    backgroundColor: '#F0F0F0', overflow: 'hidden',
  },
  amountBarFill: {
    height: '100%', borderRadius: 3,
    minWidth: 2,
  },
  amountText: {
    fontSize: 11, fontWeight: '600', minWidth: 26,
  },

  // ── Lock badge ─────────────────────────────────────────────────────────────
  lockBadge: {
    position: 'absolute', top: 10, right: 10,
  },
  lockIcon: { fontSize: 13 },

  // ── Close button ──────────────────────────────────────────────────────────
  closeBtn: {
    backgroundColor: COLORS.green.light,
    borderRadius: 14, height: 48,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 4,
  },
  closeBtnText: {
    fontSize: 15, fontWeight: '600', color: COLORS.green.dark,
  },
});
