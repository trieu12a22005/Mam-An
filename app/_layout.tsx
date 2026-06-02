import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/contexts/AuthContext';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { requestNotificationPermission, addNotificationReceivedListener, addNotificationResponseListener } from '../src/services/pushNotification.service';
import * as Updates from 'expo-updates';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function RootLayout() {
  // expo-audio: useAudioPlayer quản lý lifecycle tự động
  const player = useAudioPlayer(
    require('../assets/music/sound1.mp3'),
  );

  useEffect(() => {
    async function setupAudio() {
      try {
        await setAudioModeAsync({ playsInSilentMode: true });
        player.loop = true;
        player.volume = 0.3;
        player.play();
      } catch (e) {
        console.warn('Error setting up background music:', e);
      }
    }
    setupAudio();
  }, [player]);

  // ── Xin quyền thông báo ngay khi app khởi động ───────────────────────────
  useEffect(() => {
    requestNotificationPermission().catch(() => { });
  }, []);

  // ── Lắng nghe thông báo khi app đang mở (Foreground) để Cập nhật theo thời gian thực ──
  // ĐÃ COMMENT LẠI VÌ CHUYỂN SANG DÙNG POLLING (refetchInterval) Ở HOOKS
  /*
  useEffect(() => {
    // 1. Khi app ĐANG MỞ và nhận được thông báo
    const sub1 = addNotificationReceivedListener((notification) => {
      console.log('[Push] Nhận thông báo foreground, tự động tải lại dữ liệu...');
      import('react-native').then(({ Alert }) => Alert.alert('🔔 Đã nhận được thông báo', 'App đang tự động lấy dữ liệu mới...'));
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['virtualPlant'] });
        queryClient.invalidateQueries({ queryKey: ['plantUpdates'] });
      }, 1000);
    });

    // 2. Khi user BẤM VÀO thông báo từ ngoài màn hình khóa / thanh thông báo
    const sub2 = addNotificationResponseListener((response) => {
      console.log('[Push] User bấm vào thông báo, tự động tải lại dữ liệu...');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['virtualPlant'] });
      queryClient.invalidateQueries({ queryKey: ['plantUpdates'] });
    });

    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, []);
  */

  // ── Log version và kiểm tra OTA update tự động ────────────────────────
  useEffect(() => {
    const updateId = Updates.updateId ?? 'embedded (chưa có OTA update)';
    const createdAt = Updates.createdAt?.toISOString() ?? 'N/A';
    console.log(`[App] Update ID: ${updateId}`);
    console.log(`[App] Created at: ${createdAt}`);
    console.log(`[App] Channel: ${Updates.channel ?? 'N/A'}`);

    async function checkForUpdates() {
      try {
        // Không check update khi đang chạy dev (expo start)
        if (__DEV__) return;

        console.log('[App] Checking for OTA updates...');
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          console.log('[App] Update available! Downloading...');
          await Updates.fetchUpdateAsync();
          console.log('[App] Download completed. Reloading app...');
          // Tự động khởi động lại app để áp dụng bản mới
          await Updates.reloadAsync();
        } else {
          console.log('[App] App is up to date.');
        }
      } catch (e) {
        console.warn('[App] Error checking for updates:', e);
      }
    }

    checkForUpdates();
  }, []);

  // Tạm dừng/tiếp tục khi app ra ngoài / quay lại
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // Báo cho React Query biết app vừa được mở lại để tự động fetch data mới nhất
      focusManager.setFocused(nextAppState === 'active');
      
      if (nextAppState === 'active') {
        player.play();
      } else {
        player.pause();
      }
    });
    return () => subscription.remove();
  }, [player]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider queryClient={queryClient}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="notifications"
              options={{
                headerShown: true,
                title: 'Thông báo',
                presentation: 'modal',
                headerStyle: { backgroundColor: '#F7FBF7' },
                headerTintColor: '#1A2E1A',
                headerShadowVisible: false,
              }}
            />
          </Stack>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
