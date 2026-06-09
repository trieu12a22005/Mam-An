/**
 * pushNotification.service.ts
 *
 * Guard Expo Go: SDK 53 đã xóa remote push notification khỏi Expo Go.
 * Toàn bộ code expo-notifications được lazy-import và bọc try-catch
 * để app không crash khi chạy bằng Expo Go.
 *
 * Khi dùng Development Build thì hoạt động bình thường.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import axiosClient from '../api/axiosClient';

// ── Detect Expo Go ─────────────────────────────────────────────────────────────
// Constants.appOwnership === 'expo' khi chạy trong Expo Go
const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === 'storeClient';

// ── Lazy import expo-notifications (tránh crash khi Expo Go load module) ───────
async function getNotifications() {
  try {
    return await import('expo-notifications');
  } catch {
    return null;
  }
}

// ── Setup handler foreground (chỉ chạy trong dev build) ──────────────────────
if (!isExpoGo) {
  getNotifications().then((N) => {
    if (!N) return;
    N.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }).catch(() => {});
}

// ── BƯỚC 1: Xin quyền ngay khi app khởi động ────────────────────────────────
export async function requestNotificationPermission(): Promise<boolean> {
  if (isExpoGo) {
    console.log('[Push] Expo Go detected — skipping push notification setup.');
    return false;
  }

  try {
    const N = await getNotifications();
    if (!N) return false;

    if (Platform.OS === 'android') {
      await N.setNotificationChannelAsync('garden-updates-v2', {
        name: 'Cập nhật vườn V2 🌿',
        importance: N.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2ea82e',
        sound: 'default',
        description: 'Thông báo khi nhà vườn cập nhật tình trạng cây của bạn',
        showBadge: true,
      });
    }

    const { status: existing } = await N.getPermissionsAsync();
    console.log('[Push] Current permission status:', existing);

    if (existing === 'granted') {
      syncPushTokenToServer().catch(() => {});
      return true;
    }

    const { status } = await N.requestPermissionsAsync();
    console.log('[Push] Permission after request:', status);

    if (status === 'granted') {
      syncPushTokenToServer().catch(() => {});
    }

    return status === 'granted';
  } catch (err: any) {
    console.warn('[Push] requestNotificationPermission error:', err?.message);
    return false;
  }
}

// ── BƯỚC 2: Lấy token + gửi lên server ───────────────────────────────────────
export async function syncPushTokenToServer(): Promise<void> {
  if (isExpoGo) return;

  try {
    const N = await getNotifications();
    if (!N) return;

    const { status } = await N.getPermissionsAsync();
    if (status !== 'granted') {
      console.warn('[Push] Permission not granted, skip token sync.');
      return;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      'cb8667d2-fd41-4a07-bfc4-f559a525306e';

    const tokenData = await N.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;
    if (!token) return;

    await axiosClient.patch('/users/push-token', { pushToken: token });
    console.log('[Push] Token synced to server.');
  } catch (err: any) {
    console.warn('[Push] syncPushTokenToServer failed:', err?.message);
  }
}

// ── Listeners (no-op khi Expo Go) ─────────────────────────────────────────────
type AnySubscription = { remove: () => void };
const NOOP_SUB: AnySubscription = { remove: () => {} };

export function addNotificationResponseListener(
  handler: (response: any) => void,
): AnySubscription {
  if (isExpoGo) return NOOP_SUB;
  let sub = NOOP_SUB;
  getNotifications().then((N) => {
    if (N) sub = N.addNotificationResponseReceivedListener(handler);
  }).catch(() => {});
  return {
    remove: () => sub.remove(),
  };
}

export function addNotificationReceivedListener(
  handler: (notification: any) => void,
): AnySubscription {
  if (isExpoGo) return NOOP_SUB;
  let sub = NOOP_SUB;
  getNotifications().then((N) => {
    if (N) sub = N.addNotificationReceivedListener(handler);
  }).catch(() => {});
  return {
    remove: () => sub.remove(),
  };
}

// ── Test local notification ───────────────────────────────────────────────────
export async function testLocalNotification(): Promise<void> {
  if (isExpoGo) {
    console.log('[Push] Expo Go — local notification test skipped.');
    return;
  }
  try {
    const N = await getNotifications();
    if (!N) return;
    await N.scheduleNotificationAsync({
      content: {
        title: 'Test local Mầm An 🌱',
        body: 'Nếu thấy thông báo này thì quyền + channel OK',
        sound: 'default',
      },
      trigger: {
        seconds: 2,
        channelId: 'garden-updates-v2',
      } as any,
    });
  } catch (err: any) {
    console.warn('[Push] testLocalNotification error:', err?.message);
  }
}
