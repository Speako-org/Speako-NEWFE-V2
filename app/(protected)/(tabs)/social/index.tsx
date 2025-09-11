import { SafeAreaView, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import dayjs from 'dayjs';

import { useSocial } from '~/hooks/useSocial';
import CommentModal from '~/components/Social/CommentModal';
import ShareBadgeModal from '~/components/Social/ShareBadgeModal';
import TabHeader from '~/components/Social/TabHeader';
import FAButton from '~/components/Social/FAButton';
import ArticleList from '~/components/Social/ArticleList';
import type { Post } from '~/components/Social/PostCard';

import { loadLikedSet, saveLikedSet, toggleInSet } from '~/utils/likeStore';
import { useComments, useAddComment, useDeleteComment } from '~/hooks/useComments';

export default function SocialScreen() {
  const params = useLocalSearchParams();
  const {
    activeTab,
    setActiveTab,
    commentModalVisible,
    setCommentModalVisible,
    commentText,
    setCommentText,
  } = useSocial();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const [userKey] = useState<string>('me');
  const [currentArticleId, setCurrentArticleId] = useState<number | null>(null);
  const [likedSet, setLikedSet] = useState<Set<number>>(new Set());
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined);

  const { data: comments = [] } = useComments(currentArticleId);
  const addComment = useAddComment(currentArticleId);

  const decComments = () =>
    setPosts((prev) =>
      prev.map((p) =>
        p.id === currentArticleId ? { ...p, comments: Math.max(0, p.comments - 1) } : p
      )
    );
  const incComments = () =>
    setPosts((prev) =>
      prev.map((p) => (p.id === currentArticleId ? { ...p, comments: p.comments + 1 } : p))
    );

  const deleteCommentMutation = useDeleteComment(currentArticleId, decComments, incComments);

  useEffect(() => {
    (async () => {
      const loaded = await loadLikedSet(userKey);
      setLikedSet(loaded);
    })();
  }, [userKey]);

  useEffect(() => {
    (async () => {
      try {
        const userId = await SecureStore.getItemAsync('userId');
        if (userId) {
          setCurrentUserId(parseInt(userId, 10));
        }
      } catch (e) {
        console.warn('Failed to load userId from SecureStore', e);
      }
    })();
  }, []);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const res = await fetch('https://speako.site/api/articles/list?size=10', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();

      if (data.isSuccess) {
        const mappedPosts: Post[] = data.result.content.map((item: any) => {
          const id = Number(item.articleId);
          const formattedTime = item.createdAt
            ? dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')
            : '날짜 없음';

          const serverLiked = !!(
            item.isLiked ??
            item.liked ??
            item.likedByMe ??
            item.isLikedByMe ??
            false
          );
          const isLiked = likedSet.has(id) || serverLiked;

          return {
            id,
            userId: Number(item.userId),
            userName: item.username,
            timeAgo: formattedTime,
            content: item.content,
            likes: item.likedNum,
            comments: item.commentNum,
            isLiked,
            ImageType: item.ImageType ?? null,
            badge: {
              icon: item.icon,
              title: item.badgeTitle,
              description: item.badgeDescription,
              createdAt: item.createdAt,
            },
          } as Post;
        });

        setPosts((prev) => {
          const prevMap = new Map(prev.map((p) => [p.id, p]));
          return mappedPosts.map((m) => {
            const old = prevMap.get(m.id);
            return old ? { ...m, likes: old.likes } : m;
          });
        });

        const mustAdd = mappedPosts
          .filter((p) => p.isLiked && !likedSet.has(p.id))
          .map((p) => p.id);
        if (mustAdd.length > 0) {
          const next = new Set(likedSet);
          mustAdd.forEach((id) => next.add(id));
          setLikedSet(next);
          saveLikedSet(userKey, next);
        }
      }
    } catch (e) {
      console.error('게시글 조회 에러:', e);
    } finally {
      setLoading(false);
    }
  }, [likedSet, userKey]);

  useEffect(() => {
    const run = async () => {
      await fetchArticles();
    };
    run();
  }, [likedSet, userKey, fetchArticles]);

  const handleToggleLikeLocal = (id: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? Math.max(0, p.likes - 1) : p.likes + 1 }
          : p
      )
    );
    setLikedSet((prev) => {
      const current = posts.find((p) => p.id === id);
      const nextLiked = !(current?.isLiked ?? false);
      const next = toggleInSet(prev, id, nextLiked);
      saveLikedSet(userKey, next);
      return next;
    });
  };

  const openComments = (articleId: number) => {
    setCommentModalVisible(true);
    setCurrentArticleId(articleId);
  };
  const closeComments = () => {
    setCommentModalVisible(false);
    setCurrentArticleId(null);
    setCommentText('');
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addComment.mutate(commentText.trim());
    setCommentText('');
    setPosts((prev) =>
      prev.map((p) => (p.id === currentArticleId ? { ...p, comments: p.comments + 1 } : p))
    );
  };

  const showShareModal = (params as any)?.showShareModal;
  const badgeIcon = (params as any)?.badgeIcon;
  const badgeTitle = (params as any)?.badgeTitle;
  const badgeDescription = (params as any)?.badgeDescription;

  useEffect(() => {
    if (
      showShareModal === 'true' &&
      badgeIcon &&
      badgeTitle &&
      badgeDescription &&
      !shareModalVisible
    ) {
      setShareModalVisible(true);
    }
  }, [params, showShareModal, badgeIcon, badgeTitle, badgeDescription, shareModalVisible]);

  return (
    <SafeAreaView className="relative flex-1 bg-[#f2f2f2]">
      <View className="ml-2 px-6 pt-12">
        <Text className="mb-4 text-4xl font-bold">소셜</Text>
      </View>
      <View className="px-4 pb-4">
        <TabHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      </View>

      {loading && (
        <View className="absolute inset-0 z-10 items-center justify-center bg-white/50">
          <ActivityIndicator size="large" color="#8953E0" />
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}>
        {activeTab === 'feed' && (
          <ArticleList
            posts={posts}
            setPosts={setPosts}
            onLikeToggle={handleToggleLikeLocal}
            onOpenComments={openComments}
          />
        )}
        {activeTab === 'friends' && (
          <View className="items-center justify-center py-20">
            <Text className="text-gray-500">준비 중</Text>
          </View>
        )}
      </ScrollView>

      <CommentModal
        visible={commentModalVisible}
        comments={comments}
        commentText={commentText}
        setCommentText={setCommentText}
        onClose={closeComments}
        onAddComment={handleAddComment}
        deleteCommentMutation={deleteCommentMutation}
        currentUserId={currentUserId}
      />

      <ShareBadgeModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        onSubmit={(content, badge, server) => {
          const newPost: Post = {
            id: Number(server?.articleId ?? Date.now()),
            userId: Number(server?.userId ?? 0),
            userName: server?.username ?? '나',
            ImageType: (server as any)?.ImageType ?? undefined,
            timeAgo: dayjs(server?.createdAt ?? new Date()).format('YYYY-MM-DD HH:mm'),
            content,
            likes: server?.likedNum ?? 0,
            comments: server?.commentNum ?? 0,
            isLiked: false,
            badge: {
              icon: badge.icon,
              title: badge.title,
              description: badge.description,
              createdAt: server?.createdAt ?? new Date().toISOString(),
            },
          };

          setPosts((prev) => [newPost, ...prev]);
          setShareModalVisible(false);

          fetchArticles();
        }}
      />

      <FAButton onPress={() => setShareModalVisible(true)} />
    </SafeAreaView>
  );
}
