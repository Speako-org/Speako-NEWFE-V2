import { View, Text, RefreshControl, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { challengeApi, Challenge as ChallengeType } from '../../../api/types/challenge';

interface ChallengeItem {
  icon: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  color: string;
}

const Challenge = () => {
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChallenges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchChallenges = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await challengeApi.getActiveChallenges();

      if (response.isSuccess && response.result) {
        // API 응답을 컴포넌트에서 사용하는 형태로 변환
        const transformedChallenges: ChallengeItem[] = response.result.map(
          (challenge: ChallengeType, index: number) => ({
            icon: getChallengeIcon(challenge.levelName),
            title: challenge.challengeName,
            description: challenge.description,
            progress: challenge.currentAmount,
            total: challenge.requiredAmount,
            color: getChallengeColor(index),
          })
        );

        setChallenges(transformedChallenges);
      } else {
        setError(response.message || '챌린지 데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('챌린지 데이터 가져오기 실패:', err);
      setError('네트워크 오류가 발생했습니다.');

      // 에러 시 기본 데이터 표시
      setChallenges([
        {
          icon: '👍',
          title: '7일 연속 기록',
          description: '일주일 동안 매일 음성을 기록했어요',
          progress: 5,
          total: 7,
          color: '#FF6B6B',
        },
        {
          icon: '⭐️',
          title: '부정 표현 감소',
          description: '부정적 표현을 50% 이상 줄였어요',
          progress: 35,
          total: 50,
          color: '#FFD93D',
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchChallenges(true);
  };

  const getChallengeIcon = (levelName: string): string => {
    switch (levelName.toLowerCase()) {
      case 'beginner':
        return '🌱';
      case 'intermediate':
        return '⭐️';
      case 'advanced':
        return '🏆';
      case 'expert':
        return '👑';
      default:
        return '🎯';
    }
  };

  const getChallengeColor = (index: number): string => {
    const colors = ['#FF6B6B', '#FFD93D', '#6BCF7F', '#4D96FF', '#FF8E53'];
    return colors[index % colors.length];
  };

  const renderProgressBar = (progress: number, total: number) => {
    const percentage = total > 0 ? (progress / total) * 100 : 0;
    return (
      <View className="flex-row items-center">
        <View className="mr-3 h-2 flex-1 rounded-full bg-gray-200">
          <View className="h-2 rounded-full bg-[#c5d4ff]" style={{ width: `${percentage}%` }} />
        </View>
        <Text className="text-sm font-medium text-gray-600">
          {progress}/{total}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="mx-[20px] mb-[15px] rounded-[10px] bg-white p-[15px]">
        <Text className="mb-4 p-3 text-xl font-bold">챌린지 달성 현황</Text>
        <View className="items-center justify-center py-8">
          <Text className="text-gray-500">챌린지 데이터를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="mx-[20px] mb-[15px] rounded-[10px] bg-white p-[15px]">
        <Text className="mb-4 p-3 text-xl font-bold">챌린지 달성 현황</Text>
        <View className="items-center justify-center py-8">
          <Text className="mb-2 text-red-500">{error}</Text>
          <Text className="text-sm text-gray-500">기본 데이터를 표시합니다.</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      className="mx-[20px] mb-[15px] rounded-[10px] bg-white p-[15px]">
      <Text className="mb-4 p-3 text-xl font-bold">챌린지 달성 현황</Text>

      {challenges.length === 0 ? (
        <View className="items-center justify-center py-8">
          <Text className="text-gray-500">진행 중인 챌린지가 없습니다.</Text>
        </View>
      ) : (
        challenges.map((challenge, index) => (
          <View
            key={index}
            className="mb-4 flex-row items-center rounded-lg border border-gray-100 bg-white p-4">
            <View className="flex-1">
              <Text className="mb-1 text-lg font-bold text-gray-800">{challenge.title}</Text>
              <Text className="text-m mb-3 text-gray-600">{challenge.description}</Text>
              {renderProgressBar(challenge.progress, challenge.total)}
            </View>

            <View className="ml-4 h-12 w-12 items-center justify-center rounded-full">
              <Text className="text-4xl">{challenge.icon}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default Challenge;
