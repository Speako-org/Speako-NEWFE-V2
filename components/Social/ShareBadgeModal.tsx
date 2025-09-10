import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { useState, useEffect } from 'react';
import Octicons from '@expo/vector-icons/Octicons';
import BadgeCard from './BadgeCard';
import * as SecureStore from 'expo-secure-store';

export interface Badge {
  id: number;
  icon: string;
  title: string;
  description: string;
  createdAt: string;
  posted: boolean;
}

interface ShareBadgeModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (
    content: string,
    badge: Badge,
    server?: {
      articleId?: number;
      username?: string;
      createdAt?: string;
      likedNum?: number;
      commentNum?: number;
    }
  ) => void;
}

export default function ShareBadgeModal({ visible, onClose, onSubmit }: ShareBadgeModalProps) {
  const [content, setContent] = useState('');
  const [badges, setBadges] = useState<Badge[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  useEffect(() => {
    if (!visible) return;
    let isMounted = true;

    const getBadges = async () => {
      try {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        const res = await fetch('https://speako.site/api/user/badges', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();

        if (isMounted && data.isSuccess) {
          const badgeList = data.result.map((b: any) => ({
            id: b.userBadgeId,
            icon: b.icon,
            title: b.badgeName,
            description: b.description,
            posted: b.posted,
            createdAt: b.createdAt,
          }));
          setBadges(badgeList);

          const firstAvailable = badgeList.find((b: Badge) => !b.posted) || null;
          setSelectedBadge(firstAvailable);
        }
      } catch (err) {
        console.error('뱃지 조회 에러:', err);
      }
    };

    getBadges();

    return () => {
      isMounted = false;
    };
  }, [visible]);

  const handleSubmit = async () => {
    if (content.trim().length === 0) return alert('내용을 입력해주세요!');
    if (!selectedBadge) return alert('뱃지를 선택해주세요!');
    if (selectedBadge.posted) return alert('이미 게시물이 있는 뱃지입니다!');

    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const res = await fetch('https://speako.site/api/articles/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          content: content,
          user_badge_id: selectedBadge.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.isSuccess) {
        onSubmit(content, selectedBadge, data.result);

        setContent('');
        const firstAvailable = badges.find((b) => !b.posted) || null;
        setSelectedBadge(firstAvailable);
        onClose();
      } else {
        alert(`글 작성 실패: ${data.message}`);
      }
    } catch (err) {
      console.error('글 작성 에러:', err);
      alert('글 작성 중 오류가 발생했습니다.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50 px-10">
        {/* 바깥 영역 눌러서 닫기 */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="absolute inset-0" />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex items-center rounded-3xl bg-white p-6 shadow-lg"
          style={{ minWidth: 320 }}>
          {/* 제목 */}
          <View className="my-1 mt-3 flex-row items-center justify-center text-gray-800">
            <Text className="mr-2 text-xl font-bold">나의 뱃지 공유하기</Text>
            <Octicons name="pencil" size={18} />
          </View>

          <View className="mb-2 items-center">
            <Text className="text-sm text-gray-500">
              나의 성과를 소셜에 올려 사람들과 소통해보세요!
            </Text>
          </View>

          {/* 입력 + 뱃지 선택 + 미리보기 */}
          <View className="mb-6 mt-4 flex h-[250px] w-[300px] justify-between rounded-lg border border-gray-100 bg-gray-100 px-2 py-3">
            <TextInput
              className="text-m mb-1 h-[80px] rounded-lg bg-gray-100 px-3 py-1 text-gray-900"
              placeholder={`이 뱃지를 얻기 위해 무슨 노력을 하셨나요? (최대 100자)`}
              maxLength={100}
              multiline
              value={content}
              onChangeText={setContent}
            />

            {/* 뱃지 선택 영역 */}
            <FlatList
              data={badges}
              horizontal
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = selectedBadge?.id === item.id;
                const isDisabled = item.posted;

                return (
                  <TouchableOpacity
                    disabled={isDisabled}
                    className={`relative mx-2 h-14 w-14 items-center justify-center rounded-xl border-2
                      ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white'}
                      ${isDisabled ? 'opacity-40' : ''}
                    `}
                    onPress={() => {
                      if (!isDisabled) setSelectedBadge(item);
                    }}>
                    <Text className="text-3xl">{item.icon}</Text>

                    {/* posted == true 이면 잠금 아이콘 */}
                    {isDisabled && (
                      <View className="absolute inset-0 flex items-center justify-center">
                        <Octicons name="lock" size={24} color="black" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />

            {/* 선택된 뱃지 미리보기 */}
            {selectedBadge ? (
              <View className="mt-1.5 flex rounded-lg bg-white">
                <BadgeCard badge={selectedBadge} />
              </View>
            ) : (
              <View className="mt-1.5 flex flex-col items-center justify-center rounded-lg bg-white p-5">
                <Octicons name="report" size={15} color="gray" />
                <Text className="text-m mt-4 text-center text-gray-500">
                  모든 뱃지에 대한 게시글이 작성되었습니다.
                </Text>
              </View>
            )}
          </View>

          {/* 버튼 */}
          <View className="mb-6 w-full flex-row space-x-3">
            <TouchableOpacity className="flex-1 rounded-lg" onPress={onClose}>
              <Text className="text-center text-lg font-bold text-[#888]">취소</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 rounded-lg" onPress={handleSubmit}>
              <Text className="text-center text-lg font-bold text-[#8953E0]">작성하기</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
