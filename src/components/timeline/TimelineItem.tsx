import { AppText as Text } from '../common/AppText';
import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { PlantUpdate, PlantStatus } from '../../types/plant.type';
import { useTimeTheme } from '../../contexts/TimeThemeContext';
import { COLORS } from '../../constants/colors';
import { formatDate } from '../../utils/date';
import { PLANT_STAGES } from '../../constants/plantStages';
import { PlantFeedbackSection } from '../plant/PlantFeedbackSection';

// ── Config ───────────────────────────────────────────────────────────────────

const STATUS_EMOJI: Record<PlantStatus, string> = {
  SEED: '🌰', SPROUT: '🌱', GROWING: '🌿',
  BUDDING: '🌼', BLOOMING: '🌻', RESTING: '🍂',
};

// ── Image with fallback ───────────────────────────────────────────────────────

const TimelineImage: React.FC<{
  uri: string;
  fallbackEmoji: string;
  surfaceSoft: string;
  textMuted: string;
}> = ({
  uri, fallbackEmoji, surfaceSoft, textMuted,
}) => {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <View style={[styles.imagePlaceholder, { backgroundColor: surfaceSoft }]}>
        <Text style={styles.imageFallbackEmoji}>{fallbackEmoji}</Text>
        <Text style={[styles.imagePlaceholderText, { color: textMuted }]}>Ảnh chưa có</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[styles.image, { backgroundColor: surfaceSoft }]}
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
  realPlantId?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const TimelineItem: React.FC<TimelineItemProps> = ({
  update,
  isFirst = false,
  isLast = false,
  realPlantId,
}) => {
  const { colors } = useTimeTheme();
  const stageInfo = PLANT_STAGES[update.status];
  const stageEmoji = STATUS_EMOJI[update.status];
  const stageColor = COLORS.stages[update.status] ?? colors.primary;

  return (
    <View style={styles.row}>
      {/* ── Timeline track ── */}
      <View style={styles.track}>
        <View style={[styles.dot, { backgroundColor: stageColor }]}>
          <Text style={styles.dotEmoji}>{stageEmoji}</Text>
        </View>
        {!isLast && <View style={[styles.line, { backgroundColor: colors.border }]} />}
      </View>

      {/* ── Card & Feedback Area ── */}
      <View style={{ flex: 1, paddingBottom: isFirst ? 24 : 0 }}>
        {/* ── Card ── */}
        <View style={[
          styles.card,
          { backgroundColor: colors.surface },
          isFirst && { borderWidth: 1.5, borderColor: colors.primarySoft, marginBottom: 0 },
        ]}>
          {/* Image with error fallback */}
          <TimelineImage
            uri={update.imageUrl}
            fallbackEmoji={stageEmoji}
            surfaceSoft={colors.surfaceSoft}
            textMuted={colors.textMuted}
          />

          {/* Content */}
          <View style={styles.content}>
            {/* Status badge */}
            <View style={[styles.badge, { backgroundColor: stageColor + '22' }]}>
              <Text style={[styles.badgeText, { color: stageColor }]}>
                {stageInfo?.label ?? update.status}
              </Text>
            </View>

            {/* Date */}
            <Text style={[styles.date, { color: colors.textMuted }]}>
              {formatDate(update.createdAt, 'DD/MM/YYYY')}
            </Text>

            {/* Note */}
            {update.note && (
              <Text style={[styles.note, { color: colors.text }]}>{update.note}</Text>
            )}

            {/* Health note */}
            {update.healthNote && (
              <View style={[styles.healthBox, { backgroundColor: colors.surfaceSoft }]}>
                <Text style={[styles.healthLabel, { color: colors.primary }]}>🌿 Ghi chú từ nhà vườn</Text>
                <Text style={[styles.healthNote, { color: colors.text }]}>{update.healthNote}</Text>
              </View>
            )}

            {/* ── Feedback Section (Latest update only) ── */}
            {isFirst && realPlantId && (
              <View style={{ marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
                <PlantFeedbackSection plantId={realPlantId} updateDate={update.createdAt} />
              </View>
            )}
          </View>
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
    marginTop: 4,
    marginBottom: -8,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 180,
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imageFallbackEmoji: { fontSize: 56, opacity: 0.4 },
  imagePlaceholderText: { fontSize: 13 },
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
  date: { fontSize: 12 },
  note: {
    fontSize: 14,
    lineHeight: 22,
  },
  healthBox: {
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  healthLabel: { fontSize: 12, fontWeight: '600' },
  healthNote: { fontSize: 13, lineHeight: 20 },
});
