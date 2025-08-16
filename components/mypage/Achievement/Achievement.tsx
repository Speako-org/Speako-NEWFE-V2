import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import BadgeActionModal from '../../Modal/BadgeActionModal';
import BadgeConfirmModal from '../../Modal/BadgeConfirmModal';
import { badgeApi, Badge as BadgeType } from '../../../api/types/badge';

// 컴포넌트에서 사용하는 Badge 인터페이스 (UI용)
interface BadgeItem {
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
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmModalType, setConfirmModalType] = useState<'wear' | 'share'>('wear');
  const [touchPosition, setTouchPosition] = useState<TouchPosition | null>(null);
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 하드코딩
  const defaultBadges: BadgeItem[] = [
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

  useEffect(() => {
    fetchBadges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await badgeApi.getBadges();

      if (response.isSuccess && response.result) {
        // API 응답을 컴포넌트에서 사용하는 형태로 변환
        const transformedBadges: BadgeItem[] = response.result.map((badge: BadgeType) => ({
          icon: getBadgeIcon(badge.badgeName),
          title: badge.badgeName,
          description: badge.description,
        }));

        setBadges(transformedBadges);
      } else {
        setError(response.message || '뱃지 데이터를 불러오는데 실패했습니다.');
        // 에러 시 기본 데이터 사용
        setBadges(defaultBadges);
      }
    } catch (err) {
      console.error('뱃지 데이터 가져오기 실패:', err);
      setError('네트워크 오류가 발생했습니다.');
      // 에러 시 기본 데이터 사용
      setBadges(defaultBadges);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (badgeName: string): string => {
    // 뱃지 이름에 따른 아이콘 매핑
    const iconMap: { [key: string]: string } = {
      '긍정의 시작': '🔥',
      '꾸준한 노력': '👍',
      '챌린지 달성': '✅',
      실천왕: '⭐',
      '첫 기록': '📝',
      '연속 기록': '📅',
      '개선 달성': '📈',
      '완벽 달성': '🏆',
      마스터: '👑',
    };

    return iconMap[badgeName] || '🎯'; // 기본 아이콘
  };

  const handleBadgePress = (badge: BadgeItem, index: number) => {
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

  if (loading) {
    return (
      <View className="elevation-3 mx-[20px] mb-[20px] rounded-[10px] bg-white p-[15px]">
        <Text className="mb-3 p-3 text-xl font-bold">획득한 뱃지</Text>
        <View className="items-center justify-center py-8">
          <Text className="text-gray-500">뱃지 데이터를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="elevation-3 mx-[20px] mb-[20px] rounded-[10px] bg-white p-[15px]">
      {/* Badges */}
      <Text className="mb-3 p-3 text-xl font-bold">획득한 뱃지</Text>

      {error && (
        <View className="mb-3 rounded-lg bg-yellow-50 p-3">
          <Text className="text-sm text-yellow-700">{error}</Text>
          <Text className="text-xs text-yellow-600">기본 데이터를 표시합니다.</Text>
        </View>
      )}

      {badges.length === 0 ? (
        <View className="items-center justify-center py-8">
          <Text className="text-gray-500">획득한 뱃지가 없습니다.</Text>
        </View>
      ) : (
        badges.map((badge, index) => (
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
        ))
      )}

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
