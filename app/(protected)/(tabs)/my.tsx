import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import EmotionChart from '../../../components/mypage/Chart/EmotionChart';
import Achievement from '../../../components/mypage/Achievement';
import Challenge from '../../../components/mypage/Challenge';
import TabBar from '../../../components/mypage/TabBar';
import { useState, useEffect } from 'react';
import {
  myPageApi,
  Achievement as AchievementType,
  MonthlyStat,
} from '../../../api/types/statistic';

const Mypage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'stats' | 'progress' | 'achievement'>('stats');
  const [profileData, setProfileData] = useState<AchievementType | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[] | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await myPageApi.getMyPageInfo();

        if (response.isSuccess && response.result) {
          setProfileData(response.result.achievement);
          setMonthlyStats(response.result.monthlyStats);
        } else {
          console.error('마이페이지 데이터 로드 실패:', response.message);
        }
      } catch (error) {
        console.error('데이터 불러오기 실패:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleTabPress = (tab: 'stats' | 'progress' | 'achievement') => {
    setActiveTab(tab);
  };

  const renderStatsContent = () => (
    <View>
      {/* 월간 성과 박스 */}
      <View className="mx-[20px] mb-[15px] rounded-[10px] bg-white p-[15px]">
        <Text className="mb-3 p-3 text-xl font-bold">월간 성과</Text>
        <View className="flex-row justify-between">
          <View className="mx-1 flex-1 items-center rounded-lg bg-purple-50 p-5">
            <Text className="mb-1 text-3xl font-bold text-[#5196E2]">
              {' '}
              {((monthlyStats?.[0]?.avgPositiveRatio ?? 0) * 100).toFixed(0)}%
            </Text>
            <Text className="text-center text-sm text-gray-600">긍정 표현 사용률</Text>
          </View>
          <View className="mx-1 flex-1 items-center rounded-lg bg-purple-50 p-5">
            <Text className="mb-1 text-3xl font-bold">{monthlyStats?.[0]?.maxStreak}</Text>
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
      className="flex-1 pt-[80px]"
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
            source={
              profileData?.profileImageUrl
                ? { uri: profileData.profileImageUrl }
                : require('../../../assets/default-profile.png')
            }
            className="mr-[15px] h-[60px] w-[60px] rounded-full"
          />
          <View className="flex-1">
            <View className="mb-2 flex-row items-center">
              <Text className="mr-[5px] text-[18px] font-bold text-black">
                {profileData?.nickname}
              </Text>
              <Text className="rounded-full bg-[#eadeff] px-2 py-1 text-[9px] font-bold text-[#8953e0]">
                {profileData?.mainBadgeName}
              </Text>
            </View>
            <Text className="text-[13px] font-semibold text-gray-500">
              {profileData?.selfComment}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View className="mb-[20px] mt-[10px] flex-row justify-between">
          <View className="flex-1 items-center">
            <Text className="mb-[5px] text-[18px] font-bold text-black">
              {profileData?.totalRecordedDays}
            </Text>
            <Text className="text-[14px] font-semibold text-gray-500">기록 횟수</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="mb-[5px] text-[18px] font-bold text-black">
              {((profileData?.avgPositiveRatio ?? 0) * 100).toFixed(0)}%
            </Text>
            <Text className="text-[14px] font-semibold text-gray-500">긍정 표현</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="mb-[5px] text-[18px] font-bold text-[#A088E0]">
              +{((profileData?.badgeAcquisitionRate ?? 0) * 100).toFixed(0)}%
            </Text>
            <Text className="text-[14px] font-semibold text-gray-500">개선율</Text>
          </View>
        </View>
      </View>

      {/* Tab Bar */}
      <TabBar activeTab={activeTab} onTabPress={handleTabPress} />

      {/* Tab Content */}
      {activeTab === 'stats' && renderStatsContent()}
      {activeTab === 'progress' && renderProgressContent()}
      {activeTab === 'achievement' && renderAchievementContent()}
    </ScrollView>
  );
};

export default Mypage;
