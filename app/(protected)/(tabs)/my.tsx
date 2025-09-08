import { View, Text, TouchableOpacity, Image, ScrollView, Modal } from 'react-native';
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
  const [showImprovementModal, setShowImprovementModal] = useState(false);
  const [showMonthlyStatsModal, setShowMonthlyStatsModal] = useState(false);
  const [showEmotionChartModal, setShowEmotionChartModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

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

  const handleEditComment = () => {
    router.push({ pathname: '/profile-edit' as any });
  };

  const renderStatsContent = () => (
    <View>
      {/* 월간 성과 박스 */}
      <View className="mx-[20px] mb-[15px] rounded-[10px] bg-white p-[15px]">
        <View className="mb-3 flex-row items-center p-3">
          <Text className="text-xl font-bold">월간 성과</Text>
          <TouchableOpacity
            onPress={(event) => {
              const { pageY } = event.nativeEvent;
              setModalPosition({ x: 0, y: pageY });
              setShowMonthlyStatsModal(true);
            }}
            className="ml-2 p-1">
            <Image
              source={require('../../../assets/information.png')}
              style={{ width: 16, height: 16 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
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
        <EmotionChart
          onShowInfoModal={(event) => {
            const { pageY } = event.nativeEvent;
            setModalPosition({ x: 0, y: pageY });
            setShowEmotionChartModal(true);
          }}
        />
      </View>
    </View>
  );

  const renderProgressContent = () => <Challenge />;

  const renderAchievementContent = () => (
    <Achievement
      currentMainBadgeId={profileData?.mainBadgeId}
      onBadgeUpdate={() => {
        // 프로필 데이터 다시 불러오기
        const fetchProfile = async () => {
          try {
            const response = await myPageApi.getMyPageInfo();
            if (response.isSuccess && response.result) {
              setProfileData(response.result.achievement);
              setMonthlyStats(response.result.monthlyStats);
            }
          } catch (error) {
            console.error('프로필 데이터 새로고침 실패:', error);
          }
        };
        fetchProfile();
      }}
    />
  );

  return (
    <>
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
            <View className="mr-[15px] h-[60px] w-[60px] items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100">
              <Image
                source={
                  profileData?.profileImageUrl
                    ? { uri: profileData.profileImageUrl }
                    : require('../../../assets/default-profile.png')
                }
                className="h-[52px] w-[52px] rounded-full"
                resizeMode="cover"
              />
            </View>
            <View className="flex-1">
              <View className="mb-2 flex-row items-center">
                <Text className="mr-[7px] mt-3 text-[18px] font-bold text-black">
                  {profileData?.nickname}
                </Text>
                <Text className="mt-3 rounded-full bg-[#eadeff] px-2 py-1 text-[9px] font-bold text-[#8953e0]">
                  {profileData?.mainBadgeName}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 text-[13px] font-medium text-gray-500">
                  {profileData?.selfComment}
                </Text>
                <TouchableOpacity onPress={handleEditComment} className="ml-2">
                  <Image
                    source={require('../../../assets/profile_edit.png')}
                    className="h-6 w-6"
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
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
              <View className="items-center">
                <Text className="text-[14px] font-semibold text-gray-500">개선율</Text>
                <TouchableOpacity
                  onPress={(event) => {
                    const { pageY } = event.nativeEvent;
                    setModalPosition({ x: 0, y: pageY });
                    setShowImprovementModal(true);
                  }}
                  className="absolute -right-6 top-0">
                  <Image
                    source={require('../../../assets/information.png')}
                    style={{ width: 14, height: 14 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
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

      {/* 개선율 정보 모달 */}
      <Modal visible={showImprovementModal} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/50">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setShowImprovementModal(false)}>
            <View
              className="flex-1 items-end pr-[35px]"
              style={{
                paddingTop: Math.max(modalPosition.y - 120, 50),
                paddingBottom: Math.max(100, 50),
              }}>
              <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                <View className="w-90 rounded-xl border border-gray-300 bg-[#ffffff] p-5">
                  <Text className="text-left text-sm text-gray-700">
                    성과에서의 뱃지를 기준으로 개선율이 올라갑니다.{'\n'}
                    <Text className="text-base font-bold text-gray-800">
                      뱃지를 획득할수록 개선율이 증가
                    </Text>
                    하며,{'\n'}
                    이를 통해 사용자의 성장을 측정할 수 있습니다.
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* 월간 성과 정보 모달 */}
      <Modal visible={showMonthlyStatsModal} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/40">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setShowMonthlyStatsModal(false)}>
            <View
              className="flex-1 items-end pr-[60px]"
              style={{
                paddingTop: Math.max(modalPosition.y - 140, 50),
                paddingBottom: Math.max(100, 50),
              }}>
              <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                <View className="w-90 rounded-xl  bg-[#ffffff] p-5">
                  <Text className="text-left text-sm text-gray-700">
                    월간 성과는 이번 달의 기록 데이터를 기반으로 합니다.{'\n\n'}
                    <Text className="text-base font-bold text-gray-800">긍정 표현 사용률</Text> -
                    전체 기록에서 긍정적 표현의 비율{'\n'}
                    <Text className="text-base font-bold text-gray-800">연속 기록일 수</Text> - 가장
                    긴 연속 기록 기간
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* 언어 습관 그래프 정보 모달 */}
      <Modal visible={showEmotionChartModal} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/50">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setShowEmotionChartModal(false)}>
            <View
              className="flex-1 items-end pr-[60px]"
              style={{
                paddingTop: Math.max(modalPosition.y - 120, 50),
                paddingBottom: Math.max(100, 50),
              }}>
              <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                <View className="w-90 rounded-xl bg-[#ffffff] p-5">
                  <Text className="text-left text-sm text-gray-700">
                    언어 습관 그래프는 사용자의{' '}
                    <Text className="text-base font-bold text-gray-800">월별 언어 습관 패턴</Text>을
                    {'\n'}
                    보여줍니다. {'\n'}각 감정별 사용 빈도를 확인해보세요! 💁🏻‍♀️
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

export default Mypage;
