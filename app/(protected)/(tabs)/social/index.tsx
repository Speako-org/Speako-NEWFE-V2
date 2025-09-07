import { SafeAreaView, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import dayjs from 'dayjs';
import TabHeader from '~/components/Social/TabHeader';
import FAButton from '~/components/Social/FAButton';
import ArticleList from '~/components/Social/ArticleList';
import CommentModal from '~/components/Social/CommentModal';
import ShareBadgeModal from '~/components/Social/ShareBadgeModal';
import { useSocial } from '~/hooks/useSocial';
import { Post } from '~/components/Social/PostCard';

export default function SocialScreen() {
  const params = useLocalSearchParams();
  const {
    activeTab,
    setActiveTab,
    commentModalVisible,
    setCommentModalVisible,
    commentText,
    setCommentText,
    comments,
  } = useSocial();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const res = await fetch('https://speako.site/api/articles/list?size=10', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();

      if (data.isSuccess) {
        const mapped: Post[] = data.result.content.map((item: any) => ({
          id: item.articleId,
          userName: item.username,
          timeAgo: item.createdAt ? dayjs(item.createdAt).format('YYYY-MM-DD HH:mm') : '날짜 없음',
          content: item.content,
          likes: item.likedNum,
          comments: item.commentNum,
          isLiked: !!(item.isLiked ?? item.liked ?? item.likedByMe ?? item.isLikedByMe ?? false),
          badge: {
            icon: item.icon,
            title: item.badgeTitle,
            description: item.badgeDescription,
            createdAt: item.createdAt,
          },
        }));
        setPosts((prev) => {
          const map = new Map(prev.map((p) => [p.id, p]));
          return mapped.map((m) => {
            const old = map.get(m.id);
            return old ? { ...m, isLiked: old.isLiked, likes: old.likes } : m;
          });
        });
      }
    } catch (e) {
      console.error('게시글 조회 에러:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'feed') {
      }
    }, [activeTab, fetchArticles])
  );

  // 좋아요 토글 시 로컬 즉시 반영
  const handleToggleLikeLocal = (id: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? Math.max(0, p.likes - 1) : p.likes + 1 }
          : p
      )
    );
  };

  const handleSubmitShare = async () => {
    await fetchArticles();
    setShareModalVisible(false);
  };

  useEffect(() => {
    if (
      params.showShareModal === 'true' &&
      params.badgeIcon &&
      params.badgeTitle &&
      params.badgeDescription &&
      !shareModalVisible
    ) {
      setShareModalVisible(true);
    }
  }, [
    params.showShareModal,
    params.badgeIcon,
    params.badgeTitle,
    params.badgeDescription,
    shareModalVisible,
  ]);

  return (
    <SafeAreaView className="relative flex-1 bg-white">
      <View className="px-6 pb-6 pt-12">
        <Text className="mb-6 text-3xl font-bold">소셜</Text>
        <TabHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      </View>

      {loading && (
        <View className="absolute inset-0 items-center justify-center bg-white/50">
          <ActivityIndicator size="large" color="#8953E0" />
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}>
        {activeTab === 'feed' && (
          <ArticleList posts={posts} setPosts={setPosts} onLikeToggle={handleToggleLikeLocal} />
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
        onClose={() => setCommentModalVisible(false)}
        onAddComment={() => {}}
      />

      <ShareBadgeModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        onSubmit={handleSubmitShare}
      />

      <FAButton onPress={() => setShareModalVisible(true)} />
    </SafeAreaView>
  );
}
