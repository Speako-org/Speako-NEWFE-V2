import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchComments, addComment as addCommentApi } from '~/api/articles';
import type { ServerComment } from '~/components/Social/CommentModal';

function sortAscByDate(list: ServerComment[]) {
  return [...list].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

// 댓글 리스트 불러오기
export function useComments(articleId: number | null) {
  return useQuery<ServerComment[]>({
    queryKey: ['comments', articleId],
    queryFn: async () => {
      if (!articleId) return [];
      const data = await fetchComments(articleId, 10);
      const rows = (data?.result?.content ?? []) as ServerComment[];
      return sortAscByDate(rows);
    },
    enabled: !!articleId,
  });
}

// 댓글 작성
export function useAddComment(articleId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (text: string) => {
      if (!articleId) throw new Error('No articleId');
      return addCommentApi(articleId, text);
    },
    onMutate: async (newText: string) => {
      if (!articleId) return;

      await queryClient.cancelQueries({ queryKey: ['comments', articleId] });

      const prev = queryClient.getQueryData<ServerComment[]>(['comments', articleId]);

      const optimistic: ServerComment = {
        commentId: Date.now() * -1,
        userId: 0,
        username: '나',
        ImageType: null,
        content: newText,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<ServerComment[]>(['comments', articleId], (old = []) =>
        sortAscByDate([...(old ?? []), optimistic])
      );

      return { prev };
    },
    onError: (_err, _newText, ctx) => {
      if (articleId && ctx?.prev) {
        queryClient.setQueryData(['comments', articleId], ctx.prev);
      }
    },
    onSettled: () => {
      if (articleId) {
        queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
      }
    },
  });
}
