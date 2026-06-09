import { AppText as Text } from './AppText';
import React, { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useTimeTheme } from '../../contexts/TimeThemeContext';

// ── Messages theo context ──────────────────────────────────────────────────────
export type CompanionContext =
  | 'no_plant'
  | 'has_tasks'
  | 'all_done'
  | 'loading'
  | 'greeting'
  | 'garden_update';

const MESSAGES: Record<CompanionContext, string[]> = {
  no_plant: [
    'Chào bạn! Mình là Mầm nè 🌱\nBạn chưa có cây nào — hãy chọn một loài hoa để bắt đầu nhé!',
    'Mình sẽ đồng hành cùng bạn suốt hành trình!\nBắt đầu bằng cách chọn một loài hoa bạn thích đi.',
    'Cây sẽ lớn lên cùng bạn mỗi ngày 🌼\nChọn hoa và mình sẽ nhắc bạn chăm sóc nó nhé!',
  ],
  has_tasks: [
    'Hôm nay mình làm một việc nhỏ thôi nhé 🌱',
    'Cây vẫn đang chờ bạn.\nMình cùng chăm nó một chút nhé 🌿',
    'Không cần vội — một bước nhỏ thôi cũng đủ rồi.',
    'Bạn đến rồi! Cây vui lắm 🌿',
  ],
  all_done: [
    'Bạn đã hoàn thành tất cả hôm nay! 🎊\nNghỉ ngơi và tận hưởng khoảnh khắc nào!',
    'Tuyệt vời lắm! Cây đang rất vui 🌻\nNgày mai mình lại cùng nhau nhé!',
    'Xuất sắc! Bạn xứng đáng nghỉ ngơi rồi 🌈\nHẹn gặp lại ngày mai!',
  ],
  loading: [
    'Đợi mình chút nha,\nđang đi tưới cây rồi quay lại ngay! 🚿',
    'Một chút thôi...\nmình đang kiểm tra vườn cho bạn 🔍',
  ],
  greeting: [
    'Chào buổi sáng! Một ngày mới tốt lành 🌅\nMình ở đây cùng bạn nhé!',
    'Hôm nay bạn thế nào? 😊\nMình luôn ở đây nếu cần!',
    'Lại đây rồi! Mình nhớ bạn lắm 💚\nCây cũng đang chờ bạn đấy!',
  ],
  garden_update: [
    'Nhà vườn vừa gửi ảnh mới nè! 📸\nXem cây của bạn đang lớn thế nào rồi!',
    'Cây thật của bạn đang phát triển tốt lắm! 🌿\nNhà vườn chăm sóc cẩn thận lắm đó.',
  ],
};

// ── Ảnh theo từng trạng thái ──────────────────────────────────────────────────
const CONTEXT_IMAGE: Record<CompanionContext, any> = {
  no_plant:      require('../../../assets/boring.png'),    // Buồn vì chưa có cây
  has_tasks:     require('../../../assets/character.jpg'), // Bình thường, sẵn sàng
  all_done:      require('../../../assets/happy.png'),     // Vui vẻ vì xong hết
  loading:       require('../../../assets/thinking.png'),  // Đang suy nghĩ/chờ
  greeting:      require('../../../assets/happy.png'),     // Chào đón vui vẻ
  garden_update: require('../../../assets/wow.png'),       // Ngạc nhiên/phấn khích
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function pickMessage(context: CompanionContext): string {
  const list = MESSAGES[context];
  return list[Math.floor(Math.random() * list.length)];
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface CompanionProps {
  context: CompanionContext;
  style?: object;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const Companion: React.FC<CompanionProps> = ({ context, style }) => {
  const { colors } = useTimeTheme();
  const [message, setMessage] = useState(() => pickMessage(context));

  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    setMessage(pickMessage(context));
  }, [context]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 400, useNativeDriver: true,
    }).start();

    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -6, duration: 800, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0,  duration: 800, useNativeDriver: true }),
      ]),
    );
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.02, duration: 1200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.98, duration: 1200, useNativeDriver: true }),
      ]),
    );
    bounce.start();
    pulse.start();
    return () => { bounce.stop(); pulse.stop(); };
  }, []);

  const handleTap = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setMessage(pickMessage(context));
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  };

  return (
    <View style={[styles.wrapper, style]}>
      {/* Speech bubble */}
      <Animated.View style={[styles.bubble, { backgroundColor: colors.surface, borderColor: colors.border, opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Text style={[styles.bubbleText, { color: colors.text }]}>{message}</Text>
        <View style={[styles.tail, { borderTopColor: colors.surface }]} />
      </Animated.View>

      {/* Character — ảnh thay đổi theo context */}
      <TouchableOpacity onPress={handleTap} activeOpacity={0.9}>
        <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
          <Image
            source={CONTEXT_IMAGE[context]}
            style={[styles.character, { borderColor: colors.primary }]}
            resizeMode="cover"
          />
        </Animated.View>
      </TouchableOpacity>

      <Text style={[styles.tapHint, { color: colors.textMuted }]}>Nhấn vào mình để nghe thêm 💬</Text>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 4,
  },
  bubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#DCEFE4',
    position: 'relative',
  },
  bubbleText: {
    fontSize: 13.5,
    color: COLORS.text.primary,
    lineHeight: 21,
    textAlign: 'center',
    fontWeight: '500',
  },
  tail: {
    position: 'absolute',
    bottom: -10,
    left: '50%',
    marginLeft: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.green.light,
  },
  character: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginTop: 8,
    borderWidth: 2.5,
    borderColor: COLORS.green.main,
  },
  tapHint: {
    fontSize: 11,
    color: '#6F8F78',
    marginTop: 4,
  },
});
