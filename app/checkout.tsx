import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlanCode, GiftRecipientType } from '../src/types/plan.type';
import { useCreateOrder, useSubscribeVirtualPlus } from '../src/hooks/useOrders';
import { Home } from 'lucide-react-native';

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { planCode } = useLocalSearchParams<{ planCode: PlanCode }>();
  
  const createOrderMutation = useCreateOrder();
  const subscribeVirtualPlusMutation = useSubscribeVirtualPlus();

  const [recipientType, setRecipientType] = useState<GiftRecipientType>('SELF');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientNote, setRecipientNote] = useState('');

  // Premium Gift options
  const [giftMessage, setGiftMessage] = useState('');
  const [giftCardTheme, setGiftCardTheme] = useState('Bình yên');
  const [potCustomOption, setPotCustomOption] = useState('Mặc định');
  const [packagingOption, setPackagingOption] = useState('Gói giấy kraft');

  const handleVirtualPlusCheckout = () => {
    subscribeVirtualPlusMutation.mutate(undefined, {
      onSuccess: (data) => {
        router.replace({ pathname: '/order-success', params: { orderId: data.id } });
      },
      onError: (error) => {
        Alert.alert('Lỗi', 'Không thể tạo yêu cầu nâng cấp: ' + error.message);
      }
    });
  };

  const handleRealPlantCheckout = () => {
    if (recipientType !== 'SELF' && (!recipientName || !recipientPhone || !recipientAddress)) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin người nhận.');
      return;
    }

    createOrderMutation.mutate({
      planCode,
      recipientType,
      recipientName,
      recipientPhone,
      recipientAddress,
      recipientNote,
      ...(planCode === 'SUNFLOWER_PREMIUM_GIFT' && {
        giftMessage,
        giftCardTheme,
        potCustomOption,
        packagingOption,
      })
    }, {
      onSuccess: (data) => {
        router.replace({ pathname: '/order-success', params: { orderId: data.id } });
      },
      onError: (error) => {
        Alert.alert('Lỗi', 'Không thể tạo đơn hàng: ' + error.message);
      }
    });
  };

  const isVirtualPlus = planCode === 'VIRTUAL_PLUS';
  const isPremiumGift = planCode === 'SUNFLOWER_PREMIUM_GIFT';
  const isRealPlant = planCode === 'SUNFLOWER_COMPANION' || isPremiumGift;
  const isLoading = createOrderMutation.isPending || subscribeVirtualPlusMutation.isPending;

  if (isVirtualPlus) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.replace('/')} style={styles.homeBtn}>
            <Home color="#2D3A33" size={24} />
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Nâng cấp Mầm Ảo Plus</Text>
          <Text style={styles.subtitle}>Bạn đang yêu cầu nâng cấp tài khoản lên gói Mầm Ảo Plus.</Text>
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleVirtualPlusCheckout}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Tạo yêu cầu nâng cấp</Text>}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isRealPlant) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 20, 40) }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.replace('/')} style={styles.homeBtn}>
            <Home color="#2D3A33" size={24} />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Thông tin đơn hàng</Text>
        
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
              <TextInput style={styles.input} placeholder="Tên người nhận" value={recipientName} onChangeText={setRecipientName} />
              <TextInput style={styles.input} placeholder="Số điện thoại" keyboardType="phone-pad" value={recipientPhone} onChangeText={setRecipientPhone} />
              <TextInput style={styles.input} placeholder="Địa chỉ giao hàng" multiline value={recipientAddress} onChangeText={setRecipientAddress} />
              <TextInput style={styles.input} placeholder="Ghi chú giao hàng" multiline value={recipientNote} onChangeText={setRecipientNote} />
            </View>
          )}
        </View>

        {isPremiumGift && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Tùy chọn Quà tặng (Premium Gift)</Text>
            
            <TextInput 
              style={[styles.input, { height: 80 }]} 
              placeholder="Nội dung thiệp nhắn gửi..." 
              multiline 
              value={giftMessage} 
              onChangeText={setGiftMessage} 
            />

            <Text style={styles.label}>Theme thiệp</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {['Bình yên', 'Hy vọng', 'Yêu thương', 'Cố gắng'].map(theme => (
                <TouchableOpacity key={theme} style={[styles.pill, giftCardTheme === theme && styles.pillActive]} onPress={() => setGiftCardTheme(theme)}>
                  <Text style={[styles.pillText, giftCardTheme === theme && styles.pillTextActive]}>{theme}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Tùy chọn chậu</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {['Mặc định', 'Pastel xanh', 'Pastel vàng', 'Tự chọn sau'].map(pot => (
                <TouchableOpacity key={pot} style={[styles.pill, potCustomOption === pot && styles.pillActive]} onPress={() => setPotCustomOption(pot)}>
                  <Text style={[styles.pillText, potCustomOption === pot && styles.pillTextActive]}>{pot}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Đóng gói</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {['Gói giấy kraft', 'Gói pastel', 'Hộp quà'].map(pack => (
                <TouchableOpacity key={pack} style={[styles.pill, packagingOption === pack && styles.pillActive]} onPress={() => setPackagingOption(pack)}>
                  <Text style={[styles.pillText, packagingOption === pack && styles.pillTextActive]}>{pack}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleRealPlantCheckout}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Tạo đơn hàng</Text>}
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9F7',
  },
  content: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 20,
  },
  homeBtn: {
    padding: 8,
    backgroundColor: '#E8F3F0',
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3A33',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4A5D53',
    textAlign: 'center',
    marginBottom: 24,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3A33',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F6F9F7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2D3A33',
    marginBottom: 12,
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B9080',
    marginBottom: 8,
    marginTop: 12,
  },
  horizontalScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F6F9F7',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  pillActive: {
    backgroundColor: '#6B9080',
    borderColor: '#6B9080',
  },
  pillText: {
    color: '#4A5D53',
    fontSize: 14,
  },
  pillTextActive: {
    color: '#FFF',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#6B9080',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#A4C3B2',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
