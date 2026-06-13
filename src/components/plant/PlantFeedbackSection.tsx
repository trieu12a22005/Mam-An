import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Animated, Modal, Image,
} from 'react-native';
import { plantFeedbackApi, PlantComment } from '../../api/plantFeedback.api';
import { useTimeTheme } from '../../contexts/TimeThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { COLORS } from '../../constants/colors';

const EMOJI_OPTIONS = ['❤️', '🌸', '😊', '💪', '🌿', '🥰', '✨'];

interface Props {
  plantId: string;
  updateDate: string | Date;
}

export function PlantFeedbackSection({ plantId, updateDate }: Props) {
  const { colors } = useTimeTheme();
  const { user } = useAuth();

  const [myReaction, setMyReaction]   = useState<string | null>(null);
  const [reactions, setReactions]     = useState<Record<string, number>>({});
  const [comments, setComments]       = useState<PlantComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [isSending, setIsSending]     = useState(false);
  const [loaded, setLoaded]           = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting]   = useState(false);

  // Load on mount (lazy)
  const loadData = useCallback(async () => {
    if (loaded) return;
    setIsLoading(true);
    try {
      const [reactRes, commentRes] = await Promise.all([
        plantFeedbackApi.getReactions(plantId),
        plantFeedbackApi.getComments(plantId),
      ]);
      setReactions(reactRes.data);
      setMyReaction(reactRes.myReaction);
      setComments(commentRes.data);
      setLoaded(true);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [plantId, loaded]);

  React.useEffect(() => { loadData(); }, [loadData]);

  // ── React ───────────────────────────────────────────────────────────────
  const handleReact = async (emoji: string) => {
    const currentMyReaction = myReaction;
    const isChanging = currentMyReaction !== emoji;

    // Optimistic update
    setMyReaction(isChanging ? emoji : null);
    setReactions((prev) => {
      const next = { ...prev };
      // Giảm/xóa emoji cũ nếu có
      if (currentMyReaction) {
        next[currentMyReaction] = Math.max(0, (next[currentMyReaction] ?? 1) - 1);
        if (next[currentMyReaction] === 0) delete next[currentMyReaction];
      }
      // Tăng emoji mới nếu đang đổi/thả mới
      if (isChanging) {
        next[emoji] = (next[emoji] ?? 0) + 1;
      }
      return next;
    });

    try {
      await plantFeedbackApi.react(plantId, emoji);
    } catch {
      // ignore
    }
  };

  // ── Comment ─────────────────────────────────────────────────────────────
  const handleSendComment = async () => {
    const text = commentText.trim();
    if (!text) return;
    if (text.length > 500) {
      return;
    }
    setIsSending(true);
    try {
      const res = await plantFeedbackApi.addComment(plantId, text);
      setComments((prev) => [res.data, ...prev]);
      setCommentText('');
    } catch {
      // fallback
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCommentId) return;
    setIsDeleting(true);
    try {
      await plantFeedbackApi.deleteComment(plantId, deletingCommentId);
      setComments((prev) => prev.filter((c) => c.id !== deletingCommentId));
      setDeletingCommentId(null);
    } catch {
      // fallback
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.green.main} />
      </View>
    );
  }

  const hasCommentedOnLatestUpdate = comments.some(
    (c) => c.user.id === user?.id && new Date(c.createdAt) >= new Date(updateDate)
  );

  return (
    <View style={styles.container}>

      {/* ── Emoji Picker ── */}
      <View style={styles.emojiRow}>
        {EMOJI_OPTIONS.map((emoji) => {
          const count = reactions[emoji] ?? 0;
          const isSelected = myReaction === emoji;
          return (
            <AnimatedEmojiBtn
              key={emoji}
              emoji={emoji}
              count={count}
              isSelected={isSelected}
              colors={colors}
              onPress={() => handleReact(emoji)}
            />
          );
        })}
      </View>

      {/* ── Comment Input (Only if haven't commented on this update) ── */}
      {!hasCommentedOnLatestUpdate && (
        <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.background }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Nhắn gửi điều gì đó cho nhà vườn..."
            placeholderTextColor={colors.textMuted}
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              { backgroundColor: commentText.trim() ? COLORS.green.main : COLORS.green[100] },
            ]}
            onPress={handleSendComment}
            disabled={isSending || !commentText.trim()}
          >
            {isSending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.sendBtnText}>Gửi</Text>
            }
          </TouchableOpacity>
        </View>
      )}

      {/* ── Comment List ── */}
      {comments.length > 0 && (
        <View style={styles.commentList}>
          {comments.slice(0, 5).map((c) => (
            <View key={c.id} style={[styles.commentItem, { backgroundColor: colors.background }]}>
              <View style={styles.commentHeader}>
                <Text style={[styles.commentUser, { color: COLORS.green.dark }]}>
                  {c.user.name}
                </Text>
                {c.user.id === user?.id && (
                  <TouchableOpacity onPress={() => setDeletingCommentId(c.id)} style={styles.deleteBtn}>
                    <Text style={[styles.deleteDot, { color: colors.textMuted }]}>⋮</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={[styles.commentContent, { color: colors.text }]}>{c.content}</Text>
              <Text style={[styles.commentTime, { color: colors.textMuted }]}>
                {new Date(c.createdAt).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          ))}
          {comments.length > 5 && (
            <Text style={[styles.moreText, { color: colors.textMuted }]}>
              + {comments.length - 5} bình luận khác
            </Text>
          )}
        </View>
      )}

      {/* ── Mascot Delete Modal ── */}
      <Modal
        transparent
        visible={!!deletingCommentId}
        animationType="fade"
        onRequestClose={() => setDeletingCommentId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Image
              source={require('../../../assets/thinking.png')}
              style={styles.modalMascot}
              resizeMode="contain"
            />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Mầm hơi tiếc đó 🥺</Text>
            <Text style={[styles.modalDesc, { color: colors.textMuted }]}>
              Bạn có thực sự muốn thu hồi lời nhắn yêu thương này không?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.surfaceSoft }]}
                onPress={() => setDeletingCommentId(null)}
                disabled={isDeleting}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Để Mầm giữ lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: COLORS.danger }]}
                onPress={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.modalBtnText, { color: '#fff' }]}>Thu hồi</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  center: { padding: 24, alignItems: 'center' },

  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  emojiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 4,
  },
  emoji: { fontSize: 18 },
  emojiCount: { fontSize: 12, fontWeight: '600' },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    gap: 8,
    marginBottom: 12,
  },
  input: { flex: 1, fontSize: 14, lineHeight: 20, minHeight: 36, maxHeight: 100 },
  sendBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 56,
    alignItems: 'center',
  },
  sendBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  commentList: { gap: 8 },
  commentItem: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentUser: { fontSize: 12, fontWeight: '700' },
  deleteBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  deleteDot: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentContent: { fontSize: 13, lineHeight: 19 },
  commentTime: { fontSize: 11 },
  moreText: { fontSize: 12, textAlign: 'center', marginTop: 4 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  modalMascot: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

// ── Animated Emoji Button ──────────────────────────────────────────────────
const AnimatedEmojiBtn = ({ emoji, count, isSelected, onPress, colors }: any) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true })
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.emojiBtn,
          {
            transform: [{ scale: scaleAnim }],
            backgroundColor: isSelected ? COLORS.green[100] : colors.background,
            borderColor: isSelected ? COLORS.green[300] : colors.border,
          },
        ]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        {count > 0 && (
          <Text style={[styles.emojiCount, { color: colors.textMuted }]}>{count}</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};
