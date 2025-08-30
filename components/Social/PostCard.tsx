import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BadgeCard, { Badge } from './BadgeCard';

export interface Post {
  id: number;
  userName: string;
  badge: Badge;
  timeAgo: string;
  content: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

interface PostCardProps {
  post: Post;
  onLikeToggle: (id: number) => void;
  onCommentPress: (id: number) => void;
}

export default function PostCard({ post, onLikeToggle, onCommentPress }: PostCardProps) {
  return (
    <View className="mx-6 mb-4 rounded-2xl border border-gray-200 bg-white p-5">
      {/* 유저 정보 */}
      <View className="mb-4 flex-row items-center">
        <View className="mr-3 h-11 w-11 rounded-full bg-gray-300" />
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="mr-2 text-lg font-semibold">{post.userName}</Text>
            <View className="rounded-full bg-purple-100 px-2 py-1">
              <Text className="text-xs font-medium text-purple-600">{post.badge.title}</Text>
            </View>
          </View>
          <Text className="text-sm text-gray-500">{post.timeAgo}</Text>
        </View>
      </View>

      <Text className="mb-3 ml-2 text-base font-medium leading-6">{post.content}</Text>

      {/* 뱃지 */}
      <View className="mb-4 flex rounded-2xl border border-gray-200">
        <BadgeCard badge={post.badge} />
      </View>

      {/* 좋아요 / 댓글 / 공유 */}
      <View className="ml-1 flex-row items-center">
        <TouchableOpacity
          className="mr-3 w-[35px] flex-row items-center"
          onPress={() => onLikeToggle(post.id)}>
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
