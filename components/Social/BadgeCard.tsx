import { View, Text } from 'react-native';

interface Badge {
  icon: string;
  title: string;
  description: string;
  createdAt: string; // ✅ 획득일 추가
}

interface BadgeCardProps {
  badge: Badge | null;
}

export default function BadgeCard({ badge }: BadgeCardProps) {
  if (!badge) return null;

  // 날짜 포맷
  const date = new Date(badge.createdAt);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const acquiredDate = `${month}/${day} 획득`;

  return (
    <View className="flex rounded-lg bg-white p-4">
      <Text className="mb-2 text-[13px] font-semibold text-gray-800">획득한 뱃지</Text>
      <View className="flex-row items-center">
        <View className="mr-4 h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white">
          <Text className="text-2xl">{badge.icon}</Text>
        </View>
        <View className="flex-1">
          <View className="flex flex-row justify-between">
            <Text className="text-base font-bold text-gray-800">{badge.title}</Text>
            <Text className="mt-1 text-[12px] text-gray-400">{acquiredDate}</Text>
          </View>
          <Text className="text-sm text-gray-600">{badge.description}</Text>
        </View>
      </View>
    </View>
  );
}
