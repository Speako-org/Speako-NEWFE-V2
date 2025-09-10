import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';

const KakaoCallback = () => {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKakaoCallback = async () => {
      try {
        const accessToken = searchParams.access_token as string;
        const refreshToken = searchParams.refresh_token as string;
        const error = searchParams.error as string;

        if (error) {
          setError('로그인에 실패했습니다.');
          return;
        }

        if (accessToken) {
          await storeToken(accessToken);
          if (refreshToken) {
            await SecureStore.setItemAsync('refreshToken', refreshToken);
          }
          router.replace('/(protected)/(tabs)/home' as any);
        } else {
          setError('인증 정보를 찾을 수 없습니다.');
        }
      } catch {
        setError('로그인 처리 중 오류가 발생했습니다.');
      }
    };

    handleKakaoCallback();
  }, [searchParams, router]);

  const storeToken = async (token: string) => {
    try {
      await SecureStore.setItemAsync('accessToken', token);
    } catch {
      throw new Error('토큰 저장 실패');
    }
  };

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="mb-4 text-center text-red-500">{error}</Text>
          <Text
            className="text-[#A8A3FF] underline"
            onPress={() => router.replace('/(public)/login' as any)}>
            로그인 페이지로 돌아가기
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return null;
};

export default KakaoCallback;
