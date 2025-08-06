import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import EmotionChart from '../../../components/Chart/EmotionChart';
import Achievement from '../../../components/Achievement';
import Challenge from '../../../components/Challenge';
import { useState } from 'react';

const Mypage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'stats' | 'progress' | 'achievement'>('stats');

  const renderTabBar = () => (
    <View className="mx-[20px] mb-3 flex-row rounded-lg bg-gray-100 p-1">
      <TouchableOpacity
        className={`flex-1 items-center justify-center rounded-lg py-2 ${activeTab === 'stats' ? 'bg-black' : ''}`}
        onPress={() => setActiveTab('stats')}>
        <Text
          className={`text-center text-base font-medium ${activeTab === 'stats' ? 'text-white' : 'text-gray-600'}`}>
          통계
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`flex-1 items-center justify-center rounded-lg py-2 ${activeTab === 'progress' ? 'bg-black' : ''}`}
        onPress={() => setActiveTab('progress')}>
        <Text
          className={`text-center text-base font-medium ${activeTab === 'progress' ? 'text-white' : 'text-gray-600'}`}>
          진행도
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`flex-1 items-center justify-center rounded-lg py-2 ${activeTab === 'achievement' ? 'bg-black' : ''}`}
        onPress={() => setActiveTab('achievement')}>
        <Text
          className={`text-center text-base font-medium ${activeTab === 'achievement' ? 'text-white' : 'text-gray-600'}`}>
          성과
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStatsContent = () => (
    <View>
      {/* 월간 성과 박스 */}
      <View className="mx-[20px] mb-[15px] rounded-[10px] bg-white p-[15px]">
        <Text className="mb-3 p-3 text-xl font-bold">월간 성과</Text>
        <View className="flex-row justify-between">
          <View className="mx-1 flex-1 items-center rounded-lg bg-purple-50 p-5">
            <Text className="mb-1 text-3xl font-bold  text-[#5196E2]">85%</Text>
            <Text className="text-center text-sm text-gray-600">긍정 표현 사용률</Text>
          </View>
          <View className="mx-1 flex-1 items-center rounded-lg bg-purple-50 p-5">
            <Text className="mb-1 text-3xl font-bold">32</Text>
            <Text className="text-center text-sm text-gray-600">연속 기록일 수</Text>
          </View>
        </View>
      </View>

      {/* 언어 습관 그래프 박스 */}
      <View className="mx-[20px] mb-[15px] rounded-[10px] bg-white p-[15px]">
        <EmotionChart />
      </View>
    </View>
  );

  const renderProgressContent = () => <Challenge />;

  const renderAchievementContent = () => <Achievement />;

  return (
    <ScrollView
      className="flex-1 pt-[60px]"
      contentContainerStyle={{ paddingBottom: 150 }}
      showsVerticalScrollIndicator={true}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-[25px] pb-5">
        <Text className="text-[28px] font-bold text-black">마이페이지</Text>
        <TouchableOpacity
          className="p-[5px]"
          onPress={() => router.push({ pathname: '/(protected)/Setting' })}>
          <Ionicons name="settings-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View className="mx-[20px] mb-[30px] mt-[15px] rounded-[10px] bg-white px-[15px] pt-5 ">
        {/* Profile Info */}
        <View className="mb-5 flex-row items-center">
          <Image
            source={require('../../../assets/default-profile.png')}
            className="mr-[15px] h-[60px] w-[60px] rounded-full"
          />
          <View className="flex-1">
            <View className="mb-2 flex-row items-center">
              <Text className="mr-[5px] text-[18px] font-bold text-black">박은지</Text>
              <Text className="rounded-full bg-[#eadeff] px-2 py-1 text-[9px] font-bold text-[#8953e0]">
                긍정 마스터
              </Text>
            </View>
            <Text className="text-[13px] font-semibold text-gray-500">
              매일 긍정적인 표현을 연습하며 성장중입니다.
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View className="mb-[20px] mt-[10px] flex-row justify-between">
          <View className="flex-1 items-center">
            <Text className="mb-[5px] text-[18px] font-bold text-black">42</Text>
            <Text className="text-[14px] font-semibold text-gray-500">기록 횟수</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="mb-[5px] text-[18px] font-bold text-black">56%</Text>
            <Text className="text-[14px] font-semibold text-gray-500">긍정 표현</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="mb-[5px] text-[18px] font-bold text-[#A088E0]">+65%</Text>
            <Text className="text-[14px] font-semibold text-gray-500">개선율</Text>
          </View>
        </View>
      </View>

      {/* Tab Bar */}
      {renderTabBar()}

      {/* Tab Content */}
      {activeTab === 'stats' && renderStatsContent()}
      {activeTab === 'progress' && renderProgressContent()}
      {activeTab === 'achievement' && renderAchievementContent()}
    </ScrollView>
  );
};

export default Mypage;
