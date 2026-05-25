import { AppText as Text } from './AppText';
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  hint,
  rightIcon,
  containerStyle,
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputFocused,
          !!error && styles.inputError,
        ]}
      >
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.text.muted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize="none"
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 15,
    color: COLORS.text.primary,
  },
  inputFocused: {
    borderColor: COLORS.borderFocus,
    backgroundColor: COLORS.green[50],
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  rightIcon: {
    paddingLeft: 8,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.danger,
  },
  hint: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.text.muted,
  },
});
