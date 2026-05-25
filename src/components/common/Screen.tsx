import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scroll?: boolean;
  padded?: boolean;
  backgroundColor?: string;
  /**
   * Which edges to apply safe-area insets.
   * Inside tab screens, pass edges={['top']} so the tab bar handles bottom.
   * Default = ['top'] — bottom is handled by tab bar or explicit paddingBottom.
   */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  /** Extra bottom padding inside scroll/flat content (e.g. for last item) */
  extraBottomPad?: number;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  style,
  scroll = false,
  padded = true,
  backgroundColor = COLORS.background,
  edges = ['top'],          // ← only top by default; tab bar handles bottom
  extraBottomPad = 16,
}) => {
  const insets = useSafeAreaInsets();

  const inner = (
    <View
      style={[
        styles.inner,
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={edges}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      {scroll ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[
              styles.scrollContent,
              // Add bottom padding = tab bar height + device navigation bar
              { paddingBottom: insets.bottom + extraBottomPad },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {inner}
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  inner: { flex: 1 },
  padded: { paddingHorizontal: 24 },
  scrollContent: { flexGrow: 1 },
});
