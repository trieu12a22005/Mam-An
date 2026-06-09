import { AppText as Text } from '../common/AppText';
import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet } from 'react-native';
import { FocusSessionOption, FocusSessionStatus } from '../../types/focusSession.type';
import { getCompletionMessage } from '../../constants/focusSessions';
import { COLORS } from '../../constants/colors';
import { PlantAvatar } from '../plant/PlantAvatar';
import { VirtualPlant } from '../../types/plant.type';

interface Props {
  visible: boolean;
  status: FocusSessionStatus; // 'COMPLETED' | 'PARTIAL' | 'CANCELLED'
  option: FocusSessionOption | null;
  actualRewardAmount: number;
  actualGrowthReward: number;
  plant?: VirtualPlant | null;
  onGoHome: () => void;
  onResume?: () => void; // Chỉ dùng khi PARTIAL/CANCELLED
}

export const FocusCompleteModal: React.FC<Props> = ({
  visible, status, option, actualRewardAmount, actualGrowthReward,
  plant, onGoHome, onResume,
}) => {
  if (!option) return null;

  const isComplete = status === 'COMPLETED';
  const isPartial = status === 'PARTIAL';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.avatarContainer}>
            <PlantAvatar
              status={plant?.status ?? 'GROWING'}
              size="md"
              flowerType={plant?.flowerType}
            />
          </View>

          <Text style={styles.title}>
            {isComplete
              ? 'Bạn đã ngồi cùng cây rồi 🌿'
              : 'Bạn đã ở cùng cây một chút rồi'}
          </Text>

          <Text style={styles.message}>
            {isComplete
              ? getCompletionMessage(option.type)
              : 'Dù chưa hết phiên, khoảng thời gian này vẫn đáng quý. Khi sẵn sàng, mình có thể bắt đầu lại nhẹ nhàng nhé.'}
          </Text>

          {/* Reward — chỉ hiện khi có */}
          {(isComplete || isPartial) && actualRewardAmount > 0 && (
            <View style={styles.rewardBox}>
              <Text style={styles.rewardTitle}>Cây vừa nhận được</Text>
              <Text style={styles.rewardValue}>
                +{actualRewardAmount} {option.rewardResource}
              </Text>
              <Text style={styles.rewardGrowth}>
                +{actualGrowthReward} điểm phát triển
              </Text>
            </View>
          )}

          {/* Buttons */}
          {!isComplete && onResume && (
            <TouchableOpacity style={styles.btnResume} onPress={onResume}>
              <Text style={styles.btnResumeText}>Tiếp tục</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.btnHome} onPress={onGoHome}>
            <Text style={styles.btnHomeText}>
              {isComplete ? 'Về khu vườn' : 'Kết thúc phiên'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 20, fontWeight: '700',
    color: COLORS.text.primary, textAlign: 'center',
  },
  message: {
    fontSize: 14, color: COLORS.text.secondary,
    textAlign: 'center', lineHeight: 24,
  },
  rewardBox: {
    backgroundColor: COLORS.green[50],
    borderRadius: 16,
    paddingVertical: 16, paddingHorizontal: 24,
    alignItems: 'center',
    gap: 4,
    width: '100%',
  },
  rewardTitle: { fontSize: 12, color: COLORS.text.muted, fontWeight: '500' },
  rewardValue: { fontSize: 22, fontWeight: '800', color: COLORS.green.dark },
  rewardGrowth: { fontSize: 13, color: COLORS.green.main, fontWeight: '600' },
  btnResume: {
    width: '100%', height: 50,
    backgroundColor: COLORS.green.main,
    borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  btnResumeText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnHome: {
    width: '100%', height: 46,
    borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  btnHomeText: { color: COLORS.text.secondary, fontWeight: '600', fontSize: 14 },
});
