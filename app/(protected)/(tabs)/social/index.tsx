import { SafeAreaView, View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useSocial } from '../../../../hooks/useSocial';
import * as SecureStore from 'expo-secure-store';
import dayjs from 'dayjs';

import CommentModal from '~/components/Social/CommentModal';
import ShareBadgeModal from '~/components/Social/ShareBadgeModal';
import TabHeader from '~/components/Social/TabHeader';
import FAButton from '~/components/Social/FAButton';
import ArticleList from '~/components/Social/ArticleList';
import { Post } from '~/components/Social/PostCard';

export default function SocialScreen() {
  const params = useLocalSearchParams();
  const [shareModalVisible, setShareModalVisible] = useState(false);

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

  const fetchArticles = async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const res = await fetch('https://speako.site/api/articles/list?size=10', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();

      if (data.isSuccess) {
        const mappedPosts: Post[] = data.result.content.map((item: any) => {
          const formattedTime = item.createdAt
            ? dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')
            : '날짜 없음';

          return {
            id: item.articleId,
            userName: item.username,
            timeAgo: formattedTime,
            content: item.content,
            likes: item.likedNum,
            comments: item.commentNum,
            isLiked: false,
            badge: {
              icon: item.icon,
              title: item.badgeTitle,
              description: item.badgeDescription,
              createdAt: item.createdAt,
            },
          };
        });
        setPosts(mappedPosts);
      }
    } catch (err) {
      console.error('게시글 조회 에러:', err);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}>
        {activeTab === 'feed' && <ArticleList posts={posts} setPosts={setPosts} />}

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
