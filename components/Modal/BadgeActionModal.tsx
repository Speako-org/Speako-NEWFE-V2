import { View, Text, TouchableOpacity, Modal, Image } from 'react-native';

interface Badge {
  icon: string;
  title: string;
  description: string;
}

interface TouchPosition {
  x: number;
  y: number;
}

interface BadgeActionModalProps {
  visible: boolean;
  badge: Badge | null;
  touchPosition: TouchPosition | null;
  onClose: () => void;
  onBadgeAction?: () => void;
  onUploadAction?: () => void;
  onShowBadgeWearModal?: () => void;
  onShowBadgeShareModal?: () => void;
}

const BadgeActionModal = ({
  visible,
  badge,
  touchPosition,
  onClose,
  onBadgeAction,
  onUploadAction,
  onShowBadgeWearModal,
  onShowBadgeShareModal,
}: BadgeActionModalProps) => {
  if (!badge || !touchPosition) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity className="flex-1 bg-transparent" activeOpacity={1} onPress={onClose}>
        <View className="flex-1">
          {/* 모달을 터치한 위치 기준으로 플로팅 모달 */}
          <View
            style={{
              position: 'absolute',
              left: touchPosition.x + 20, // 뱃지 원의 오른쪽에 위치
              top: touchPosition.y + 260, // 뱃지 원과 비슷한 높이에 위치
            }}>
            <View
              className="rounded-2xl border border-gray-100 bg-white px-2 py-3"
              style={{
                minWidth: 280,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 8,
              }}>
              {/* Action Buttons */}
              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  className="mr-1 flex-1 flex-row items-center rounded-xl bg-gray-50 px-5 py-3"
                  onPress={onShowBadgeWearModal}>
                  <Image
                    source={require('../../assets/badge_on.png')}
                    className="mr-2 h-6 w-6"
                    resizeMode="contain"
                  />
                  <Text className="text-m font-extrabold text-gray-700">뱃지 착용</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="ml-2 flex-1 flex-row items-center rounded-xl bg-gray-50 px-5 py-3"
                  onPress={onShowBadgeShareModal}>
                  <Image
                    source={require('../../assets/upload.png')}
                    className="mr-2 h-6 w-6"
                    resizeMode="contain"
                  />
                  <Text className="text-m font-extrabold text-gray-700">업로드</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default BadgeActionModal;
