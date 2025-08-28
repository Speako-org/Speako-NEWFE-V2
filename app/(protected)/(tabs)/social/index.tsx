import { SafeAreaView, View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useSocial } from '../../../../hooks/useSocial';

import PostCard from '../../../../components/Social/PostCard';
import CommentModal from '../../../../components/Social/CommentModal';
import ShareBadgeModal from '../../../../components/Social/ShareBadgeModal';
import TabHeader from '../../../../components/Social/TabHeader';
import FAButton from '../../../../components/Social/FAButton';

interface Badge {
  icon: string;
  title: string;
  description: string;
}

export default function SocialScreen() {
  const params = useLocalSearchParams();
  const [shareModalVisible, setShareModalVisible] = useState(false);
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
    if (
      params.showShareModal === 'true' &&
      params.badgeIcon &&
      params.badgeTitle &&
      params.badgeDescription &&
      !shareModalVisible // 모달이 이미 열려있지 않을 때만 열기
    ) {
      setSelectedBadge({
        icon: params.badgeIcon as string,
        title: params.badgeTitle as string,
        description: params.badgeDescription as string,
      });
      setShareModalVisible(true);
    }
  }, [
    params.showShareModal,
    params.badgeIcon,
    params.badgeTitle,
    params.badgeDescription,
    shareModalVisible,
  ]);

  const handleSubmitShare = () => {
    console.log('뱃지 공유 완료!');
    setShareModalVisible(false);
  };

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
        {activeTab === 'feed' &&
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLikeToggle={handleLikeToggle}
              onCommentPress={handleCommentPress}
            />
          ))}
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
        onAddComment={handleAddComment}
      />

      <ShareBadgeModal
        visible={shareModalVisible}
        badge={selectedBadge}
        onClose={() => setShareModalVisible(false)}
        onSubmit={handleSubmitShare}
      />

      <FAButton
        onPress={() => {
          if (!selectedBadge) {
            setSelectedBadge({
              icon: '🔥',
              title: '긍정의 시작',
              description: '첫번째 긍정적 표현 달성',
            });
          }
          setShareModalVisible(true);
        }}
      />
    </SafeAreaView>
  );
}
