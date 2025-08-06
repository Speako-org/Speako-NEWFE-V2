import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Challenge {
  icon: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  color: string;
}

const Challenge = () => {
  const challenges: Challenge[] = [
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
  ];

  const renderProgressBar = (progress: number, total: number) => {
    const percentage = (progress / total) * 100;
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

  return (
    <View className="mx-[20px] mb-[15px] rounded-[10px] bg-white p-[15px]">
      <Text className="mb-4 p-3 text-xl font-bold">챌린지 달성 현황</Text>

      {challenges.map((challenge, index) => (
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
      ))}
    </View>
  );
};

export default Challenge;
