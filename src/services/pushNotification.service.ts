import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import axiosClient from '../api/axiosClient';

// ── Cấu hình hiển thị notification khi app đang mở (foreground) ──────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ── BƯỚC 1: Xin quyền ngay khi app khởi động ────────────────────────────────
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('garden-updates-v2', {
      name: 'Cập nhật vườn V2 🌿',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2ea82e',
      sound: 'default',
      description: 'Thông báo khi nhà vườn cập nhật tình trạng cây của bạn',
      showBadge: true,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  console.log('[Push] Current permission status:', existing);

  if (existing === 'granted') return true;

  // Hiện dialog xin quyền của OS
  const { status } = await Notifications.requestPermissionsAsync();
  console.log('[Push] Permission after request:', status);
  
  // Nếu user vừa bấm Cho Phép, lập tức đồng bộ token (fix lỗi race condition)
  if (status === 'granted') {
    syncPushTokenToServer().catch(() => {});
  }

  return status === 'granted';
}

// ── BƯỚC 2: Lấy token + gửi lên server (sau khi đã login) ────────────────────
export async function syncPushTokenToServer(): Promise<void> {
  try {
    // 1. Kiểm tra quyền
    const { status } = await Notifications.getPermissionsAsync();
    console.log('[Push] syncPushTokenToServer — permission:', status);
    if (status !== 'granted') {
      import('react-native').then(({ Alert }) => Alert.alert("⚠️ Permission Not Granted", "Trạng thái quyền hiện tại: " + status));
      return;
    }

    // 2. Lấy projectId
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      'cb8667d2-fd41-4a07-bfc4-f559a525306e';

    // 3. Lấy Expo Push Token
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;

    if (!token) {
      import('react-native').then(({ Alert }) => Alert.alert("⚠️ Lỗi Token", "Không lấy được token từ hệ thống Expo."));
      return;
    }

    // 4. Gửi lên backend
    const res = await axiosClient.patch('/users/push-token', { pushToken: token });
    console.log('[Push] Token saved to server. Response:', res.status);
    // HIỂN THỊ ALERT CHO DEBUUG (Có thể xóa sau khi test thành công)
    import('react-native').then(({ Alert }) => {
       Alert.alert("✅ Push Token Success", "Đã lưu token lên server thành công!\nToken: " + token.slice(0, 20) + "...");
    });
  } catch (err: any) {
    // Log đầy đủ để dễ debug
    console.error('[Push] syncPushTokenToServer FAILED:');
    console.error('[Push] Error name:', err?.name);
    console.error('[Push] Error message:', err?.message);
    
    // HIỂN THỊ ALERT CHO DEBUUG
    import('react-native').then(({ Alert }) => {
       Alert.alert("❌ Push Token Error", 
         "Name: " + err?.name + "\n" +
         "Msg: " + err?.message + "\n" +
         "Status: " + err?.response?.status
       );
    });
  }
}

// ── Listener: user tap vào notification ──────────────────────────────────────
export function addNotificationResponseListener(
  handler: (response: Notifications.NotificationResponse) => void,
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

// ── Listener: nhận notification khi app foreground ───────────────────────────
export function addNotificationReceivedListener(
  handler: (notification: Notifications.Notification) => void,
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(handler);
}

// ── Hàm test nội bộ để loại trừ lỗi hệ thống ───────────────────────────────
export async function testLocalNotification() {
  await Notifications.scheduleNotificationAsync({
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
}
