import { AppText as Text } from '../../src/components/common/AppText';
import React, { useCallback, useState } from 'react';
import {
  View, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedScreen } from '../../src/components/theme/ThemedScreen';
import { EmptyState } from '../../src/components/common/EmptyState';
import { LoadingView } from '../../src/components/common/LoadingView';
import { CommunityPostCard } from '../../src/components/community/CommunityPostCard';
import { ReportPostModal } from '../../src/components/community/ReportPostModal';
import { useTimeTheme } from '../../src/contexts/TimeThemeContext';
import { COLORS } from '../../src/constants/colors';
import {
  useCommunityPosts,
  useToggleReaction,
  useReportPost,
  useDeletePost,
} from '../../src/hooks/useCommunity';
import { CommunityPost, CommunityReactionType } from '../../src/types/community.type';

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();

  // Data
  const { data, isLoading, isRefetching, refetch, isError } = useCommunityPosts();
  const posts: CommunityPost[] = data?.data ?? [];
  const { colors } = useTimeTheme();

  // Mutations
  const toggleReaction = useToggleReaction();
  const reportPost = useReportPost();
  const deletePost = useDeletePost();

  // Report modal state
  const [reportPostId, setReportPostId] = useState<string | null>(null);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleReact = useCallback((postId: string, type: CommunityReactionType) => {
    toggleReaction.mutate({ postId, type });
  }, [toggleReaction]);

  const handleReportSubmit = useCallback(async (reason: string) => {
    if (!reportPostId) return;
    await reportPost.mutateAsync({ postId: reportPostId, input: { reason } });
  }, [reportPostId, reportPost]);

  const handleDelete = useCallback((postId: string) => {
    deletePost.mutate(postId);
  }, [deletePost]);

  // ── Loading / Error ───────────────────────────────────────────────────────────
  if (isLoading) return <LoadingView message="Đang tải Vườn chung..." />;

  if (isError) {
    return (
      <ThemedScreen>
        <View style={styles.errorWrap}>
          <Text style={styles.errorEmoji}>🌧️</Text>
          <Text style={[styles.errorTitle, { color: colors.text }]}>Chưa tải được Vườn chung</Text>
          <Text style={[styles.errorSub, { color: colors.textMuted }]}>Bạn thử lại sau nhé.</Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: colors.primary }]} onPress={() => refetch()}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </ThemedScreen>
    );
  }

  // ── Main ──────────────────────────────────────────────────────────────────────
  return (
    <ThemedScreen showNightEffects>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Vườn chung 🌻</Text>
            <Text style={[styles.headerSub, { color: colors.textMuted }]}>
              Những khoảnh khắc nhỏ được chia sẻ ẩn danh từ mọi người.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <EmptyState
              icon="🌻"
              title="Chưa có khoảnh khắc nào"
              description="Hoàn thành nhiệm vụ có ảnh và chia sẻ ẩn danh để xuất hiện ở đây nhé."
            />
            <TouchableOpacity
              style={styles.goTasksBtn}
              onPress={() => router.push('/(tabs)/tasks')}
            >
              <Text style={styles.goTasksText}>Đi làm nhiệm vụ →</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <CommunityPostCard
            post={item}
            onReact={(type) => handleReact(item.id, type)}
            onReport={() => setReportPostId(item.id)}
            // onDelete chỉ hiển thị nếu là chủ bài (server sẽ kiểm tra lại)
            onDelete={() => handleDelete(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      {/* Report modal */}
      <ReportPostModal
        visible={reportPostId !== null}
        onClose={() => setReportPostId(null)}
        onSubmit={handleReportSubmit}
      />
    </ThemedScreen>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  headerBlock: { marginBottom: 16, gap: 4 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text.primary },
  headerSub: { fontSize: 13, color: COLORS.text.muted, lineHeight: 20 },

  errorWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 32 },
  errorEmoji: { fontSize: 48 },
  errorTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text.primary, textAlign: 'center' },
  errorSub: { fontSize: 14, color: COLORS.text.secondary, textAlign: 'center' },
  retryBtn: {
    backgroundColor: COLORS.green.main,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 8,
  },
  retryText: { color: '#fff', fontWeight: '700' },

  emptyWrap: { gap: 16, alignItems: 'center', paddingTop: 40 },
  goTasksBtn: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.green.main,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  goTasksText: { color: COLORS.green.main, fontWeight: '700', fontSize: 14 },
});
