import { AppText as Text } from '../common/AppText';
import React, { memo } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CommunityPost, CommunityReactionType } from '../../types/community.type';
import { useTimeTheme } from '../../contexts/TimeThemeContext';
import { formatRelativeTime } from '../../utils/date';

// ── Reaction config ────────────────────────────────────────────────────────────
const REACTIONS: { type: CommunityReactionType; image: any; label: string }[] = [
  { type: 'LOVE',   image: require('../../../assets/yeu_thuong.png'), label: 'Yêu thương' },
  { type: 'LIGHT',  image: require('../../../assets/mat_troi.png'),   label: 'Ánh sáng' },
  { type: 'SPROUT', image: require('../../../assets/image1.png'),      label: 'Cùng cố gắng' },
  { type: 'HUG',    image: require('../../../assets/suong_mai.png'),   label: 'Không cô đơn' },
  { type: 'THANKS', image: require('../../../assets/phan_bon.png'),    label: 'Cảm ơn' },
];

interface Props {
  post: CommunityPost;
  onReact: (type: CommunityReactionType) => void;
  onReport: () => void;
  onDelete?: () => void;
}

export const CommunityPostCard: React.FC<Props> = memo(({ post, onReact, onReport, onDelete }) => {
  const { colors } = useTimeTheme();

  const handleMoreOptions = () => {
    const options: any[] = [
      { text: 'Báo cáo', onPress: onReport },
    ];
    if (onDelete) {
      options.push({ text: 'Xóa bài', style: 'destructive', onPress: onDelete });
    }
    options.push({ text: 'Hủy', style: 'cancel' });

    Alert.alert('Tùy chọn', undefined, options);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatarCircle, { backgroundColor: colors.primarySoft }]}>
          {post.avatarUrl
            ? <Image source={{ uri: post.avatarUrl }} style={styles.avatar} />
            : <Text style={styles.avatarEmoji}>🌿</Text>
          }
        </View>
        <View style={styles.flex}>
          <Text style={[styles.displayName, { color: colors.text }]} numberOfLines={1}>{post.displayName}</Text>
          {post.taskTitle && (
            <Text style={[styles.taskTitle, { color: colors.primary }]} numberOfLines={1}>📋 {post.taskTitle}</Text>
          )}
          <Text style={[styles.time, { color: colors.textMuted }]}>{formatRelativeTime(post.createdAt)}</Text>
        </View>
        <TouchableOpacity style={styles.moreBtn} onPress={handleMoreOptions} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.moreDots, { color: colors.textMuted }]}>···</Text>
        </TouchableOpacity>
      </View>

      {/* Image */}
      {post.imageUrl ? (
        <Image
          source={{ uri: post.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : null}

      {/* Caption */}
      {post.content ? (
        <Text style={[styles.content, { color: colors.text }]}>{post.content}</Text>
      ) : null}

      {/* Reactions */}
      <View style={[styles.reactionRow, { borderTopColor: colors.border }]}>
        {REACTIONS.map((r) => {
          const count = post.reactionCounts?.[r.type] ?? 0;
          const isActive = post.myReactions?.includes(r.type) ?? false;
          return (
            <TouchableOpacity
              key={r.type}
              style={[
                styles.reactionBtn,
                { backgroundColor: colors.background },
                isActive && { backgroundColor: colors.primarySoft },
              ]}
              onPress={() => onReact(r.type)}
              activeOpacity={0.7}
            >
              <Image source={r.image} style={styles.reactionImg} />
              <Text style={[
                styles.reactionCount,
                { color: colors.textMuted },
                isActive && { color: colors.primary },
              ]}>
                {count > 0 ? count : ''}
              </Text>
              <Text style={[
                styles.reactionLabel,
                { color: colors.textMuted },
                isActive && { color: colors.primary, fontWeight: '600' },
              ]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

CommunityPostCard.displayName = 'CommunityPostCard';

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: 10, padding: 14, paddingBottom: 10,
  },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: { width: 40, height: 40 },
  avatarEmoji: { fontSize: 20 },
  flex: { flex: 1 },
  displayName: { fontSize: 14, fontWeight: '700' },
  taskTitle: { fontSize: 12, marginTop: 2 },
  time: { fontSize: 11, marginTop: 2 },
  moreBtn: { padding: 4 },
  moreDots: { fontSize: 18, letterSpacing: 1 },
  image: { width: '100%', height: 220 },
  content: {
    fontSize: 14,
    lineHeight: 22, paddingHorizontal: 14, paddingVertical: 10,
  },
  reactionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingHorizontal: 6, paddingVertical: 8,
    gap: 4,
  },
  reactionBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 2, paddingVertical: 6,
    borderRadius: 10,
  },
  reactionImg: { width: 24, height: 24, borderRadius: 12 },
  reactionCount: { fontSize: 12, fontWeight: '600', minHeight: 16 },
  reactionLabel: { fontSize: 9, textAlign: 'center' },
});
