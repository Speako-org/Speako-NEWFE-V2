import { View, Text, TouchableOpacity } from 'react-native';

interface TabBarProps {
  activeTab: 'stats' | 'progress' | 'achievement';
  onTabPress: (tab: 'stats' | 'progress' | 'achievement') => void;
}

const TabBar = ({ activeTab, onTabPress }: TabBarProps) => {
  return (
    <View className="mx-[20px] mb-3 flex-row rounded-lg bg-gray-200 p-1">
      <TouchableOpacity
        className={`flex-1 items-center justify-center rounded-lg py-2 ${activeTab === 'stats' ? 'bg-[#bcabe4]' : ''}`}
        activeOpacity={1}
        onPress={() => onTabPress('stats')}>
        <Text
          className={`text-center text-base font-medium ${activeTab === 'stats' ? 'font-extrabold text-white' : 'text-gray-600'}`}>
          통계
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`flex-1 items-center justify-center rounded-lg py-2 ${activeTab === 'progress' ? 'bg-[#bcabe4]' : ''}`}
        activeOpacity={1}
        onPress={() => onTabPress('progress')}>
        <Text
          className={`text-center text-base font-medium ${activeTab === 'progress' ? 'font-extrabold text-white' : 'text-gray-600'}`}>
          진행도
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`flex-1 items-center justify-center rounded-lg py-2 ${activeTab === 'achievement' ? 'bg-[#bcabe4]' : ''}`}
        activeOpacity={1}
        onPress={() => onTabPress('achievement')}>
        <Text
          className={`text-center text-base font-medium ${activeTab === 'achievement' ? 'font-extrabold text-white' : 'text-gray-600'}`}>
          성과
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TabBar;
