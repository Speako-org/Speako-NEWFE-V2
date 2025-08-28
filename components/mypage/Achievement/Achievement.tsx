import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import BadgeActionModal from '../../Modal/BadgeActionModal';
import BadgeConfirmModal from '../../Modal/BadgeConfirmModal';
import { badgeApi, Badge as BadgeType } from '../../../api/types/badge';
import { apiClient } from '../../../api/client';

// 컴포넌트에서 사용하는 Badge 인터페이스 (UI용)
interface BadgeItem {
  userBadgeId: number;
  icon: string;
  title: string;
  description: string;
}

interface TouchPosition {
  x: number;
  y: number;
}

interface AchievementProps {
  currentMainBadgeId?: number;
  onBadgeUpdate?: () => void;
}

const Achievement = ({ currentMainBadgeId, onBadgeUpdate }: AchievementProps) => {
  const router = useRouter();
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmModalType, setConfirmModalType] = useState<'wear' | 'share'>('wear');
  const [touchPosition, setTouchPosition] = useState<TouchPosition | null>(null);
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await badgeApi.getBadges();

      if (response.isSuccess && response.result) {
        // API 응답을 컴포넌트에서 사용하는 형태로 변환
        const transformedBadges: BadgeItem[] = response.result.map((badge: BadgeType) => ({
          userBadgeId: badge.userBadgeId,
          icon: badge.icon,
          title: badge.badgeName,
          description: badge.description,
        }));

        setBadges(transformedBadges);
      } else {
        setError(response.message || '뱃지 데이터를 불러오는데 실패했습니다.');
        setBadges([]);
      }
    } catch (err) {
      console.error('뱃지 데이터 가져오기 실패:', err);
      setError('네트워크 오류가 발생했습니다.');
      setBadges([]);
    } finally {
      setLoading(false);
    }
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

  const handleShowInfoModal = (event: any) => {
    const { pageY } = event.nativeEvent;
    setModalPosition({ x: 0, y: pageY });
    setInfoModalVisible(true);
  };

  const handleCloseInfoModal = () => {
    setInfoModalVisible(false);
  };

  const handleConfirmAction = async () => {
    if (confirmModalType === 'wear') {
      try {
        if (selectedBadge) {
          // currentMainBadgeId가 없으면 0으로 설정 (임시)
          const currentBadgeId = currentMainBadgeId ?? 0;
          const response = await apiClient.patch<{ isSuccess: boolean; message?: string }>(
            '/api/users/badge/main',
            {
              currentMainUserBadgeId: currentBadgeId,
              newMainUserBadgeId: selectedBadge.userBadgeId,
            }
          );

          if (response.isSuccess) {
            // 부모 컴포넌트에 업데이트 알림
            onBadgeUpdate?.();
            handleCloseConfirmModal();
          } else {
            console.error('대표 뱃지 변경 실패:', response.message);
            // TODO: 사용자에게 에러 메시지 표시
          }
        }
      } catch (error) {
        console.error('대표 뱃지 변경 실패:', error);
        // TODO: 사용자에게 에러 메시지 표시
      }
    } else {
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
      <View className="mb-3 flex-row items-center p-3">
        <Text className="text-xl font-bold">획득한 뱃지</Text>
        <TouchableOpacity onPress={handleShowInfoModal} className="ml-2 p-1">
          <Image
            source={require('../../../assets/information.png')}
            style={{ width: 16, height: 16 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

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
              className="mr-5 h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm active:bg-gray-50"
              onPress={() => handleBadgePress(badge, index)}>
              <Text className="text-3xl">{badge.icon}</Text>
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="mb-1 text-xl font-bold text-gray-800">{badge.title}</Text>
              <Text className="text-m text-gray-600" style={{ lineHeight: 20 }}>
                {badge.description}
              </Text>
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

      {/* 획득한 뱃지 정보 모달 */}
      <Modal
        visible={infoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseInfoModal}>
        <View className="flex-1 bg-black/50">
          <TouchableOpacity className="flex-1" activeOpacity={1} onPress={handleCloseInfoModal}>
            <View
              className="flex-1 items-center pr-[10px]"
              style={{
                paddingTop: Math.max(modalPosition.y - 140, 50),
                paddingBottom: Math.max(100, 50),
              }}>
              <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                <View className="w-120 rounded-xl border border-gray-200 bg-[#ffffff] p-4 ">
                  <Text className="text-left text-sm text-gray-700">
                    <Text className="text-base font-bold text-gray-800">뱃지를 터치</Text>하면
                    착용하기와 공유하기가 가능합니다.
                    {'\n\n'}
                    <Text className="text-base font-bold text-gray-800">착용하기</Text> - 프로필에
                    뱃지를 달아보세요!{'\n'}
                    <Text className="text-base font-bold text-gray-800">공유하기</Text> - 사람들에게
                    뱃지 획득 사연을 공유해보세요 🔥
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default Achievement;
