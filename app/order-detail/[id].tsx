import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useOrderDetail } from '../../src/hooks/useOrders';
import { ArrowLeft } from 'lucide-react-native';
import { OrderStatus, ShippingStatus } from '../../src/types/order.type';

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading } = useOrderDetail(id as string);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B9080" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Không tìm thấy đơn hàng</Text>
      </View>
    );
  }

  const renderStatus = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <Text style={[styles.statusText, { color: '#F6C177' }]}>Chờ xác nhận thanh toán</Text>;
      case 'PAID':
        return <Text style={[styles.statusText, { color: '#6B9080' }]}>Đã thanh toán</Text>;
      case 'FULFILLING':
        return <Text style={[styles.statusText, { color: '#3B82F6' }]}>Đang chuẩn bị cây</Text>;
      case 'COMPLETED':
        return <Text style={[styles.statusText, { color: '#A4C3B2' }]}>Đã hoàn thành</Text>;
      case 'CANCELLED':
        return <Text style={[styles.statusText, { color: '#EF4444' }]}>Đã hủy</Text>;
      default:
        return <Text style={styles.statusText}>{status}</Text>;
    }
  };

  const renderShippingStatus = (status: ShippingStatus) => {
    if (status === 'NOT_REQUIRED') return 'Không yêu cầu';
    const statusMap: Record<string, string> = {
      'PENDING': 'Chờ xử lý',
      'PREPARING': 'Đang chuẩn bị hàng',
      'SHIPPING': 'Đang giao hàng',
      'DELIVERED': 'Giao hàng thành công',
      'FAILED': 'Giao hàng thất bại',
    };
    return statusMap[status] || status;
  };

  const isRealPlant = order.plan?.hasRealPlant;
  const isPremiumGift = order.plan?.hasGiftCard || order.plan?.hasPotCustom;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#2D3A33" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Mã đơn hàng</Text>
          <Text style={styles.value}>{order.orderCode}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Ngày đặt</Text>
          <Text style={styles.value}>{new Date(order.createdAt).toLocaleString('vi-VN')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Gói dịch vụ</Text>
          <Text style={styles.value}>{order.plan?.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Trạng thái đơn</Text>
          {renderStatus(order.status)}
        </View>
        {isRealPlant && (
          <View style={styles.row}>
            <Text style={styles.label}>Vận chuyển</Text>
            <Text style={styles.value}>{renderShippingStatus(order.shippingStatus)}</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Thanh toán</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Tạm tính</Text>
          <Text style={styles.value}>{order.subtotalAmount.toLocaleString('vi-VN')}đ</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phí vận chuyển</Text>
          <Text style={styles.value}>{order.shippingFee.toLocaleString('vi-VN')}đ</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={[styles.label, { fontWeight: 'bold' }]}>Tổng cộng</Text>
          <Text style={styles.totalAmount}>{order.totalAmount.toLocaleString('vi-VN')}đ</Text>
        </View>
      </View>

      {isRealPlant && order.recipientType !== 'SELF' && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin người nhận</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Tên</Text>
            <Text style={styles.value}>{order.recipientName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>SĐT</Text>
            <Text style={styles.value}>{order.recipientPhone}</Text>
          </View>
          <View style={styles.rowColumn}>
            <Text style={styles.label}>Địa chỉ</Text>
            <Text style={styles.valueText}>{order.recipientAddress}</Text>
          </View>
          {order.recipientNote && (
            <View style={styles.rowColumn}>
              <Text style={styles.label}>Ghi chú</Text>
              <Text style={styles.valueText}>{order.recipientNote}</Text>
            </View>
          )}
        </View>
      )}

      {isPremiumGift && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin quà tặng</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Chậu</Text>
            <Text style={styles.value}>{order.potCustomOption || 'Mặc định'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Đóng gói</Text>
            <Text style={styles.value}>{order.packagingOption || 'Mặc định'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Theme thiệp</Text>
            <Text style={styles.value}>{order.giftCardTheme || 'Mặc định'}</Text>
          </View>
          {order.giftMessage && (
            <View style={styles.rowColumn}>
              <Text style={styles.label}>Nội dung thiệp</Text>
              <Text style={[styles.valueText, { fontStyle: 'italic' }]}>"{order.giftMessage}"</Text>
            </View>
          )}
        </View>
      )}

      {order.status === 'PENDING' && (
        <View style={[styles.card, { backgroundColor: '#E8F3F0', borderColor: '#6B9080', borderWidth: 1 }]}>
          <Text style={styles.sectionTitle}>Hướng dẫn thanh toán</Text>
          <Text style={styles.instructionText}>Chuyển khoản với nội dung:</Text>
          <Text style={styles.transferCode}>MAM AN - {order.orderCode}</Text>
          <Text style={styles.note}>Mầm An sẽ xác nhận trong vòng 24h.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 10,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3A33',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3A33',
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3A33',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rowColumn: {
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
  valueText: {
    fontSize: 14,
    color: '#2D3A33',
    marginTop: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: 12,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B9080',
  },
  instructionText: {
    fontSize: 14,
    color: '#4A5D53',
    marginBottom: 8,
  },
  transferCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B9080',
    textAlign: 'center',
    marginVertical: 12,
  },
  note: {
    fontSize: 14,
    color: '#6B9080',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
