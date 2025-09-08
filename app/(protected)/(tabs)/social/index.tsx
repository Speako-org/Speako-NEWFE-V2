import { SafeAreaView, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import dayjs from 'dayjs';

import { useSocial } from '~/hooks/useSocial';
import CommentModal from '~/components/Social/CommentModal';
import ShareBadgeModal from '~/components/Social/ShareBadgeModal';
import TabHeader from '~/components/Social/TabHeader';
import FAButton from '~/components/Social/FAButton';
import ArticleList from '~/components/Social/ArticleList';
import { Post } from '~/components/Social/PostCard';
import { loadLikedSet, saveLikedSet, toggleInSet } from '~/utils/likeStore';
import { useComments, useAddComment } from '~/hooks/useComments';

export default function SocialScreen() {
  useLocalSearchParams();
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

  // TanStack Query
  const { data: comments = [], isLoading: commentsLoading } = useComments(currentArticleId);
  const addComment = useAddComment(currentArticleId);

  useEffect(() => {
    (async () => {
      const loaded = await loadLikedSet(userKey);
      setLikedSet(loaded);
    })();
  }, [userKey]);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        const res = await fetch('https://speako.site/api/articles/list?size=10', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (data.isSuccess) {
          const mapped: Post[] = data.result.content.map((item: any) => {
            const id = Number(item.articleId);
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
              userName: item.username,
              timeAgo: item.createdAt
                ? dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')
                : '날짜 없음',
              content: item.content,
              likes: item.likedNum,
              comments: item.commentNum,
              isLiked,
              badge: {
                icon: item.icon,
                title: item.badgeTitle,
                description: item.badgeDescription,
                createdAt: item.createdAt,
              },
            };
          });
          setPosts(mapped);
        }
      } catch (e) {
        console.error('게시글 조회 에러:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [likedSet, userKey]);

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

  const [shareModalVisible, setShareModalVisible] = useState(false);

  return (
    <SafeAreaView className="relative flex-1 bg-white">
      <View className="px-6 pb-6 pt-12">
        <Text className="mb-6 text-3xl font-bold">소셜</Text>
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
      />

      <ShareBadgeModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        onSubmit={() => setShareModalVisible(false)}
      />

      <FAButton onPress={() => setShareModalVisible(true)} />
    </SafeAreaView>
  );
}
