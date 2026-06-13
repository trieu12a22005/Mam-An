import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useMyOrders } from '../src/hooks/useOrders';
import { OrderStatus } from '../src/types/order.type';

export default function MyOrdersScreen() {
  const router = useRouter();
  const { data: orders, isLoading } = useMyOrders();

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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B9080" />
      </View>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/packages')}>
          <Text style={styles.buttonText}>Khám phá các gói dịch vụ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: 'transparent', marginTop: 10 }]} onPress={() => router.replace('/')}>
          <Text style={[styles.buttonText, { color: '#6B9080' }]}>Trở về vườn</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Đơn hàng của tôi</Text>
        <TouchableOpacity style={styles.returnButton} onPress={() => router.replace('/')}>
          <Text style={styles.returnButtonText}>Trở về vườn</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderCode}>{item.orderCode}</Text>
              {renderStatus(item.status)}
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.planName}>{item.plan?.name}</Text>
              <Text style={styles.totalAmount}>{item.totalAmount.toLocaleString('vi-VN')}đ</Text>
              <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
            </View>
            <TouchableOpacity 
              style={styles.detailButton}
              onPress={() => router.push(`/order-detail/${item.id}`)}
            >
              <Text style={styles.detailButtonText}>Xem chi tiết</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#4A5D53',
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3A33',
  },
  returnButton: {
    backgroundColor: '#E8F3F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  returnButtonText: {
    color: '#6B9080',
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    paddingBottom: 12,
    marginBottom: 12,
  },
  orderCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3A33',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3A33',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B9080',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#A4C3B2',
  },
  detailButton: {
    backgroundColor: '#E8F3F0',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  detailButtonText: {
    color: '#6B9080',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#6B9080',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
