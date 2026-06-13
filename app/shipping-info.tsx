import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMyEntitlements } from '../src/hooks/usePlans';
import { useUpdateShippingInfo } from '../src/hooks/useOrders';
import { GiftRecipientType } from '../src/types/plan.type';

export default function ShippingInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { data: entitlements, isLoading: isLoadingEntitlements } = useMyEntitlements();
  const updateShippingMutation = useUpdateShippingInfo();

  const [recipientType, setRecipientType] = useState<GiftRecipientType>('SELF');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientNote, setRecipientNote] = useState('');

  useEffect(() => {
    if (entitlements?.shippingInfo) {
      setRecipientType(entitlements.shippingInfo.recipientType ?? 'SELF');
      setRecipientName(entitlements.shippingInfo.recipientName ?? '');
      setRecipientPhone(entitlements.shippingInfo.recipientPhone ?? '');
      setRecipientAddress(entitlements.shippingInfo.recipientAddress ?? '');
      setRecipientNote(entitlements.shippingInfo.recipientNote ?? '');
    }
  }, [entitlements]);

  const handleUpdate = () => {
    if (!entitlements?.currentRealOrderId) return;
    
    if (recipientType !== 'SELF' && (!recipientName || !recipientPhone || !recipientAddress)) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin người nhận.');
      return;
    }

    updateShippingMutation.mutate({
      id: entitlements.currentRealOrderId,
      input: {
        recipientType,
        recipientName,
        recipientPhone,
        recipientAddress,
        recipientNote,
      }
    }, {
      onSuccess: () => {
        Alert.alert('Thành công', 'Đã cập nhật thông tin giao hàng.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      },
      onError: (error) => {
        Alert.alert('Lỗi', 'Không thể cập nhật: ' + error.message);
      }
    });
  };

  if (isLoadingEntitlements) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6B9080" />
      </View>
    );
  }

  if (!entitlements?.hasRealPlantOrder || !entitlements?.currentRealOrderId) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Bạn chưa có đơn hàng cây thật nào để cập nhật địa chỉ.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isLoading = updateShippingMutation.isPending;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 20, 40) }]}>
      <Text style={styles.title}>Thông tin nhận cây</Text>
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Bạn muốn gửi hoa cho ai?</Text>
        <View style={styles.radioGroup}>
          {[
            { id: 'SELF', label: 'Bản thân' },
            { id: 'FRIEND', label: 'Bạn bè/Người thân' },
            { id: 'DONATION', label: 'Tặng người cần động viên' }
          ].map((option) => (
            <TouchableOpacity 
              key={option.id}
              style={[styles.radioItem, recipientType === option.id && styles.radioItemActive]}
              onPress={() => setRecipientType(option.id as GiftRecipientType)}
            >
              <Text style={[styles.radioText, recipientType === option.id && styles.radioTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {recipientType !== 'SELF' && (
          <View>
            <Text style={styles.label}>Tên người nhận</Text>
            <TextInput style={styles.input} placeholder="Tên người nhận" value={recipientName} onChangeText={setRecipientName} />
            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput style={styles.input} placeholder="Số điện thoại" keyboardType="phone-pad" value={recipientPhone} onChangeText={setRecipientPhone} />
            <Text style={styles.label}>Địa chỉ giao hàng</Text>
            <TextInput style={styles.input} placeholder="Địa chỉ giao hàng" multiline value={recipientAddress} onChangeText={setRecipientAddress} />
            <Text style={styles.label}>Ghi chú giao hàng</Text>
            <TextInput style={styles.input} placeholder="Ghi chú giao hàng" multiline value={recipientNote} onChangeText={setRecipientNote} />
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={handleUpdate}
        disabled={isLoading}
      >
        {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Lưu thay đổi</Text>}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.cancelButton} 
        onPress={() => router.back()}
        disabled={isLoading}
      >
        <Text style={styles.cancelButtonText}>Hủy</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9F7',
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F9F7',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#4A5D53',
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3A33',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3A33',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B9080',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F6F9F7',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#2D3A33',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  radioGroup: {
    marginBottom: 16,
  },
  radioItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginBottom: 12,
  },
  radioItemActive: {
    borderColor: '#6B9080',
    backgroundColor: '#E8F3F0',
  },
  radioText: {
    fontSize: 16,
    color: '#4A5D53',
  },
  radioTextActive: {
    color: '#2D3A33',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#6B9080',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#A4C3B2',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#4A5D53',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#6B9080',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
