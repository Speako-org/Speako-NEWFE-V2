import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

      <View className="mb-3 rounded-lg bg-gray-50 p-3">
        <View className="mb-1 flex-row items-center">
          <Text style={{ color: '#DF3A3A' }} className="mr-2 text-sm font-medium">
            Before:
          </Text>
          <Text style={{ color: '#ADADAD' }} className="text-sm line-through">
            {post.before}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text style={{ color: '#62C059' }} className="mr-2 text-sm font-medium">
            After:
          </Text>
          <Text style={{ color: '#000000' }} className="text-sm">
            {post.after}
          </Text>
        </View>
      </View>

      {/* 이미지 */}
      <View className="mb-3 flex-row justify-center">
        <View className="mr-8 items-center">
          <Text style={{ color: '#DF3A3A' }} className="mb-1 text-base font-semibold">
            Before
          </Text>
          <View className="h-16 w-16 rounded-full border-2 border-gray-300" />
        </View>
        <View className="items-center">
          <Text style={{ color: '#62C059' }} className="mb-1 text-base font-semibold">
            After
          </Text>
          <View className="h-16 w-16 rounded-full border-2 border-gray-300" />
        </View>
      </View>

      {/* 좋아요 / 댓글 / 공유 */}
      <View className="flex-row items-center">
        <TouchableOpacity
          className="mr-4 flex-row items-center"
          onPress={() => onLikeToggle(post.id)}>
          <Ionicons
            name={post.isLiked ? 'heart' : 'heart-outline'}
            size={24}
            color={post.isLiked ? '#EF4444' : '#6B7280'}
          />
          <Text className="ml-2 text-lg text-gray-600">{post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="mr-4 flex-row items-center"
          onPress={() => onCommentPress(post.id)}>
          <Ionicons name="chatbubble-outline" size={24} color="#6B7280" />
          <Text className="ml-2 text-lg text-gray-600">{post.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="paper-plane-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
