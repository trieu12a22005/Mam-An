import { AppText as Text } from '../src/components/common/AppText';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../src/components/common/Screen';
import { AppInput } from '../src/components/common/AppInput';
import { AppButton } from '../src/components/common/AppButton';
import { useAuth } from '../src/hooks/useAuth';
import { COLORS } from '../src/constants/colors';

export default function Register() {
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!fullName.trim() || fullName.trim().length < 2)
      e.fullName = 'Tên phải có ít nhất 2 ký tự';
    if (!email.trim() || !email.includes('@'))
      e.email = 'Email không hợp lệ';
    if (!password || password.length < 6)
      e.password = 'Mật khẩu tối thiểu 6 ký tự';
    if (password !== confirmPassword)
      e.confirmPassword = 'Mật khẩu xác nhận không khớp';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await register(fullName.trim(), email.trim(), password);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setErrors({ general: err.message ?? 'Đăng ký thất bại, vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll padded backgroundColor={COLORS.background}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.logo}>🌱</Text>
        <Text style={styles.appName}>Garden Mobile</Text>
        <Text style={styles.subtitle}>Bắt đầu hành trình{'\n'}của bạn hôm nay.</Text>
      </View>

      {/* ── Form ── */}
      <View style={styles.form}>
        <AppInput
          label="Tên của bạn"
          placeholder="Nguyễn Văn A"
          value={fullName}
          onChangeText={setFullName}
          autoComplete="name"
          error={errors.fullName}
        />
        <AppInput
          label="Email"
          placeholder="email@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoComplete="email"
          error={errors.email}
        />
        <AppInput
          label="Mật khẩu"
          placeholder="Ít nhất 6 ký tự"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          error={errors.password}
          rightIcon={
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          }
        />
        <AppInput
          label="Xác nhận mật khẩu"
          placeholder="Nhập lại mật khẩu"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          error={errors.confirmPassword}
        />

        {errors.general ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {errors.general}</Text>
          </View>
        ) : null}

        <AppButton
          title="Tạo tài khoản"
          onPress={handleRegister}
          loading={loading}
          style={styles.registerBtn}
        />
      </View>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Đã có tài khoản? </Text>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.footerLink}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 32,
  },
  logo: {
    fontSize: 56,
    marginBottom: 10,
  },
  appName: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.green.dark,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.text.muted,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorBox: {
    backgroundColor: '#FFF0F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
  },
  registerBtn: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 28,
  },
  footerText: {
    color: COLORS.text.muted,
    fontSize: 14,
  },
  footerLink: {
    color: COLORS.green.main,
    fontWeight: '600',
    fontSize: 14,
  },
});
