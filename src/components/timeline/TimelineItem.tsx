import { AppText as Text } from '../common/AppText';
import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { PlantUpdate, PlantStatus } from '../../types/plant.type';
import { COLORS } from '../../constants/colors';
import { formatDate } from '../../utils/date';
import { PLANT_STAGES } from '../../constants/plantStages';

// ── Config ───────────────────────────────────────────────────────────────────

const STATUS_EMOJI: Record<PlantStatus, string> = {
  SEED: '🌰', SPROUT: '🌱', GROWING: '🌿',
  BUDDING: '🌼', BLOOMING: '🌻', RESTING: '🍂',
};

// ── Image with fallback ───────────────────────────────────────────────────────

const TimelineImage: React.FC<{ uri: string; fallbackEmoji: string }> = ({
  uri, fallbackEmoji,
}) => {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imageFallbackEmoji}>{fallbackEmoji}</Text>
        <Text style={styles.imagePlaceholderText}>Ảnh chưa có</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={styles.image}
      resizeMode="cover"
      onError={() => setErrored(true)}
    />
  );
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface TimelineItemProps {
  update: PlantUpdate;
  isFirst?: boolean;
  isLast?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const TimelineItem: React.FC<TimelineItemProps> = ({
  update,
  isFirst = false,
  isLast = false,
}) => {
  const stageInfo = PLANT_STAGES[update.status];
  const stageEmoji = STATUS_EMOJI[update.status];
  const stageColor = COLORS.stages[update.status] ?? COLORS.green.main;

  return (
    <View style={styles.row}>
      {/* ── Timeline track ── */}
      <View style={styles.track}>
        <View style={[styles.dot, { backgroundColor: stageColor }]}>
          <Text style={styles.dotEmoji}>{stageEmoji}</Text>
        </View>
        {!isLast && <View style={styles.line} />}
      </View>

      {/* ── Card ── */}
      <View style={[styles.card, isFirst && styles.cardFirst]}>
        {/* Image with error fallback */}
        <TimelineImage uri={update.imageUrl} fallbackEmoji={stageEmoji} />

        {/* Content */}
        <View style={styles.content}>
          {/* Status badge */}
          <View style={[styles.badge, { backgroundColor: stageColor + '22' }]}>
            <Text style={[styles.badgeText, { color: stageColor }]}>
              {stageInfo?.label ?? update.status}
            </Text>
          </View>

          {/* Date */}
          <Text style={styles.date}>{formatDate(update.createdAt, 'DD/MM/YYYY')}</Text>

          {/* Note */}
          {update.note && (
            <Text style={styles.note}>{update.note}</Text>
          )}

          {/* Health note */}
          {update.healthNote && (
            <View style={styles.healthBox}>
              <Text style={styles.healthLabel}>🌿 Ghi chú từ nhà vườn</Text>
              <Text style={styles.healthNote}>{update.healthNote}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
    paddingLeft: 4,
  },
  track: {
    alignItems: 'center',
    width: 36,
    flexShrink: 0,
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  dotEmoji: { fontSize: 18 },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginTop: 4,
    marginBottom: -8,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardFirst: {
    borderWidth: 1.5,
    borderColor: COLORS.green.light,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.green[50],
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.green[50],
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imageFallbackEmoji: { fontSize: 56, opacity: 0.4 },
  imagePlaceholderText: { fontSize: 13, color: COLORS.text.muted },
  content: {
    padding: 14,
    gap: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  date: { fontSize: 12, color: COLORS.text.muted },
  note: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
  healthBox: {
    backgroundColor: COLORS.green[50],
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  healthLabel: { fontSize: 12, color: COLORS.green.dark, fontWeight: '600' },
  healthNote: { fontSize: 13, color: COLORS.text.secondary, lineHeight: 20 },
});
