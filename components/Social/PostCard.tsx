import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BadgeCard from './BadgeCard';

interface Post {
  id: number;
  userName: string;
  badge: string;
  timeAgo: string;
  content: string;
  before: string;
  after: string;
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
    <View className="mx-4 mb-4 rounded-lg border border-gray-200 bg-white p-4">
      {/* 유저 정보 */}
      <View className="mb-4 flex-row items-center">
        <View className="mr-3 h-10 w-10 rounded-full bg-gray-300" />
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="mr-2 text-lg font-semibold">{post.userName}</Text>
            <View className="rounded-full bg-purple-100 px-2 py-1">
              <Text className="text-xs text-purple-600">{post.badge}</Text>
            </View>
          </View>
          <Text className="text-base text-gray-500">{post.timeAgo}</Text>
        </View>
      </View>

      <Text className="mb-3 text-base leading-6">{post.content}</Text>

      {/* 뱃지 */}
      <View className="mb-4 flex rounded-lg border border-gray-200">
        <BadgeCard
          badge={{
            icon: '🔥', // 예시
            title: '긍정의 시작',
            description: '첫번째 긍정적 표현 달성',
          }}
        />
      </View>

      {/* 좋아요 / 댓글 / 공유 */}
      <View className="flex-row items-center">
        <TouchableOpacity
          className="mr-4 flex-row items-center"
          onPress={() => onLikeToggle(post.id)}>
          <Ionicons
            name={post.isLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={post.isLiked ? '#EF4444' : '#6B7280'}
          />
          <Text className="ml-2 text-lg text-gray-600">{post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="mr-4 flex-row items-center"
          onPress={() => onCommentPress(post.id)}>
          <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
          <Text className="ml-2 text-lg text-gray-600">{post.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="paper-plane-outline" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
