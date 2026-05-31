import React, { useEffect, useRef } from 'react';
import {
  Modal, View, StyleSheet, Animated, TouchableWithoutFeedback, Image, Text as RNText,
} from 'react-native';
import { AppText as Text } from '../common/AppText';
import { RESOURCES } from '../../constants/resources';
import { PlantResourceType } from '../../types/plant.type';

// ── Image map cho từng loại vật phẩm ─────────────────────────────────────────
const RESOURCE_IMAGE: Partial<Record<PlantResourceType, any>> = {
  FERTILIZER: require('../../../assets/phan_bon.png'),
  DEW: require('../../../assets/suong_mai.png'),
};

const RESOURCE_EMOJI: Record<string, string> = {
  WATER: '💧', SUNLIGHT: '☀️', FERTILIZER: '🌿',
  AIR: '🌬️', LOVE: '💚', DEW: '✨',
};

// ── Lời cảm ơn từ cây (random theo resource) ─────────────────────────────────
const WATER_THANKS = [
  "Cảm ơn bạn đã tưới nước cho mình, hôm nay mình thấy dễ chịu hơn nhiều rồi 💧",
  "Một chút nước từ bạn làm mình tỉnh táo hơn hẳn đó 🌱",
  "Mình nhận được nước rồi nè, cảm ơn bạn đã nhớ đến mình 💚",
  "Nhờ bạn tưới nước, mình có thêm sức để lớn lên từng chút một.",
  "Giọt nước hôm nay thật mát lành, cảm ơn bạn nhé 💧",
  "Bạn vừa cho mình một chút dịu mát, mình vui lắm.",
  "Cảm ơn bạn, mình sẽ dùng giọt nước này để lớn thêm một chút.",
  "Nước đã tới rồi, hôm nay mình thấy được chăm sóc nhiều hơn 🌿",
];
const SUNLIGHT_THANKS = [
  "Cảm ơn bạn đã mang ánh sáng đến cho mình, mình thấy ấm áp hơn rồi ☀️",
  "Một chút ánh sáng hôm nay làm mình muốn vươn cao hơn.",
  "Nhờ ánh sáng của bạn, khu vườn nhỏ sáng lên một chút rồi đó 🌼",
  "Mình nhận được nắng rồi, cảm ơn bạn đã tiếp thêm năng lượng cho mình.",
  "Ánh sáng này dịu quá, mình sẽ lớn lên thật chậm rãi cùng bạn.",
  "Cảm ơn bạn, hôm nay mình thấy có thêm hy vọng để nở hoa.",
  "Bạn vừa gửi cho mình một tia nắng nhỏ, mình quý lắm ☀️",
  "Mình sẽ giữ lại ánh sáng này cho hành trình hôm nay nhé.",
];
const FERTILIZER_THANKS = [
  "Cảm ơn bạn đã bón phân cho mình, mình có thêm dinh dưỡng rồi 🌱",
  "Mình nhận được phân bón rồi nè, rễ của mình sẽ khỏe hơn từng chút.",
  "Nhờ bạn chăm sóc, mình có thêm sức để phát triển mạnh mẽ hơn.",
  "Một chút phân bón hôm nay giúp mình lớn lên vững vàng hơn.",
  "Cảm ơn bạn, mình sẽ dùng nguồn dinh dưỡng này thật tốt.",
  "Bạn vừa tiếp thêm cho mình một nền tảng thật ấm áp để lớn lên.",
  "Mình thấy khỏe hơn rồi, cảm ơn bạn đã chăm mình kỹ như vậy.",
  "Phân bón đã tới rồi, mình sẽ cố gắng ra thêm lá mới nhé 🌿",
];
const AIR_THANKS = [
  "Cảm ơn bạn đã mang không khí trong lành đến cho mình 🍃",
  "Một làn gió nhẹ làm mình thấy dễ thở hơn rồi.",
  "Mình nhận được không khí rồi, hôm nay mọi thứ nhẹ nhàng hơn một chút.",
  "Nhờ bạn, mình có thêm một khoảng thở thật dịu.",
  "Không khí này trong lành quá, cảm ơn bạn đã chia sẻ với mình.",
  "Mình sẽ hít thở thật chậm cùng bạn nhé 🍃",
  "Bạn vừa gửi cho mình một làn gió nhỏ, mình thấy bình yên hơn.",
  "Cảm ơn bạn, mình thấy khu vườn hôm nay thoáng đãng hơn rồi.",
];
const LOVE_THANKS = [
  "Cảm ơn bạn đã gửi yêu thương cho mình, mình thấy ấm lòng lắm 💚",
  "Mình nhận được yêu thương rồi nè, hôm nay mình vui hơn một chút.",
  "Một chút yêu thương từ bạn làm mình muốn nở hoa thật đẹp.",
  "Cảm ơn bạn đã dịu dàng với mình và với chính bạn hôm nay.",
  "Yêu thương này quý lắm, mình sẽ giữ thật kỹ trong khu vườn nhỏ.",
  "Nhờ bạn, mình thấy mình không lớn lên một mình nữa.",
  "Bạn vừa gửi cho mình một điều rất ấm áp, cảm ơn bạn nhé.",
  "Mình nhận được trái tim nhỏ của bạn rồi, hôm nay thật đáng nhớ 💚",
];
const DEW_THANKS = [
  "Cảm ơn bạn đã gửi giọt sương mai cho mình, thật dịu dàng quá 🌿",
  "Một chút sương mai làm mình thấy ngày mới nhẹ hơn nhiều.",
  "Mình nhận được sương rồi nè, cảm xúc của bạn cũng được mình trân trọng.",
  "Giọt sương hôm nay trong veo quá, cảm ơn bạn đã chia sẻ với mình.",
  "Cảm ơn bạn, mình sẽ giữ giọt sương này như một điều nhỏ bình yên.",
  "Sương mai đã chạm vào lá rồi, mình thấy mát lành hơn.",
  "Bạn vừa cho mình một khoảnh khắc thật nhẹ, mình biết ơn lắm.",
  "Mình nhận được giọt sương từ bạn rồi, hôm nay cứ chậm rãi thôi nhé.",
];

const THANK_YOU_POOL: Record<PlantResourceType, { title: string; messages: string[] }> = {
  WATER:      { title: 'Cây cảm ơn bạn! 💧',              messages: WATER_THANKS },
  SUNLIGHT:   { title: 'Cây tắm nắng rồi! ☀️',            messages: SUNLIGHT_THANKS },
  FERTILIZER: { title: 'Cây được bổ sung dinh dưỡng! 🌿', messages: FERTILIZER_THANKS },
  AIR:        { title: 'Cây thở dễ hơn rồi! 🌬️',         messages: AIR_THANKS },
  LOVE:       { title: 'Cây nhận được tình yêu! 💚',       messages: LOVE_THANKS },
  DEW:        { title: 'Sương mai tươi mát! ✨',            messages: DEW_THANKS },
};

const pickThankYou = (resource: PlantResourceType): { title: string; message: string } => {
  const pool = THANK_YOU_POOL[resource];
  const message = pool.messages[Math.floor(Math.random() * pool.messages.length)]!;
  return { title: pool.title, message };
};

// ── Confetti particle ─────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#A8D5BA', '#B5E3C4', '#FFE0A3', '#D4EDDA', '#C3E6CB', '#FFF3CD', '#D1ECF1', '#BEE5EB'];

const ConfettiParticle: React.FC<{ delay: number; color: string; startX: number }> = ({
  delay, color, startX,
}) => {
  const translateY = useRef(new Animated.Value(-20)).current;
  const translateX = useRef(new Animated.Value(startX)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 320, duration: 1400, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: startX + (Math.random() - 0.5) * 140, duration: 1400, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 3, duration: 1400, useNativeDriver: true }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 3], outputRange: ['0deg', '1080deg'] });

  return (
    <Animated.View
      style={[
        confettiStyles.particle,
        {
          backgroundColor: color,
          transform: [{ translateY }, { translateX }, { rotate: spin }, { scale }],
          opacity,
        },
      ]}
    />
  );
};

const confettiStyles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: 0,
    width: 8,
    height: 8,
    borderRadius: 2,
  },
});

// ── Floating emoji particle (từ cây) ─────────────────────────────────────────
const FloatParticle: React.FC<{ emoji: string; startX: number; delay: number }> = ({
  emoji, startX, delay,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1.2, friction: 3, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -90, duration: 1400, useNativeDriver: true }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[
      floatStyles.particle,
      { transform: [{ translateY }, { translateX: startX }, { scale }], opacity },
    ]}>
      <RNText style={floatStyles.emoji}>{emoji}</RNText>
    </Animated.View>
  );
};

const floatStyles = StyleSheet.create({
  particle: { position: 'absolute', bottom: 40 },
  emoji: { fontSize: 24 },
});

// ── Reward Modal ──────────────────────────────────────────────────────────────
interface RewardModalProps {
  visible: boolean;
  resourceType: PlantResourceType;
  resourceAmount: number;
  taskTitle: string;
  onClose: () => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  visible, resourceType, resourceAmount, onClose,
}) => {
  const cardScale = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const charBounce = useRef(new Animated.Value(0)).current;
  const charScale = useRef(new Animated.Value(0)).current;
  const itemBounce = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(20)).current;

  const resource = RESOURCES[resourceType];
  const image = RESOURCE_IMAGE[resourceType];
  const emoji = RESOURCE_EMOJI[resourceType] ?? '🎁';
  const thankYou = pickThankYou(resourceType);

  useEffect(() => {
    if (visible) {
      // Reset tất cả
      cardScale.setValue(0);
      cardOpacity.setValue(0);
      charBounce.setValue(30);
      charScale.setValue(0);
      itemBounce.setValue(0);
      glowAnim.setValue(0);
      textFade.setValue(0);
      textSlide.setValue(20);

      // Card pop in
      Animated.parallel([
        Animated.spring(cardScale, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        // Nhân vật nhảy vào
        Animated.parallel([
          Animated.spring(charScale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
          Animated.spring(charBounce, { toValue: 0, friction: 5, tension: 80, useNativeDriver: true }),
        ]).start(() => {
          Animated.loop(
            Animated.sequence([
              Animated.timing(charBounce, { toValue: -8, duration: 600, useNativeDriver: true }),
              Animated.timing(charBounce, { toValue: 0, duration: 600, useNativeDriver: true }),
            ]),
          ).start();
        });

        // Text lời cảm ơn fade+slide lên
        Animated.parallel([
          Animated.timing(textFade, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(textSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();

        // Vật phẩm bounce
        Animated.loop(
          Animated.sequence([
            Animated.timing(itemBounce, { toValue: -8, duration: 600, useNativeDriver: true }),
            Animated.timing(itemBounce, { toValue: 0, duration: 600, useNativeDriver: true }),
          ]),
          { iterations: 8 },
        ).start();

        // Glow pulse
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(glowAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
          ]),
          { iterations: 10 },
        ).start();
      });
    }
  }, [visible]);

  const glowScale = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.6] });

  // Số lượng particles theo resource
  const floatEmojis = Array.from({ length: 6 }, (_, i) => ({
    emoji,
    startX: (i - 2.5) * 22,
    delay: i * 120,
  }));

  const confettiItems = Array.from({ length: 18 }, (_, i) => ({
    delay: i * 60,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    startX: (i - 9) * 18,
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[styles.card, { transform: [{ scale: cardScale }], opacity: cardOpacity }]}
            >
              {/* Confetti */}
              <View style={styles.confettiContainer} pointerEvents="none">
                {confettiItems.map((c, i) => (
                  <ConfettiParticle key={i} delay={c.delay} color={c.color} startX={c.startX} />
                ))}
              </View>

              {/* Floating emojis từ vật phẩm */}
              <View style={styles.floatContainer} pointerEvents="none">
                {floatEmojis.map((f, i) => (
                  <FloatParticle key={i} emoji={f.emoji} startX={f.startX} delay={f.delay} />
                ))}
              </View>

              {/* Nhân vật happy */}
              <Animated.Image
                source={require('../../../assets/happy.png')}
                style={[
                  styles.character,
                  { borderColor: resource.color + 'AA' },
                  { transform: [{ translateY: charBounce }, { scale: charScale }] },
                ]}
                resizeMode="cover"
              />

              {/* Lời cảm ơn từ cây — bubble nhỏ */}
              <Animated.View
                style={[
                  styles.thankBubble,
                  { opacity: textFade, transform: [{ translateY: textSlide }] },
                ]}
              >
                <Text style={styles.thankTitle}>{thankYou.title}</Text>
                <Text style={styles.thankMsg}>{thankYou.message}</Text>
              </Animated.View>

              {/* Vật phẩm + glow */}
              <View style={styles.itemWrapper}>
                <Animated.View
                  style={[
                    styles.glowRing,
                    {
                      backgroundColor: resource.color + '30',
                      borderColor: resource.color + '70',
                      transform: [{ scale: glowScale }],
                      opacity: glowOpacity,
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.itemCircle,
                    {
                      backgroundColor: resource.color + '22',
                      borderColor: resource.color,
                      transform: [{ translateY: itemBounce }],
                    },
                  ]}
                >
                  {image ? (
                    <Image source={image} style={styles.itemImage} resizeMode="cover" />
                  ) : (
                    <RNText style={styles.itemEmoji}>{emoji}</RNText>
                  )}
                </Animated.View>
              </View>

              {/* Số lượng phần thưởng */}
              <View style={[styles.amountPill, { backgroundColor: resource.color + '18', borderColor: resource.color + '60' }]}>
                <RNText style={[styles.amountText, { color: resource.color }]}>
                  +{resourceAmount} {resource.label}
                </RNText>
              </View>

              {/* Nút đóng */}
              <Text style={styles.tapClose}>Nhấn bất kỳ đâu để tiếp tục</Text>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FDFFFE',
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 20,
    alignItems: 'center',
    width: 300,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 28,
  },
  floatContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
    width: '100%',
  },

  // Nhân vật
  character: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
  },

  // Lời cảm ơn từ cây
  thankBubble: {
    backgroundColor: '#F0FAF4',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C8E6D4',
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
    gap: 4,
  },
  thankTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D6A4F',
    textAlign: 'center',
  },
  thankMsg: {
    fontSize: 13,
    color: '#40826D',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Vật phẩm
  itemWrapper: {
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
  },
  itemCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  itemImage: { width: 84, height: 84, borderRadius: 42 },
  itemEmoji: { fontSize: 44 },

  // Số lượng
  amountPill: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '800',
  },

  tapClose: {
    fontSize: 11,
    color: '#ABABAB',
    marginTop: 4,
  },
});
