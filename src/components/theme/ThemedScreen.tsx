import React from 'react';
import { View, StyleSheet, ViewStyle, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTimeTheme } from '../../contexts/TimeThemeContext';
import { NightSkyOverlay } from './NightSkyOverlay';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  showNightEffects?: boolean;
  nightEffectIntensity?: 'low' | 'normal';
}

/**
 * ThemedScreen — wrapper thay thế Screen cho các màn cần hiệu ứng ban đêm.
 *
 * Dùng:
 *   <ThemedScreen showNightEffects>
 *     ...content...
 *   </ThemedScreen>
 *
 * Cách dùng với intensity:
 *   <ThemedScreen showNightEffects nightEffectIntensity="low">
 */
export const ThemedScreen: React.FC<Props> = ({
  children,
  style,
  showNightEffects = false,
  nightEffectIntensity = 'normal',
}) => {
  const { colors, isNight, settings } = useTimeTheme();
  const insets = useSafeAreaInsets();

  const shouldShowStars =
    showNightEffects &&
    isNight &&
    settings.enableNightEffects;

  const barStyle = isNight ? 'light-content' : 'dark-content';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
        },
        style,
      ]}
    >
      <StatusBar barStyle={barStyle} backgroundColor={colors.background} />
      {children}
      {shouldShowStars && (
        <NightSkyOverlay intensity={nightEffectIntensity} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
