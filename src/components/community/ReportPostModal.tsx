import { AppText as Text } from '../common/AppText';
import React, { useState } from 'react';
import {
  Modal, View, TouchableOpacity, StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../constants/colors';

const REPORT_REASONS = [
  'Ảnh không phù hợp',
  'Lộ thông tin cá nhân',
  'Spam / quảng cáo',
  'Nội dung gây khó chịu',
  'Khác',
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}

export const ReportPostModal: React.FC<Props> = ({ visible, onClose, onSubmit }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!selected || loading) return;
    setLoading(true);
    try {
      await onSubmit(selected);
      setDone(true);
      setTimeout(() => {
        setDone(false);
        setSelected(null);
        onClose();
      }, 1800);
    } catch {
      // Im lặng — không hiện lỗi kỹ thuật
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setSelected(null);
    setDone(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose}>
        <TouchableOpacity style={styles.sheet} activeOpacity={1} onPress={() => {}}>
          {done ? (
            <View style={styles.doneWrap}>
              <Text style={styles.doneEmoji}>🌿</Text>
              <Text style={styles.doneTitle}>Cảm ơn bạn!</Text>
              <Text style={styles.doneMsg}>
                Cảm ơn bạn đã giúp giữ khu vườn chung an toàn.
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.title}>Báo cáo bài viết</Text>
              <Text style={styles.subtitle}>Bạn muốn báo cáo vì lý do gì?</Text>

              <View style={styles.options}>
                {REPORT_REASONS.map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={[styles.option, selected === reason && styles.optionActive]}
                    onPress={() => setSelected(reason)}
                  >
                    <Text style={[styles.optionText, selected === reason && styles.optionTextActive]}>
                      {reason}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, (!selected || loading) && styles.submitDisabled]}
                onPress={handleSubmit}
                disabled={!selected || loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.submitText}>Gửi báo cáo</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>
            </>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text.primary },
  subtitle: { fontSize: 13, color: COLORS.text.secondary },

  options: { gap: 8 },
  option: {
    paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  optionActive: {
    borderColor: COLORS.green.main,
    backgroundColor: COLORS.green[50],
  },
  optionText: { fontSize: 14, color: COLORS.text.secondary, fontWeight: '500' },
  optionTextActive: { color: COLORS.green.dark, fontWeight: '700' },

  submitBtn: {
    backgroundColor: COLORS.green.main,
    borderRadius: 14, height: 50,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 4,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  cancelBtn: {
    height: 44, justifyContent: 'center', alignItems: 'center',
  },
  cancelText: { color: COLORS.text.muted, fontSize: 14 },

  doneWrap: { alignItems: 'center', gap: 12, paddingVertical: 24 },
  doneEmoji: { fontSize: 48 },
  doneTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text.primary },
  doneMsg: { fontSize: 14, color: COLORS.text.secondary, textAlign: 'center', lineHeight: 22 },
});
