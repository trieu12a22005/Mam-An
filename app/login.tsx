import { AppText as Text } from '../src/components/common/AppText';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../src/components/common/Screen';
import { AppInput } from '../src/components/common/AppInput';
import { AppButton } from '../src/components/common/AppButton';
import { useAuth } from '../src/hooks/useAuth';
import { COLORS } from '../src/constants/colors';

export default function Login() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'Vui lòng nhập email';
    else if (!email.includes('@')) newErrors.email = 'Email không hợp lệ';
    if (!password) newErrors.password = 'Vui lòng nhập mật khẩu';
    else if (password.length < 6) newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Đăng nhập thất bại, vui lòng thử lại.';
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll padded backgroundColor={COLORS.background}>
      {/* ── Logo area ── */}
      <View style={styles.header}>
        <Image source={require('../assets/image1.png')} style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 12 }} />
        <Text style={styles.appName}>Mầm An</Text>
        <Text style={styles.subtitle}>Chăm một mầm nhỏ,{'\n'}chăm lại chính mình.</Text>
      </View>

      {/* ── Form ── */}
      <View style={styles.form}>
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
          placeholder="Nhập mật khẩu"
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

        {errors.general ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {errors.general}</Text>
          </View>
        ) : null}

        <AppButton
          title="Đăng nhập"
          onPress={handleLogin}
          loading={loading}
          style={styles.loginBtn}
        />
      </View>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Chưa có tài khoản? </Text>
        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.footerLink}>Đăng ký ngay</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.green.dark,
    letterSpacing: 0.5,
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
  loginBtn: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 32,
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
