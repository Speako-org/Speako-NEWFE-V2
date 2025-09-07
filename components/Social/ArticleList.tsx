import { Dispatch, SetStateAction } from 'react';
import { ScrollView, View, Text, Alert } from 'react-native';
import PostCard, { Post } from './PostCard';
import * as SecureStore from 'expo-secure-store';

interface ArticleListProps {
  posts: Post[];
  setPosts: Dispatch<SetStateAction<Post[]>>;
  onLikeToggle: (id: number) => void;
}

export default function ArticleList({ posts, setPosts, onLikeToggle }: ArticleListProps) {
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
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLikeToggle={onLikeToggle}
          onCommentPress={handleCommentPress}
          onDeletePost={handleDeletePost}
        />
      ))}

      {posts.length === 0 && (
        <View className="items-center justify-center py-20">
          <Text className="text-gray-500">게시글이 없습니다.</Text>
        </View>
      )}
    </ScrollView>
  );
}
