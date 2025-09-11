import { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

type Achievement = {
  nickname: string;
  profileImageUrl: string | null;
  mainBadgeName: string | null;
  selfComment: string | null;
  totalRecordedDays: number;
  avgPositiveRatio: number;
  badgeAcquisitionRate: number;
};

type MonthlyStat = {
  year: number;
  month: number;
  avgPositiveRatio: number;
  avgNegativeRatio: number;
  maxStreak: number;
};

type BadgeItem = {
  userBadgeId: number;
  badgeName: string;
  description: string;
  icon: string;
  createAt: string;
  posted: boolean;
};

type MyPageResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    achievement: Achievement;
    monthlyStats?: MonthlyStat[] | null;
    userBadges?: BadgeItem[] | null;
  };
};

const BASE_URL = 'https://speako.site';

export default function OtherProfilePage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [ach, setAch] = useState<Achievement | null>(null);
  const [badges, setBadges] = useState<BadgeItem[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;

      setLoading(true);
      setErr(null);
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        const res = await fetch(`${BASE_URL}/api/users/${id}/mypage`, {
          headers: {
            accept: '*/*',
            Authorization: `Bearer ${token}`,
          },
        });
        const data: MyPageResponse = await res.json();

        if (!data?.isSuccess) {
          throw new Error(data?.message || '마이페이지 조회 실패');
        }

        if (!mounted) return;
        setAch(data.result.achievement);

        // 서버에서 내려오는 userBadges 사용
        setBadges(data.result.userBadges ?? []);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message ?? '데이터를 불러오지 못했습니다.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#8962C8" />
        <Text className="mt-2 text-gray-500">프로필을 불러오는 중…</Text>
      </View>
    );
  }

  if (!ach) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-center text-red-500">{err ?? '정보를 표시할 수 없어요.'}</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 px-4 py-3">
          <Text className="font-semibold text-[#8962C8]">뒤로가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const nickname = ach.nickname || '사용자';
  const positivePct = Math.round((ach.avgPositiveRatio ?? 0) * 100);
  const improvementPct = Math.round(ach.badgeAcquisitionRate ?? 0);

  return (
    <View className="flex-1 bg-[#F4F5F7] pt-[60px]">
      <View className="mb-[10px] flex-row items-center justify-between px-[20px]">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}>
        {/* 프로필 카드 */}
        <View className="mx-5 mt-3 rounded-2xl bg-white p-7">
          <View className="flex-row items-center">
            <Image
              source={
                ach.profileImageUrl
                  ? { uri: ach.profileImageUrl }
                  : require('~/assets/default-profile.png')
              }
              className="h-14 w-14 rounded-full"
              resizeMode="cover"
            />
            <View className="ml-4 flex-1">
              <View className="mb-2 flex-row items-center">
                <Text className="mr-2 text-[18px] font-extrabold text-black">{nickname}</Text>
                {!!ach.mainBadgeName && (
                  <View className="rounded-full bg-[#EDE7FF] px-2 py-1">
                    <Text className="text-[10px] font-bold text-[#8C5BE0]">
                      {ach.mainBadgeName}
                    </Text>
                  </View>
                )}
              </View>
              {!!ach.selfComment && (
                <Text className="text-[13px] text-gray-700">{ach.selfComment}</Text>
              )}
            </View>
          </View>

          <View className="mt-7 flex-row items-center justify-around">
            <View className="items-center">
              <Text className="text-xl font-extrabold text-black">{ach.totalRecordedDays}</Text>
              <Text className="mt-1 text-[12px] text-gray-500">기록 일 수</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-extrabold text-black">{positivePct}%</Text>
              <Text className="mt-1 text-[12px] text-gray-500">긍정 표현</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-extrabold text-[#9C84EE]">+{improvementPct}%</Text>
              <Text className="mt-1 text-[12px] text-gray-500">개선율</Text>
            </View>
          </View>
        </View>

        {/* 획득 뱃지 */}
        <View className="mx-5 mt-5 rounded-2xl bg-white p-7">
          <Text className="text-[18px] font-extrabold text-black">획득한 뱃지</Text>

          {badges.map((b) => (
            <View key={b.userBadgeId} className="mt-7 flex-row items-center">
              <View className="mr-5 h-12 w-12 items-center justify-center rounded-full bg-white shadow shadow-gray-300">
                <Text style={{ fontSize: 20 }}>{b.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-extrabold text-black">{b.badgeName}</Text>
                <Text className="mt-1 text-[12px] text-gray-500">{b.description}</Text>
              </View>
            </View>
          ))}

          {badges.length === 0 && (
            <Text className="text-[13px] text-gray-400">아직 획득한 뱃지가 없어요.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
