import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useOrderDetail } from '../src/hooks/useOrders';

export default function OrderSuccessScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { data: order, isLoading } = useOrderDetail(orderId as string);

  if (isLoading || !order) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đơn hàng đã được tạo 🌻</Text>
      <Text style={styles.subtitle}>
        Mầm An đã ghi nhận yêu cầu của bạn. Sau khi thanh toán được xác nhận, hành trình cây đồng hành sẽ bắt đầu.
      </Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Mã đơn hàng:</Text>
          <Text style={styles.value}>{order.orderCode}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Gói dịch vụ:</Text>
          <Text style={styles.value}>{order.plan?.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tổng tiền:</Text>
          <Text style={styles.value}>{order.totalAmount.toLocaleString('vi-VN')}đ</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Trạng thái:</Text>
          <Text style={styles.statusText}>Chờ thanh toán</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.instructionTitle}>Hướng dẫn thanh toán</Text>
        <Text style={styles.instructionText}>
          Vui lòng chuyển khoản với nội dung:
        </Text>
        <View style={styles.transferCodeContainer}>
          <Text style={styles.transferCode}>MAM AN - {order.orderCode}</Text>
        </View>
        <Text style={styles.note}>
          Sau khi nhận thanh toán, Mầm An sẽ xác nhận và gán cây thật cho bạn.
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.buttonOutline} 
        onPress={() => router.replace('/my-orders')}
      >
        <Text style={styles.buttonOutlineText}>Xem đơn hàng của tôi</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.replace('/')}
      >
        <Text style={styles.buttonText}>Về khu vườn</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9F7',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3A33',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B9080',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#4A5D53',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3A33',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F6C177',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3A33',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#4A5D53',
    marginBottom: 12,
  },
  transferCodeContainer: {
    backgroundColor: '#E8F3F0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  transferCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B9080',
  },
  note: {
    fontSize: 14,
    color: '#6B9080',
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#6B9080',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonOutline: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#6B9080',
  },
  buttonOutlineText: {
    color: '#6B9080',
    fontSize: 16,
    fontWeight: '600',
  },
});
