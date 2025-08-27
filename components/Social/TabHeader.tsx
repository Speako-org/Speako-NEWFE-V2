import { View, Text, TouchableOpacity } from 'react-native';

interface TabHeaderProps {
  activeTab: 'feed' | 'friends';
  setActiveTab: (tab: 'feed' | 'friends') => void;
}

export default function TabHeader({ activeTab, setActiveTab }: TabHeaderProps) {
  return (
    <View className="flex-row rounded-xl bg-gray-100 p-1">
      {['feed', 'friends'].map((tab) => (
        <TouchableOpacity
          key={tab}
          className={
            activeTab === tab
              ? 'flex-1 rounded-lg bg-black px-4 py-2'
              : 'flex-1 rounded-lg px-4 py-2'
          }
          onPress={() => setActiveTab(tab as 'feed' | 'friends')}>
          <Text
            className={
              activeTab === tab
                ? 'text-center text-lg font-medium text-white'
                : 'text-center text-lg font-medium text-gray-500'
            }>
            {tab === 'feed' ? '피드' : '친구'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
