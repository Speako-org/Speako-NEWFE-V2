import {
  Pressable,
  SafeAreaView,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSocial } from '../../../../hooks/useSocial';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';

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

interface Badge {
  icon: string;
  title: string;
  description: string;
}

export default function SocialScreen() {
  const params = useLocalSearchParams();
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareContent, setShareContent] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const {
    activeTab,
    setActiveTab,
    commentModalVisible,
    setCommentModalVisible,
    commentText,
    setCommentText,
    comments,
    posts,
    handleLikeToggle,
    handleCommentPress,
    handleAddComment,
  } = useSocial();

  // 뱃지 공유 모달 처리
  useEffect(() => {
    const showShareModal = params.showShareModal;
    const badgeIcon = params.badgeIcon;
    const badgeTitle = params.badgeTitle;
    const badgeDescription = params.badgeDescription;

    if (showShareModal === 'true' && badgeIcon && badgeTitle && badgeDescription) {
      setSelectedBadge({
        icon: badgeIcon as string,
        title: badgeTitle as string,
        description: badgeDescription as string,
      });
      setShareModalVisible(true);
    }
  }, [params.showShareModal, params.badgeIcon, params.badgeTitle, params.badgeDescription]);

  const handleSubmitShare = (content: string) => {
    console.log('Share content:', content);
    setShareModalVisible(false);
    setShareContent('');
  };

  const PostCard = ({ post }: { post: Post }) => (
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

      {/* 내용 */}
      <Text className="mb-3 text-base leading-6">{post.content}</Text>

      {/* before/after */}
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

      {/* before/after 이미지 자리 표시 */}
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

      {/* 좋아요, 댓글, 공유 */}
      <View className="flex-row items-center">
        <TouchableOpacity
          className="mr-4 flex-row items-center"
          onPress={() => handleLikeToggle(post.id)}>
          <Ionicons
            name={post.isLiked ? 'heart' : 'heart-outline'}
            size={24}
            color={post.isLiked ? '#EF4444' : '#6B7280'}
          />
          <Text className="ml-2 text-lg text-gray-600">{post.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="mr-4 flex-row items-center"
          onPress={() => handleCommentPress(post.id)}>
          <Ionicons name="chatbubble-outline" size={24} color="#6B7280" />
          <Text className="ml-2 text-lg text-gray-600">{post.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="paper-plane-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 헤더 */}
      <View className="px-6 pb-6 pt-12">
        <Text className="mb-6 text-3xl font-bold">소셜</Text>

        {/* 탭 */}
        <View className="flex-row rounded-xl bg-gray-100 p-1">
          <TouchableOpacity
            className={
              activeTab === 'feed'
                ? 'flex-1 rounded-lg bg-black px-4 py-2'
                : 'flex-1 rounded-lg px-4 py-2'
            }
            onPress={() => setActiveTab('feed')}>
            <Text
              className={
                activeTab === 'feed'
                  ? 'text-center text-lg font-medium text-white'
                  : 'text-center text-lg font-medium text-gray-500'
              }>
              피드
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={
              activeTab === 'friends'
                ? 'flex-1 rounded-lg bg-black px-4 py-2'
                : 'flex-1 rounded-lg px-4 py-2'
            }
            onPress={() => setActiveTab('friends')}>
            <Text
              className={
                activeTab === 'friends'
                  ? 'text-center text-lg font-medium text-white'
                  : 'text-center text-lg font-medium text-gray-500'
              }>
              친구
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 콘텐츠 */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}>
        {activeTab === 'feed' && posts.map((post) => <PostCard key={post.id} post={post} />)}
        {activeTab === 'friends' && (
          <View className="items-center justify-center py-20">
            <Text className="text-gray-500">준비 중</Text>
          </View>
        )}
      </ScrollView>

      {/* 댓글 모달 */}
      <Modal
        visible={commentModalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={() => setCommentModalVisible(false)}>
        <Pressable
          className="flex-1 bg-black bg-opacity-50"
          onPress={() => setCommentModalVisible(false)}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{ height: '80%' }}
            className="mt-auto rounded-t-3xl bg-white">
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}>
              <View className="flex-row items-center justify-between border-b border-gray-200 p-4">
                <Text className="ml-4 text-lg font-semibold">댓글</Text>
                <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <ScrollView className="flex-1 p-4">
                {comments.map((comment) => (
                  <View key={comment.id} className="mb-4">
                    <View className="mb-2 flex-row items-start">
                      <View className="mr-3 mt-1 h-8 w-8 rounded-full bg-gray-300" />
                      <View className="flex-1">
                        <View className="mb-1 flex-row items-center">
                          <Text className="font-medium">{comment.userName}</Text>
                          <Text className="ml-2 text-sm text-gray-500">{comment.timeAgo}</Text>
                        </View>
                        <Text className="text-sm">{comment.content}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
              <View className="border-t border-gray-200 p-4">
                <View className="flex-row items-center">
                  <View
                    className={
                      commentText.trim()
                        ? 'mr-3 flex-1 rounded-full bg-gray-100 px-4 py-3'
                        : 'flex-1 rounded-full bg-gray-100 px-4 py-3'
                    }>
                    <TextInput
                      value={commentText}
                      onChangeText={setCommentText}
                      placeholder="댓글을 입력하세요..."
                      placeholderTextColor="#9CA3AF"
                      style={{
                        textAlignVertical: 'center',
                        fontSize: 16,
                        color: '#000000',
                        outline: 'none',
                      }}
                      multiline={false}
                      autoFocus={false}
                      onSubmitEditing={handleAddComment}
                      returnKeyType="send"
                    />
                  </View>
                  {commentText.trim() && (
                    <TouchableOpacity onPress={handleAddComment}>
                      <Ionicons name="send" size={20} color="#8953E0" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </KeyboardAvoidingView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 뱃지 공유 모달 */}
      <Modal
        visible={shareModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShareModalVisible(false)}>
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setShareModalVisible(false)}>
          <View className="flex-1 items-center justify-center">
            <View className="mx-4 rounded-3xl bg-white p-5 shadow-lg" style={{ minWidth: 320 }}>
              {/* Header */}
              <View className="mb-1 items-center">
                <View className="flex-row items-center">
                  <Text className="pt-4 text-xl font-extrabold text-gray-800">
                    나의 뱃지 공유하기
                  </Text>
                  <Image
                    source={require('../../../../assets/upload.png')}
                    className="ml-2 mt-3 h-4 w-4"
                    resizeMode="contain"
                  />
                </View>
              </View>

              {/* Description */}
              <View className="mb-6 items-center">
                <Text className="text-sm text-gray-600">
                  나의 성과를 소셜에 올려 사람들과 소통해보세요!
                </Text>
              </View>

              {/* Combined Section */}
              <View className="mb-6 rounded-lg border border-gray-200 bg-gray-100 px-3 py-4">
                <Text className="text-m mb-2 font-medium text-gray-400">
                  이 뱃지를 얻기 위해 무슨 노력을 하셨나요?
                </Text>
                <Text className="text-s mb-8 text-gray-400">(최대 100자)</Text>

                <View className="mt-4 rounded-lg bg-white p-4">
                  <Text className="mb-3 text-base font-medium text-gray-800">획득한 뱃지</Text>
                  <View className="flex-row items-center">
                    <View className="mr-4 h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white">
                      <Text className="text-2xl">{selectedBadge?.icon}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-bold text-gray-800">
                        {selectedBadge?.title}
                      </Text>
                      <Text className="text-sm text-gray-600">{selectedBadge?.description}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Separator */}
              <View className="mb-2 h-0.5 w-full bg-gray-300" />

              {/* Buttons */}
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  className="flex-1 rounded-lg py-1"
                  onPress={() => setShareModalVisible(false)}>
                  <Text className="text-center text-xl font-extrabold text-[#007AFF]">취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 rounded-lg py-1"
                  onPress={() => handleSubmitShare(shareContent)}>
                  <Text className="text-center text-xl font-extrabold text-[#007AFF]">
                    작성하기
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 플로팅 액션 버튼 (FAB) */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg"
        onPress={() => {
          // 플로팅 버튼을 눌렀을 때 기본 뱃지 설정
          if (!selectedBadge) {
            setSelectedBadge({
              icon: '🔥',
              title: '긍정의 시작',
              description: '첫번째 긍정적 표현 달성',
            });
          }
          setShareModalVisible(true);
        }}>
        <Ionicons name="create" size={24} color="#8953E0" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
