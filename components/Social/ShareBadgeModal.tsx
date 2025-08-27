import { Modal, View, Text, TouchableOpacity, Image } from 'react-native';

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
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity className="flex-1 bg-black/50" activeOpacity={1} onPress={onClose}>
        <View className="flex-1 items-center justify-center">
          <View className="mx-4 rounded-3xl bg-white p-5 shadow-lg" style={{ minWidth: 320 }}>
            <View className="mb-1 flex-row items-center justify-center">
              <Text className="pt-4 text-xl font-extrabold text-gray-800">나의 뱃지 공유하기</Text>
              <Image
                source={require('../../assets/upload.png')}
                className="ml-2 mt-3 h-4 w-4"
                resizeMode="contain"
              />
            </View>

            <View className="mb-6 items-center">
              <Text className="text-sm text-gray-600">
                나의 성과를 소셜에 올려 사람들과 소통해보세요!
              </Text>
            </View>

            <View className="mb-6 rounded-lg border border-gray-200 bg-gray-100 px-3 py-4">
              <Text className="mb-2 text-gray-400">이 뱃지를 얻기 위해 무슨 노력을 하셨나요?</Text>
              <Text className="mb-8 text-gray-400">(최대 100자)</Text>

              <View className="mt-4 rounded-lg bg-white p-4">
                <Text className="mb-3 text-base font-medium text-gray-800">획득한 뱃지</Text>
                <View className="flex-row items-center">
                  <View className="mr-4 h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white">
                    <Text className="text-2xl">{badge?.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-800">{badge?.title}</Text>
                    <Text className="text-sm text-gray-600">{badge?.description}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="flex-row space-x-3">
              <TouchableOpacity className="flex-1 rounded-lg py-1" onPress={onClose}>
                <Text className="text-center text-xl font-extrabold text-[#007AFF]">취소</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 rounded-lg py-1" onPress={() => onSubmit('')}>
                <Text className="text-center text-xl font-extrabold text-[#007AFF]">작성하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
