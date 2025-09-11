import { View, Text, TouchableOpacity, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BadgeCard, { Badge } from './BadgeCard';
import { useEffect, useState } from 'react';
import { likeArticle, unlikeArticle } from '~/api/articles';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export interface Post {
  id: number;
  userId: number;
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
  const router = useRouter();
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 50, right: 24 });
  const [myUserId, setMyUserId] = useState<string | null>(null);

  // 내 userId 로드
  useEffect(() => {
    (async () => {
      try {
        const uid = await SecureStore.getItemAsync('userId');
        setMyUserId(uid ?? null);
      } catch (e) {
        console.warn('Failed to load userId from SecureStore', e);
      }
    })();
  }, []);

  const handleLikeToggle = async () => {
    try {
      if (post.isLiked) await unlikeArticle(post.id);
      else await likeArticle(post.id);

      onLikeToggle(post.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNavigateToProfile = () => {
    if (!myUserId) {
      router.push({
        pathname: '/(protected)/other-profile/[id]' as any,
        params: { id: String(post.userId) },
      });
      return;
    }

    if (String(post.userId) === myUserId) {
      // 내 프로필이면 마이페이지로
      router.push('/(protected)/(tabs)/my' as any);
    } else {
      // 타인이면 상대 프로필로
      router.push({
        pathname: '/(protected)/other-profile/[id]' as any,
        params: { id: String(post.userId) },
      });
    }
  };

  return (
    <View className="mx-4 mb-4 rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-6">
      {/* 유저 정보 */}
      <View className="mb-4 mt-1 flex-row items-center">
        <TouchableOpacity onPress={handleNavigateToProfile}>
          <Image
            source={
              post?.ImageType ? { uri: post.ImageType } : require('~/assets/default-profile.png')
            }
            className="mr-3 h-12 w-12 rounded-full"
            resizeMode="cover"
          />
        </TouchableOpacity>

        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="mr-2 text-[18px] font-bold">{post.userName}</Text>
              <View className="rounded-full bg-purple-100 px-2 py-1">
                <Text className="p-0.5 text-[11px] font-medium text-purple-600">
                  {post.badge.title}
                </Text>
              </View>
            </View>
            {/* 옵션 메뉴 */}
            <TouchableOpacity
              onPress={(event) => {
                event.currentTarget.measure((x, y, width, height, pageX, pageY) => {
                  setModalPosition({
                    top: pageY + height + 5,
                    right: 24,
                  });
                  setShowOptionsModal(true);
                });
              }}
              className="ml-2">
              <Ionicons name="ellipsis-vertical" size={20} color="#888" />
            </TouchableOpacity>
          </View>
          <Text className="text-base text-gray-500">{post.timeAgo}</Text>
        </View>
      </View>

      {/* 게시글 내용 */}
      <Text className="mb-1 ml-2 mt-5 text-lg font-medium leading-7">{post.content}</Text>

      {/* 뱃지 */}
      <View className="mb-2 mt-3 flex rounded-xl border border-gray-100 bg-pink-50">
        <BadgeCard badge={post.badge} />
      </View>

      {/* 좋아요 / 댓글 */}
      <View className="ml-1 flex-row items-center">
        <TouchableOpacity
          onPress={handleLikeToggle}
          className="mr-1 flex-row items-center px-2 pb-1 pt-2">
          <Ionicons
            name={post.isLiked ? 'heart' : 'heart-outline'}
            size={25}
            color={post.isLiked ? '#EF4444' : '#6B7280'}
          />
          <Text className="ml-2 text-xl text-gray-600">{post.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center px-2 pb-1 pt-2"
          onPress={() => onCommentPress(post.id)}>
          <Ionicons name="chatbubble-outline" size={23} color="#6B7280" />
          <Text className="ml-2 text-xl text-gray-600">{post.comments}</Text>
        </TouchableOpacity>
      </View>

      {/* 옵션 모달 */}
      <Modal visible={showOptionsModal} transparent={true} animationType="fade">
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}
          activeOpacity={1}
          onPress={() => setShowOptionsModal(false)}>
          <View
            style={{
              position: 'absolute',
              top: modalPosition.top,
              right: modalPosition.right,
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 0,
              minWidth: 180,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}>
            <TouchableOpacity
              onPress={() => {
                setShowOptionsModal(false);
                onEditPost?.(post.id);
              }}
              style={{
                paddingVertical: 14,
                paddingHorizontal: 18,
                borderBottomWidth: 1,
                borderBottomColor: '#f0f0f0',
              }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>게시글 수정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowOptionsModal(false);
                onDeletePost?.(post.id);
              }}
              style={{
                paddingVertical: 16,
                paddingHorizontal: 18,
              }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#ef4444' }}>
                게시글 삭제
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
