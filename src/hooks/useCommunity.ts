import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityService } from '../services/community.service';
import { CommunityReactionType, CommunityPost } from '../types/community.type';

const QUERY_KEY = ['communityPosts'];

// ── Feed query ─────────────────────────────────────────────────────────────────
export const useCommunityPosts = (page = 1, limit = 30) => {
  return useQuery({
    queryKey: [...QUERY_KEY, page, limit],
    queryFn: () => communityService.getPosts(page, limit),
    staleTime: 60_000,
    refetchInterval: 30_000,
  });
};

// ── Toggle reaction ────────────────────────────────────────────────────────────
export const useToggleReaction = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: CommunityReactionType }) =>
      communityService.toggleReaction(postId, type),

    // Optimistic update: flip reaction immediately
    onMutate: async ({ postId, type }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const snapshot = qc.getQueriesData<any>({ queryKey: QUERY_KEY });

      qc.setQueriesData<any>({ queryKey: QUERY_KEY }, (old: any) => {
        if (!old) return old;
        const posts: CommunityPost[] = old.data ?? [];
        return {
          ...old,
          data: posts.map((p) => {
            if (p.id !== postId) return p;
            const alreadyReacted = p.myReactions?.includes(type);
            const delta = alreadyReacted ? -1 : 1;
            return {
              ...p,
              reactionCounts: {
                ...p.reactionCounts,
                [type]: Math.max(0, (p.reactionCounts?.[type] ?? 0) + delta),
              },
              myReactions: alreadyReacted
                ? (p.myReactions ?? []).filter((r) => r !== type)
                : [...(p.myReactions ?? []), type],
            };
          }),
        };
      });

      return { snapshot };
    },

    // Sync với server response
    onSuccess: (serverData, { postId }) => {
      if (!serverData?.reactionCounts) return;
      qc.setQueriesData<any>({ queryKey: QUERY_KEY }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: (old.data as CommunityPost[]).map((p) =>
            p.id !== postId
              ? p
              : {
                  ...p,
                  reactionCounts: serverData.reactionCounts,
                  myReactions: serverData.myReactions ?? p.myReactions,
                },
          ),
        };
      });
    },

    // Rollback on error
    onError: (_err, _vars, ctx: any) => {
      if (ctx?.snapshot) {
        for (const [key, value] of ctx.snapshot) {
          qc.setQueryData(key, value);
        }
      }
    },
  });
};

// ── Report post ────────────────────────────────────────────────────────────────
export const useReportPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, input }: { postId: string; input: { reason: string; note?: string } }) =>
      communityService.reportPost(postId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

// ── Delete post ────────────────────────────────────────────────────────────────
export const useDeletePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => communityService.deletePost(postId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};
