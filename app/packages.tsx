import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { usePlans, useMyCurrentPlan } from '../src/hooks/usePlans';
import { PlanCode, ServicePlan } from '../src/types/plan.type';
import { useRouter } from 'expo-router';
import { CheckCircle, Home } from 'lucide-react-native';
import { Companion } from '../src/components/common/Companion';

export default function PackagesScreen() {
  const router = useRouter();
  const { data: plans, isLoading: isPlansLoading } = usePlans();
  const { data: myPlanData, isLoading: isMyPlanLoading } = useMyCurrentPlan();

  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnim]);

  const isLoading = isPlansLoading || isMyPlanLoading;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B9080" />
      </View>
    );
  }

  const handleSelectPlan = (planCode: PlanCode) => {
    if (planCode === 'FREE') return;
    router.push({ pathname: '/checkout', params: { planCode } });
  };

  const getPlanFeatures = (plan: ServicePlan) => {
    switch (plan.code) {
      case 'FREE':
        return [
          'Cây ảo',
          'Nhiệm vụ nhận tài nguyên',
          'Nhật ký cảm xúc',
          'Chia sẻ cộng đồng',
          `${plan.includedSongs} bài nhạc miễn phí`,
        ];
      case 'VIRTUAL_PLUS':
        return [
          'Tất cả tính năng Free',
          `${plan.includedSongs} bài nhạc miễn phí`,
          'AI phản hồi nhật ký',
          'Thống kê cảm xúc',
          'Gợi ý task theo tâm trạng',
        ];
      case 'SUNFLOWER_COMPANION':
        return [
          'Cây ảo liên kết cây thật',
          'Nhà vườn cập nhật ảnh 4–5 ngày/lần',
          'Bao ship',
          'Có thể gửi về hoặc gửi tặng',
          `${plan.includedSongs} bài nhạc miễn phí`,
        ];
      case 'SUNFLOWER_PREMIUM_GIFT':
        return [
          'Tất cả gói Đồng Hành',
          'Custom chậu',
          'Thiệp lời nhắn',
          'Chọn theme thiệp',
          'Đóng gói quà',
          `${plan.includedSongs} bài nhạc miễn phí`,
        ];
      default:
        return [];
    }
  };

  const getPlanButtonText = (planCode: PlanCode, isCurrent: boolean) => {
    if (isCurrent && planCode === 'FREE') return 'Đang sử dụng';
    if (planCode === 'FREE') return 'Bắt đầu miễn phí';
    if (planCode === 'VIRTUAL_PLUS') return 'Nâng cấp Plus';
    if (planCode === 'SUNFLOWER_COMPANION') return 'Chọn gói này';
    if (planCode === 'SUNFLOWER_PREMIUM_GIFT') return 'Tạo món quà';
    return 'Chọn';
  };

  const renderPlanCard = (plan: ServicePlan) => {
    const isCurrent = myPlanData?.plan.code === plan.code;
    const isRecommended = plan.code === 'SUNFLOWER_COMPANION';
    const isGift = plan.code === 'SUNFLOWER_PREMIUM_GIFT';
    const isFree = plan.code === 'FREE';

    return (
      <View 
        key={plan.id} 
        style={[
          styles.card, 
          isRecommended && styles.recommendedCard,
          isFree && styles.cardCompact,
        ]}
      >
        {!isFree && (
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: 16,
                borderWidth: 3,
                borderColor: isRecommended ? '#F6C177' : '#A4C3B2',
                opacity: glowAnim,
              },
            ]}
          />
        )}
        {isRecommended && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>Gói khuyên dùng</Text>
          </View>
        )}
        {isGift && (
          <View style={[styles.badgeContainer, { backgroundColor: '#FFB5A7' }]}>
            <Text style={styles.badgeText}>Quà tặng</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <Text style={styles.planName}>{isRecommended && '🌻 '}{plan.name}</Text>
          {isCurrent && (
            <View style={styles.inlineBadge}>
              <Text style={styles.inlineBadgeText}>Gói hiện tại</Text>
            </View>
          )}
        </View>

        <Text style={[styles.planPrice, isFree && styles.planPriceCompact]}>
          {plan.price === 0 ? '0đ' : `${plan.price.toLocaleString('vi-VN')}đ${plan.durationDays ? '/tháng' : '/hoa'}`}
        </Text>
        
        <View style={[styles.featuresContainer, isFree && styles.featuresContainerCompact]}>
          {getPlanFeatures(plan).map((feature, idx) => (
            <View key={idx} style={[styles.featureRow, isFree && styles.featureRowCompact]}>
              <CheckCircle size={isFree ? 16 : 20} color="#6B9080" />
              <Text style={[styles.featureText, isFree && styles.featureTextCompact]}>{feature}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            isFree && styles.buttonCompact,
            isCurrent && styles.buttonDisabled,
            isRecommended && styles.buttonRecommended,
          ]}
          disabled={isCurrent || isFree}
          onPress={() => handleSelectPlan(plan.code)}
        >
          <Text style={[styles.buttonText, isFree && styles.buttonTextCompact, isRecommended && styles.buttonTextRecommended]}>
            {getPlanButtonText(plan.code, isCurrent)}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.homeBtn} onPress={() => router.push('/(tabs)/home' as any)}>
          <Home size={22} color="#2D3A33" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Companion context="upgrade_companion" style={{ marginBottom: 16 }} />
      <Text style={styles.title}>Chọn hành trình phù hợp với bạn</Text>
      <Text style={styles.subtitle}>
        Bắt đầu miễn phí với cây ảo, hoặc nâng cấp để có một bé hoa thật được nhà vườn chăm sóc mỗi ngày 🌱
      </Text>

      {plans?.map(renderPlanCard)}
      </ScrollView>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 50, // SafeArea roughly
    paddingBottom: 4,
    zIndex: 10,
  },
  homeBtn: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  content: {
    padding: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3A33',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B9080',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  cardCompact: {
    padding: 16,
    marginBottom: 16,
  },
  recommendedCard: {
    borderColor: '#F6C177',
    borderWidth: 2,
    backgroundColor: '#FFF9E6',
  },
  badgeContainer: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: '#F6C177',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
    marginTop: 8,
  },
  inlineBadge: {
    backgroundColor: '#EAEAEA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  inlineBadgeText: {
    color: '#6B9080',
    fontSize: 10,
    fontWeight: '700',
  },
  planName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3A33',
    textAlign: 'center',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B9080',
    textAlign: 'center',
    marginBottom: 20,
  },
  planPriceCompact: {
    fontSize: 20,
    marginBottom: 16,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featuresContainerCompact: {
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureRowCompact: {
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#4A5D53',
    marginLeft: 8,
    flex: 1,
  },
  featureTextCompact: {
    fontSize: 13,
  },
  button: {
    backgroundColor: '#CCE3DE',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonCompact: {
    paddingVertical: 10,
    borderRadius: 20,
  },
  buttonRecommended: {
    backgroundColor: '#6B9080',
  },
  buttonDisabled: {
    backgroundColor: '#EAEAEA',
  },
  buttonText: {
    color: '#2D3A33',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextRecommended: {
    color: '#FFFFFF',
  },
});
