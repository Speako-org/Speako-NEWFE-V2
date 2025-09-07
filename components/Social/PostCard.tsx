import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BadgeCard, { Badge } from './BadgeCard';
import { useMemo, useState } from 'react';
import { likeArticle, unlikeArticle } from '~/api/articles';

export interface Post {
  id: number;
  userName: string;
  badge: Badge;
  timeAgo: string;
  content: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  ImageType?: string;
}

interface PostCardProps {
  post: Post;
  onLikeToggle: (id: number) => void;
  onCommentPress: (id: number) => void;
  onEditPost?: (id: number) => void;
  onDeletePost?: (id: number) => void;
}

export default function PostCard({
  post,
  onLikeToggle,
  onCommentPress,
  onEditPost,
  onDeletePost,
}: PostCardProps) {
  // 아바타 이미지 실패 시 대체 표시
  const [avatarError, setAvatarError] = useState(false);

  // 유저 이니셜
  const initials = useMemo(() => {
    const name = (post.userName ?? '').trim();
    if (!name) return 'U';
    const parts = name.split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const second = parts[1]?.[0] ?? '';
    return (first + second).toUpperCase();
  }, [post.userName]);

  const avatarUri = useMemo(() => post.ImageType?.trim() || '', [post.ImageType]);
  const showImage = !!avatarUri && !avatarError;

  const handleLikeToggle = async () => {
    try {
      if (post.isLiked) {
        await unlikeArticle(post.id); // 취소
      } else {
        await likeArticle(post.id); // 추가
      }
      onLikeToggle(post.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View className="mx-6 mb-4 rounded-2xl border border-gray-200 bg-white p-5">
      {/* 유저 정보 */}
      <View className="mb-4 flex-row items-center">
        {/* URL 있으면 이미지, 없거나 에러면 이니셜 */}
        {showImage ? (
          <Image
            source={{ uri: avatarUri }}
            className="mr-3 h-11 w-11 rounded-full"
            resizeMode="cover"
            onError={() => setAvatarError(true)}
            accessibilityLabel={`${post.userName}의 프로필 이미지`}
          />
        ) : (
          <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-gray-300">
            <Text className="text-xl font-semibold text-white">{initials}</Text>
          </View>
        )}

        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="mr-2 text-lg font-semibold">{post.userName}</Text>
            <View className="rounded-full bg-purple-100 px-2 py-1">
              <Text className="text-xs font-medium text-purple-600">{post.badge.title}</Text>
            </View>
          </View>
          <Text className="text-sm text-gray-500">{post.timeAgo}</Text>
        </View>

        {/* 수정 / 삭제 아이콘 */}
        <View className="flex-row">
          <TouchableOpacity onPress={() => onEditPost?.(post.id)} className="ml-2">
            <Ionicons name="create-outline" size={18} color="#bbb" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDeletePost?.(post.id)} className="ml-2">
            <Ionicons name="trash-outline" size={18} color="#bbb" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 게시글 내용 */}
      <Text className="mb-3 ml-2 text-base font-medium leading-6">{post.content}</Text>

      {/* 뱃지 */}
      <View className="mb-4 flex rounded-2xl border border-gray-200">
        <BadgeCard badge={post.badge} />
      </View>

      {/* 좋아요 / 댓글 / 공유 */}
      <View className="ml-1 flex-row items-center">
        <TouchableOpacity onPress={handleLikeToggle} className="mr-3 flex-row items-center">
          <Ionicons
            name={post.isLiked ? 'heart' : 'heart-outline'}
            size={19}
            color={post.isLiked ? '#EF4444' : '#6B7280'}
          />
          <Text className="ml-1 text-lg text-gray-600">{post.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mr-3 flex-row items-center"
          onPress={() => onCommentPress(post.id)}>
          <Ionicons name="chatbubble-outline" size={19} color="#6B7280" />
          <Text className="ml-1 text-lg text-gray-600">{post.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="paper-plane-outline" size={19} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
