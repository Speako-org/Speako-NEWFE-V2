import { Modal, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import Octicons from '@expo/vector-icons/Octicons';
import BadgeCard from './BadgeCard';

interface Badge {
  icon: string;
  title: string;
  description: string;
}

interface ShareBadgeModalProps {
  visible: boolean;
  badge: Badge | null;
  onClose: () => void;
  onSubmit: (content: string) => void;
}

export default function ShareBadgeModal({
  visible,
  badge,
  onClose,
  onSubmit,
}: ShareBadgeModalProps) {
  const [content, setContent] = useState('');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity className="flex-1 bg-black/50" activeOpacity={1} onPress={onClose}>
        <View className="mx-10 flex-1 items-center justify-center">
          <View
            className="flex items-center rounded-3xl bg-white p-6 shadow-lg"
            style={{ minWidth: 320 }}>
            <View className="my-1 flex-row items-center justify-center text-gray-800">
              <Text className="mr-1 text-lg font-bold">나의 뱃지 공유하기</Text>
              <Octicons name="pencil" size={18} />
            </View>

            <View className="mb-6 items-center">
              <Text className="text-xs text-gray-500">
                나의 성과를 소셜에 올려 사람들과 소통해보세요!
              </Text>
            </View>

            <View className="mb-6 flex h-[230px] w-[270px] justify-between rounded-lg border border-gray-200 bg-gray-100 px-2 py-3">
              <TextInput
                className="rounded-lg bg-gray-100 p-3 text-xs text-gray-800"
                placeholder={`이 뱃지를 얻기 위해 무슨 노력을 하셨나요?\n(최대 100자)`}
                maxLength={100}
                multiline
                value={content}
                onChangeText={setContent}
              />

              <View className="flex rounded-lg bg-white">
                <BadgeCard badge={badge} />
              </View>
            </View>

            {/* 버튼 */}
            <View className="w-full flex-row space-x-3">
              <TouchableOpacity className="flex-1 rounded-lg py-1" onPress={onClose}>
                <Text className="text-center text-lg font-bold text-[#888]">취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 rounded-lg py-1"
                onPress={() => {
                  onSubmit(content);
                  setContent('');
                }}>
                <Text className="text-center text-lg font-bold text-[#8953E0]">작성하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
