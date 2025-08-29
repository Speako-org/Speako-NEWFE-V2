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

interface Badge {
  id: number;
  icon: string;
  title: string;
  description: string;
}

interface ShareBadgeModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (content: string, badgeId: number) => void; // badge_id도 같이 전달
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

        if (isMounted) {
          const badgeList = data.result.map((b: any) => ({
            id: b.userBadgeId,
            icon: b.icon,
            title: b.badgeName,
            description: b.description,
          }));
          setBadges(badgeList);

          // 첫 번째 뱃지 기본 선택
          if (badgeList.length > 0) {
            setSelectedBadge(badgeList[0]);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    getBadges();

    return () => {
      isMounted = false;
    };
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50 px-10">
        {/* 바깥 영역(배경) 눌렀을 때 닫힘 */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="absolute inset-0" />
        </TouchableWithoutFeedback>

        {/* 실제 모달 박스 */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex items-center rounded-3xl bg-white p-6 shadow-lg"
          style={{ minWidth: 320 }}>
          {/* 제목 */}
          <View className="my-1 flex-row items-center justify-center text-gray-800">
            <Text className="mr-2 text-lg font-bold">나의 뱃지 공유하기</Text>
            <Octicons name="pencil" size={18} />
          </View>

          <View className="mb-2 items-center">
            <Text className="text-sm text-gray-500">
              나의 성과를 소셜에 올려 사람들과 소통해보세요!
            </Text>
          </View>

          {/* 입력 + 뱃지 미리보기 */}
          <View className="mb-6 mt-4 flex h-[250px] w-[280px] justify-between rounded-lg border border-gray-100 bg-gray-100 px-2 py-3">
            <TextInput
              className="text-m mb-1 h-[80px] rounded-lg bg-gray-100 px-3 py-1 text-gray-800"
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
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`mx-1 h-9 w-9 rounded-lg border ${
                    selectedBadge?.id === item.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  onPress={() => setSelectedBadge(item)}>
                  <Text className="px-1 pt-0.5 text-xl">{item.icon}</Text>
                </TouchableOpacity>
              )}
            />

            {selectedBadge && (
              <View className="mt-1.5 flex rounded-lg bg-white">
                {selectedBadge && <BadgeCard badge={selectedBadge} />}
              </View>
            )}
          </View>

          {/* 버튼 */}
          <View className="mb-6 w-full flex-row space-x-3">
            <TouchableOpacity className="flex-1 rounded-lg" onPress={onClose}>
              <Text className="text-center text-lg font-bold text-[#888]">취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 rounded-lg"
              onPress={() => {
                if (content.trim().length === 0) return; // 빈 내용 방지
                if (!selectedBadge) {
                  alert('뱃지를 선택해주세요!');
                  return;
                }
                onSubmit(content, selectedBadge.id); // ✅ badgeId 함께 전달
                setContent('');
                setSelectedBadge(null);
              }}>
              <Text className="text-center text-lg font-bold text-[#8953E0]">작성하기</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
