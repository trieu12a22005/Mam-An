import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { SelectedImage } from '../types/task.type';

/** Options cho camera — không crop để tránh giật màn hình */
const CAMERA_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: false, // Tắt crop → tránh giật + re-render thêm màn
  quality: 0.8,
};

/** Options cho thư viện — không bắt crop, giữ nguyên tấm ảnh */
const LIBRARY_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: false, // Tắt crop → user chọn nguyên tấm
  quality: 0.85,
};

function extractImageMeta(asset: ImagePicker.ImagePickerAsset): SelectedImage {
  const ext = asset.uri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif',
  };
  return {
    uri: asset.uri,
    name: asset.fileName ?? `photo_${Date.now()}.${ext}`,
    type: mimeMap[ext] ?? 'image/jpeg',
  };
}

/** Xin quyền camera + thư viện ảnh */
export async function requestImagePermission(): Promise<boolean> {
  const camera = await ImagePicker.requestCameraPermissionsAsync();
  const library = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return camera.status === 'granted' && library.status === 'granted';
}

/** Chụp ảnh bằng camera — không crop, không giật */
export async function takePhotoWithCamera(): Promise<SelectedImage | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Cần quyền camera',
      'Vui lòng vào Cài đặt → Mầm An → Cho phép truy cập camera.',
    );
    return null;
  }

  const result = await ImagePicker.launchCameraAsync(CAMERA_OPTIONS);
  if (result.canceled || !result.assets?.[0]) return null;

  return extractImageMeta(result.assets[0]);
}

/** Chọn ảnh từ thư viện — giữ nguyên tấm ảnh, không bắt crop */
export async function pickImageFromLibrary(): Promise<SelectedImage | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Cần quyền thư viện ảnh',
      'Vui lòng vào Cài đặt → Mầm An → Cho phép truy cập ảnh.',
    );
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync(LIBRARY_OPTIONS);
  if (result.canceled || !result.assets?.[0]) return null;

  return extractImageMeta(result.assets[0]);
}
