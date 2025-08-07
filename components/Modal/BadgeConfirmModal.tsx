import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';

interface Badge {
  icon: string;
  title: string;
  description: string;
}

interface BadgeConfirmModalProps {
  visible: boolean;
  badge: Badge | null;
  type: 'wear' | 'share'; // 모달 타입 구분
  onClose: () => void;
  onConfirm: () => void;
}

const BadgeConfirmModal = ({
  visible,
  badge,
  type,
  onClose,
  onConfirm,
}: BadgeConfirmModalProps) => {
  if (!badge) return null;

  const getMessage = () => {
    return type === 'wear' ? '뱃지를 착용하시겠습니까?' : '뱃지를 공유하시겠습니까?';
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity className="flex-1 bg-black/50" activeOpacity={1} onPress={onClose}>
        <View className="flex-1 items-center justify-center">
          <View className="mx-4 rounded-3xl bg-white p-4" style={{ minWidth: 270 }}>
            {/* Title */}
            <View className="mb-2 items-center">
              <Text className="mt-2 text-center text-xl font-black text-gray-800">
                {badge.icon} {badge.title} {badge.icon}
              </Text>
            </View>

            {/* Message */}
            <View className="mb-5 items-center">
              <Text className="text-m text-center font-medium text-black">{getMessage()}</Text>
              {/* 구분선 */}
              <View className="-mb-3 mt-4 h-px w-3/4 bg-gray-200" />
            </View>

            {/* Buttons */}
            <View className="flex-row space-x-3">
              <TouchableOpacity className="mt-2 flex-1 rounded-xl px-4" onPress={onClose}>
                <Text className="text-center text-xl font-extrabold text-[#007AFF]">취소</Text>
              </TouchableOpacity>
              <TouchableOpacity className="mt-2 flex-1 rounded-xl px-4" onPress={onConfirm}>
                <Text className="text-center text-xl font-extrabold text-[#007AFF]">확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default BadgeConfirmModal;
