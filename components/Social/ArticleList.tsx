import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { ScrollView, View, Text, ActivityIndicator, Alert } from 'react-native';
import PostCard, { Post } from './PostCard';
import * as SecureStore from 'expo-secure-store';

interface ArticleListProps {
  posts: Post[];
  setPosts: Dispatch<SetStateAction<Post[]>>;
}

export default function ArticleList({ posts, setPosts }: ArticleListProps) {
  const [loading, setLoading] = useState(false);

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
          let formattedTime = '날짜 없음';
          if (item.createdAt) {
            const date = new Date(item.createdAt);
            if (!isNaN(date.getTime())) {
              date.setHours(date.getHours() + 9); // 한국 시간 변환

              formattedTime = `${date.getFullYear()}-${(date.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date
                .getHours()
                .toString()
                .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            }
          }

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const handleDeletePost = (articleId: number) => {
    Alert.alert(
      '게시글 삭제',
      '정말로 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const accessToken = await SecureStore.getItemAsync('accessToken');
              const res = await fetch(`https://speako.site/api/articles/delete/${articleId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` },
              });
              const data = await res.json();
              if (data.isSuccess) {
                setPosts((prev) => prev.filter((post) => post.id !== articleId));
              } else {
                Alert.alert('삭제 실패', data.message || '알 수 없는 오류');
              }
            } catch (err) {
              console.error('게시글 삭제 에러:', err);
              Alert.alert('삭제 실패', '서버 오류가 발생했습니다.');
            }
          },
        },
      ],
      { cancelable: true }
    );
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
            onDeletePost={handleDeletePost}
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
