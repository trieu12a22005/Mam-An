import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { AppText as Text } from './AppText';
import { Companion, CompanionContext } from './Companion';
import { useTimeTheme } from '../../contexts/TimeThemeContext';
import { useRouter } from 'expo-router';

interface PremiumUpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  context: CompanionContext;
  title: string;
}

export const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({ visible, onClose, context, title }) => {
  const { colors } = useTimeTheme();
  const router = useRouter();

  if (!visible) return null;

  const handleUpgrade = () => {
    onClose();
    router.push('/packages');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.container, { backgroundColor: colors.surface }]}>
              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              
              <View style={styles.companionContainer}>
                <Companion context={context} />
              </View>

              <View style={styles.actions}>
                <TouchableOpacity style={[styles.button, { backgroundColor: colors.surfaceSoft }]} onPress={onClose}>
                  <Text style={[styles.buttonText, { color: colors.textMuted }]}>Để sau nhé</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleUpgrade}>
                  <Text style={[styles.buttonText, { color: colors.surface }]}>Xem gói nâng cấp</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  companionContainer: {
    marginBottom: 24,
    minHeight: 180,
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
