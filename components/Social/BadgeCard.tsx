import { View, Text } from 'react-native';

export interface Badge {
  icon: string;
  title: string;
  description: string;
  createdAt?: string; // optional 처리
}

interface BadgeCardProps {
  badge: Badge | null;
}

export default function BadgeCard({ badge }: BadgeCardProps) {
  if (!badge) return null;

  // 날짜 포맷 처리
  const acquiredDate = badge.createdAt
    ? `${new Date(badge.createdAt).getMonth() + 1}/${new Date(badge.createdAt).getDate()} 획득`
    : '';

  return (
    <View className="mb-2 mt-2 flex rounded-2xl p-3">
      <View className="flex-row items-center">
        <View className="mr-4 h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-white">
          <Text className="text-4xl">{badge.icon}</Text>
        </View>
        <View className="flex-1">
          <View className="flex flex-row justify-between">
            <Text className="text-base font-bold text-gray-800">{badge.title}</Text>
            <Text className="mb-3 text-sm text-gray-400">{acquiredDate}</Text>
          </View>
          <Text className="text-sm text-gray-600">{badge.description}</Text>
        </View>
      </View>
    </View>
  );
}
