import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Animated, StyleSheet, Text as RNText } from 'react-native';
import { PlantResourceType } from '../../types/plant.type';

// ── Config hiệu ứng theo loại tài nguyên ─────────────────────────────────────
const EFFECT_CONFIG: Record<PlantResourceType, {
  emoji: string;
  particles: string[];  // emoji đa dạng để tạo cảm giác thật hơn
  color: string;
  count: number;        // số hạt
  spread: number;       // độ rộng lan ra
  height: number;       // chiều cao bay lên
  style: 'rain' | 'burst' | 'float' | 'swirl';
}> = {
  WATER: {
    emoji: '💧',
    particles: ['💧', '💧', '🌊', '💦', '💧'],
    color: '#3B82F6',
    count: 7,
    spread: 28,
    height: 90,
    style: 'rain',
  },
  SUNLIGHT: {
    emoji: '☀️',
    particles: ['☀️', '✨', '🌟', '💛', '⭐'],
    color: '#F59E0B',
    count: 8,
    spread: 35,
    height: 100,
    style: 'burst',
  },
  FERTILIZER: {
    emoji: '🌿',
    particles: ['🌿', '🍃', '🌱', '🌿', '🍀'],
    color: '#10B981',
    count: 6,
    spread: 24,
    height: 80,
    style: 'float',
  },
  AIR: {
    emoji: '🌬️',
    particles: ['🌬️', '💨', '🌀', '💨', '🌬️'],
    color: '#60A5FA',
    count: 6,
    spread: 40,
    height: 110,
    style: 'swirl',
  },
  LOVE: {
    emoji: '💚',
    particles: ['💚', '💕', '✨', '💚', '🌸'],
    color: '#EC4899',
    count: 7,
    spread: 30,
    height: 95,
    style: 'burst',
  },
  DEW: {
    emoji: '✨',
    particles: ['✨', '🌟', '💎', '✨', '⭐'],
    color: '#8B5CF6',
    count: 8,
    spread: 32,
    height: 100,
    style: 'float',
  },
};

// ── Particle theo từng style ───────────────────────────────────────────────────
interface ParticleProps {
  emoji: string;
  delay: number;
  startX: number;
  config: typeof EFFECT_CONFIG[PlantResourceType];
  index: number;
  total: number;
}

const Particle: React.FC<ParticleProps> = ({ emoji, delay, startX, config, index, total }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(startX)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(0.3)).current;
  const rotate     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Tính toán hướng bay theo style
    let targetX = startX;
    let targetY = -config.height;

    if (config.style === 'burst') {
      // Bắn ra tất cả hướng như pháo hoa
      const angle = (index / total) * Math.PI * 2;
      targetX = startX + Math.cos(angle) * config.spread;
      targetY = -config.height * 0.6 + Math.sin(angle) * 30;
    } else if (config.style === 'swirl') {
      // Xoáy ra bên
      targetX = startX + (index % 2 === 0 ? config.spread : -config.spread);
    } else if (config.style === 'rain') {
      // Rơi thẳng rồi lan nhẹ
      targetX = startX + (Math.random() - 0.5) * config.spread;
    } else {
      // float — lơ lửng nhẹ nhàng
      targetX = startX + (Math.random() - 0.5) * config.spread * 0.7;
    }

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.spring(scale, {
          toValue: 1.1,
          friction: 3,
          tension: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: targetY,
          duration: 1000 + Math.random() * 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: targetX,
          duration: 1000 + Math.random() * 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: config.style === 'swirl' ? 2 : 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(600),
          Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 2],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          transform: [{ translateY }, { translateX }, { scale }, { rotate: spin }],
          opacity,
        },
      ]}
    >
      <RNText style={styles.particleEmoji}>{emoji}</RNText>
    </Animated.View>
  );
};

// ── Ripple ring effect ─────────────────────────────────────────────────────────
const RippleRing: React.FC<{ color: string; delay: number }> = ({ color, delay }) => {
  const scale   = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(scale, { toValue: 3, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.ripple,
        { borderColor: color, transform: [{ scale }], opacity },
      ]}
    />
  );
};

// ── Component chính ───────────────────────────────────────────────────────────
export interface CareEffectHandle {
  trigger: (resourceType: PlantResourceType) => void;
}

interface CareEffectProps {}

export const CareEffect = forwardRef<CareEffectHandle, CareEffectProps>(
  (_, ref) => {
    const [effects, setEffects] = React.useState<
      { id: number; type: PlantResourceType }[]
    >([]);
    const counter = useRef(0);

    useImperativeHandle(ref, () => ({
      trigger: (resourceType: PlantResourceType) => {
        const id = counter.current++;
        setEffects((prev) => [...prev, { id, type: resourceType }]);
        setTimeout(() => {
          setEffects((prev) => prev.filter((e) => e.id !== id));
        }, 1800);
      },
    }));

    return (
      <View style={styles.container} pointerEvents="none">
        {effects.map(({ id, type }) => {
          const config = EFFECT_CONFIG[type];
          return (
            <React.Fragment key={id}>
              {/* Ripple rings */}
              <RippleRing color={config.color} delay={0} />
              <RippleRing color={config.color} delay={200} />

              {/* Particles */}
              {Array.from({ length: config.count }).map((_, i) => (
                <Particle
                  key={`${id}-${i}`}
                  emoji={config.particles[i % config.particles.length]}
                  delay={i * 70}
                  startX={(i - Math.floor(config.count / 2)) * (config.spread / config.count * 2)}
                  config={config}
                  index={i}
                  total={config.count}
                />
              ))}
            </React.Fragment>
          );
        })}
      </View>
    );
  },
);

CareEffect.displayName = 'CareEffect';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    zIndex: 100,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    bottom: 0,
  },
  particleEmoji: {
    fontSize: 22,
  },
  ripple: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
  },
});
