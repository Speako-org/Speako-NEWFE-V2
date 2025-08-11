import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import BadgeActionModal from '../Modal/BadgeActionModal';
import BadgeConfirmModal from '../Modal/BadgeConfirmModal';

interface Badge {
  icon: string;
  title: string;
  description: string;
}

interface TouchPosition {
  x: number;
  y: number;
}

const Achievement = () => {
  const router = useRouter();
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmModalType, setConfirmModalType] = useState<'wear' | 'share'>('wear');
  const [touchPosition, setTouchPosition] = useState<TouchPosition | null>(null);

  const badges: Badge[] = [
    {
      icon: '🔥',
      title: '긍정의 시작',
      description: '첫번째 긍정적 표현 달성',
    },
    {
      icon: '👍',
      title: '꾸준한 노력',
      description: '7일 연속 기록',
    },
    {
      icon: '✅',
      title: '챌린지 달성',
      description: '월간 챌린지 100% 달성',
    },
    {
      icon: '⭐',
      title: '실천왕',
      description: '부정적 표현 50% 감소',
    },
  ];

  const handleBadgePress = (badge: Badge, index: number) => {
    // 각 뱃지의 원 위치를 미리 계산 (대략적인 위치)
    // 원의 크기가 64px (h-16 w-16)이고, 좌측 여백이 20px, 각 뱃지 간격이 있음
    const baseX = 20 + 32; // 좌측 여백 + 원의 반지름
    const baseY = 120 + index * 80 + 32; // 상단 여백 + (인덱스 * 뱃지 간격) + 원의 반지름

    setTouchPosition({ x: baseX, y: baseY });
    setSelectedBadge(badge);
    setActionModalVisible(true);
  };

  const handleCloseActionModal = () => {
    setActionModalVisible(false);
    setSelectedBadge(null);
  };

  const handleShowBadgeWearModal = () => {
    setActionModalVisible(false);
    setConfirmModalType('wear');
    setConfirmModalVisible(true);
  };

  const handleShowBadgeShareModal = () => {
    setActionModalVisible(false);
    setConfirmModalType('share');
    setConfirmModalVisible(true);
  };

  const handleCloseConfirmModal = () => {
    setConfirmModalVisible(false);
    setSelectedBadge(null);
  };

  const handleConfirmAction = () => {
    if (confirmModalType === 'wear') {
      console.log('Badge wear confirmed');
      handleCloseConfirmModal();
    } else {
      console.log('Badge share confirmed');
      setConfirmModalVisible(false);
      // 소셜 페이지로 이동하면서 뱃지 정보 전달
      router.push({
        pathname: '/(protected)/(tabs)/social',
        params: {
          showShareModal: 'true',
          badgeIcon: selectedBadge?.icon || '',
          badgeTitle: selectedBadge?.title || '',
          badgeDescription: selectedBadge?.description || '',
        },
      });
    }
  };

  return (
    <View className="elevation-3 mx-[20px] mb-[20px] rounded-[10px] bg-white p-[15px]">
      {/* Badges */}

      <Text className="mb-3 p-3 text-xl font-bold">획득한 뱃지</Text>
      {badges.map((badge, index) => (
        <View key={index} className="mb-3 flex-row items-center rounded-lg bg-white p-2">
          <TouchableOpacity
            className="mr-4 h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm active:bg-gray-50"
            onPress={() => handleBadgePress(badge, index)}>
            <Text className="text-3xl">{badge.icon}</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="mb-1 text-xl font-bold text-gray-800">{badge.title}</Text>
            <Text className="text-m text-gray-600">{badge.description}</Text>
          </View>
        </View>
      ))}

      {/* Badge Action Modal */}
      <BadgeActionModal
        visible={actionModalVisible}
        badge={selectedBadge}
        touchPosition={touchPosition}
        onClose={handleCloseActionModal}
        onShowBadgeWearModal={handleShowBadgeWearModal}
        onShowBadgeShareModal={handleShowBadgeShareModal}
      />

      <BadgeConfirmModal
        visible={confirmModalVisible}
        badge={selectedBadge}
        type={confirmModalType}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmAction}
      />
    </View>
  );
};

export default Achievement;
