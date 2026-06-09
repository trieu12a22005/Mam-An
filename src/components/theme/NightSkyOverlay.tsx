import React, { useEffect, useRef, useMemo, useState } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ── Sinh vị trí sao ngẫu nhiên nhưng ổn định trong 1 lần mount ───────────────
function generateStars(count: number) {
  const stars: { x: number; y: number; size: number; opacity: number }[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * SCREEN_W,
      y: Math.random() * SCREEN_H * 0.7,
      size: Math.random() * 2.5 + 1.5, // 1.5–4px
      opacity: Math.random() * 0.35 + 0.15, // 0.15–0.5
    });
  }
  return stars;
}

// ── Component Sao Băng Độc Lập ────────────────────────────────────────────────
const ShootingStar: React.FC<{ minInterval: number; maxInterval: number; initialDelay: number }> = ({ 
  minInterval, maxInterval, initialDelay 
}) => {
  const shootingAnim = useRef(new Animated.Value(0)).current;
  const shootingOpacity = useRef(new Animated.Value(0)).current;
  const shootingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dùng state để random lại vị trí xuất phát cho mỗi lần bay
  const [startPos, setStartPos] = useState({ x: -100, y: -100 }); // Ẩn ban đầu

  const animateShooting = () => {
    // Random vị trí xuất phát từ nửa trên bên phải màn hình
    setStartPos({
      x: SCREEN_W * 0.5 + Math.random() * SCREEN_W * 0.5,
      y: SCREEN_H * 0.05 + Math.random() * SCREEN_H * 0.25,
    });

    shootingAnim.setValue(0);
    shootingOpacity.setValue(0);

    Animated.sequence([
      // Fade in
      Animated.timing(shootingOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      // Bay qua
      Animated.parallel([
        Animated.timing(shootingAnim, {
          toValue: 1,
          duration: 1050,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(800),
          Animated.timing(shootingOpacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  };

  const scheduleNextShooting = () => {
    const delay = minInterval + Math.random() * (maxInterval - minInterval);
    shootingTimeoutRef.current = setTimeout(() => {
      animateShooting();
      scheduleNextShooting();
    }, delay);
  };

  useEffect(() => {
    // Bắt đầu sao băng với khoảng delay ngẫu nhiên ban đầu
    shootingTimeoutRef.current = setTimeout(() => {
      animateShooting();
      scheduleNextShooting();
    }, initialDelay);

    return () => {
      if (shootingTimeoutRef.current) clearTimeout(shootingTimeoutRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Quãng đường bay của sao băng
  const travelX = -250;
  const travelY = 150;

  const translateX = shootingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, travelX],
  });
  const translateY = shootingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, travelY],
  });

  return (
    <Animated.View
      style={[
        styles.shooting,
        {
          left: startPos.x,
          top: startPos.y,
          opacity: shootingOpacity,
          transform: [{ translateX }, { translateY }, { rotate: '-25deg' }],
        },
      ]}
    />
  );
};

interface Props {
  intensity?: 'low' | 'normal';
}

export const NightSkyOverlay: React.FC<Props> = ({ intensity = 'normal' }) => {
  const starCount = intensity === 'low' ? 12 : 25;
  
  // Tăng tần suất sao băng xuất hiện để dễ có hiệu ứng nhiều sao cùng lúc
  const minInterval = intensity === 'low' ? 15_000 : 5_000;
  const maxInterval = intensity === 'low' ? 30_000 : 15_000;
  
  // Tạo số lượng sao băng hoạt động song song
  const shootingStarsCount = intensity === 'low' ? 2 : 4;

  // Ổn định vị trí sao giữa các render nhờ useMemo
  const stars = useMemo(() => generateStars(starCount), []); // eslint-disable-line react-hooks/exhaustive-deps

  // Tạo ra danh sách các sao băng độc lập với khoảng delay ban đầu khác nhau
  const shootingStars = useMemo(() => {
    return Array.from({ length: shootingStarsCount }).map((_, i) => (
      <ShootingStar 
        key={`shooting-${i}`} 
        minInterval={minInterval} 
        maxInterval={maxInterval} 
        // Initial delay lệch nhau để không bay cùng 1 lúc lúc mới vào
        initialDelay={2000 + Math.random() * 8000 + i * 3000} 
      />
    ));
  }, [shootingStarsCount, minInterval, maxInterval]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Sao tĩnh */}
      {stars.map((s, i) => (
        <View
          key={`star-${i}`}
          style={[
            styles.star,
            {
              left: s.x,
              top: s.y,
              width: s.size,
              height: s.size,
              borderRadius: s.size / 2,
              opacity: s.opacity,
            },
          ]}
        />
      ))}

      {/* Sao băng */}
      {shootingStars}
    </View>
  );
};

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  shooting: {
    position: 'absolute',
    width: 80,
    height: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
});
