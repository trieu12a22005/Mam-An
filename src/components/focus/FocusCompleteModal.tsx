import { AppText as Text } from '../common/AppText';
import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet } from 'react-native';
import { FocusSessionOption, FocusSessionStatus } from '../../types/focusSession.type';
import { VirtualPlant } from '../../types/plant.type';
import { getCompletionMessage } from '../../constants/focusSessions';
import { COLORS } from '../../constants/colors';
import { useTimeTheme } from '../../contexts/TimeThemeContext';
import { Image } from 'react-native';

const MASCOT_IMAGES = {
  happy: require('../../../assets/happy.png'),
  thinking: require('../../../assets/thinking.png'),
};

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
  const { colors } = useTimeTheme();
  if (!option) return null;

  const isComplete = status === 'COMPLETED';
  const isPartial = status === 'PARTIAL';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.mascotWrap, { backgroundColor: colors.surfaceSoft }]}>
            <Image
              source={isComplete ? MASCOT_IMAGES.happy : MASCOT_IMAGES.thinking}
              style={styles.mascotImg}
              resizeMode="contain"
            />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            {isComplete
              ? 'Bạn đã ngồi cùng cây rồi 🌿'
              : 'Bạn đã ở cùng cây một chút rồi'}
          </Text>

          <Text style={[styles.message, { color: colors.text }]}>
            {isComplete
              ? getCompletionMessage(option.type)
              : 'Dù chưa hết phiên, khoảng thời gian này vẫn đáng quý. Khi sẵn sàng, mình có thể bắt đầu lại nhẹ nhàng nhé.'}
          </Text>

          {/* Reward — chỉ hiện khi có */}
          {(isComplete || isPartial) && actualRewardAmount > 0 && (
            <View style={[styles.rewardBox, { backgroundColor: colors.surfaceSoft }]}>
              <Text style={[styles.rewardTitle, { color: colors.textMuted }]}>Cây vừa nhận được</Text>
              <Text style={[styles.rewardValue, { color: colors.primary }]}>
                +{actualRewardAmount} {option.rewardResource}
              </Text>
              <Text style={styles.rewardGrowth}>
                +{actualGrowthReward} điểm phát triển
              </Text>
            </View>
          )}

          {/* Buttons */}
          {!isComplete && onResume && (
            <TouchableOpacity style={[styles.btnResume, { backgroundColor: colors.primary }]} onPress={onResume}>
              <Text style={styles.btnResumeText}>Tiếp tục</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.btnHome, { borderColor: colors.border }]} onPress={onGoHome}>
            <Text style={[styles.btnHomeText, { color: colors.textMuted }]}>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheet: {
    borderRadius: 24,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    gap: 16,
    elevation: 10, shadowColor: '#000',
    shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: 10 },
  },
  mascotWrap: {
    width: 100, height: 100,
    marginTop: -50, marginBottom: 8,
    borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
    elevation: 5, shadowColor: '#000',
    shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  mascotImg: { width: 90, height: 90 },
  title: {
    fontSize: 20, fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center', lineHeight: 24,
  },
  rewardBox: {
    borderRadius: 16,
    paddingVertical: 16, paddingHorizontal: 24,
    alignItems: 'center',
    gap: 4,
    width: '100%',
  },
  rewardTitle: { fontSize: 12, fontWeight: '500' },
  rewardValue: { fontSize: 22, fontWeight: '800' },
  rewardGrowth: { fontSize: 13, color: COLORS.green.main, fontWeight: '600' },
  btnResume: {
    width: '100%', height: 50,
    borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  btnResumeText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnHome: {
    width: '100%', height: 46,
    borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5,
  },
  btnHomeText: { fontWeight: '600', fontSize: 14 },
});
