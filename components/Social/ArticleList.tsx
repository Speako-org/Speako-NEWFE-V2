import { useState, useEffect } from 'react';
import { ScrollView, View, Text, ActivityIndicator } from 'react-native';
import PostCard, { Post } from './PostCard';
import * as SecureStore from 'expo-secure-store';

export default function ArticleList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

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
          const mappedPosts: Post[] = data.result.content.map((item: any) => {
            // 날짜 포맷
            const date = new Date(item.createdAt);
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}`;

            return {
              id: item.articleId,
              userName: item.username,
              timeAgo: formattedTime,
              content: item.content,
              likes: item.likedNum,
              comments: item.commentNum,
              isLiked: false,
              badge: {
                icon: '🏆', // API 응답에 추가 필요
                title: item.badgeTitle,
                description: item.badgeDescription,
                createdAt: item.createdAt, // 원본 날짜
              },
            };
          });
          setPosts(mappedPosts);
        }
      } catch (err) {
        console.error('게시글 조회 에러:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleLikeToggle = (id: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const handleCommentPress = (id: number) => {
    console.log('댓글 눌림', id);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 100 }}>
      {loading && (
        <View className="items-center justify-center py-20">
          <ActivityIndicator size="large" color="#8953E0" />
        </View>
      )}

      {!loading &&
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLikeToggle={handleLikeToggle}
            onCommentPress={handleCommentPress}
          />
        ))}

      {!loading && posts.length === 0 && (
        <View className="items-center justify-center py-20">
          <Text className="text-gray-500">게시글이 없습니다.</Text>
        </View>
      )}
    </ScrollView>
  );
}
