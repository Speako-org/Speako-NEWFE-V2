import React from 'react';
import { View, Text } from 'react-native';

interface Badge {
  icon: string;
  title: string;
  description: string;
}

const Achievement = () => {
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

  return (
    <View className="elevation-3 mx-[20px] mb-[20px] rounded-[10px] bg-white p-[15px]">
      {/* Badges */}

      <Text className="mb-3 p-3 text-xl font-bold">획득한 뱃지</Text>
      {badges.map((badge, index) => (
        <View key={index} className="mb-3 flex-row items-center rounded-lg bg-white p-2">
          <View className="mr-4 h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
            <Text className="text-3xl">{badge.icon}</Text>
          </View>
          <View className="flex-1">
            <Text className="mb-1 text-xl font-bold text-gray-800">{badge.title}</Text>
            <Text className="text-m text-gray-600">{badge.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default Achievement;
