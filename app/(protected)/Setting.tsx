import { Text, View, ScrollView, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function Setting() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleLogout = async () => {
    Alert.alert('로그아웃', '로그아웃을 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '확인',
        style: 'destructive',
        onPress: async () => {
          try {
            if (Platform.OS === 'web') {
              // 웹 환경에서 모든 토큰 삭제
              localStorage.removeItem('accessToken');
              sessionStorage.removeItem('accessToken');
              localStorage.removeItem('rememberMe');
              localStorage.removeItem('userEmail');

              // 쿠키 삭제
              document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

              console.log('웹 환경 로그아웃 완료');
            } else {
              // 모바일 환경에서 모든 토큰 삭제
              try {
                await SecureStore.deleteItemAsync('accessToken');
                await SecureStore.deleteItemAsync('rememberMe');
                await SecureStore.deleteItemAsync('userEmail');
                console.log('모바일 환경 로그아웃 완료');
              } catch (error) {
                console.log('SecureStore 삭제 실패:', error);
                // 대안: localStorage 사용
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('rememberMe');
                  localStorage.removeItem('userEmail');
                }
              }
            }

            // 로그인 화면으로 이동
            router.replace({ pathname: '/(public)/login' });
          } catch (error) {
            console.log('로그아웃 중 오류:', error);
            // 오류가 발생해도 로그인 화면으로 이동
            router.replace({ pathname: '/(public)/login' });
          }
        },
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-[#f2f2f2] px-[20px] pb-[200px] pt-[60px]">
      <View className="absolute bottom-0 h-[111px] w-full bg-white" />

      {/* 헤더 */}
      <View className="mb-[10px] flex-row items-center justify-between">
        <TouchableOpacity className="p-[5px]" onPress={handleBack}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      {/* 알림 설정 */}
      <View className="mb-[10px] rounded-[12px] border border-[#eee] bg-[#f9f9f9] p-[14px]">
        <View className="mx-[2px] my-[7px] flex-row items-center gap-[7px]">
          <Ionicons name="notifications-outline" size={20} />
          <Text className="text-[18px] font-bold">알림 설정</Text>
        </View>

        <View className="my-[12px] mb-[20px] h-[1px] bg-[#ddd]" />

        <View className="mb-[10px] flex-row items-center justify-between">
          <View className="flex-1 px-[5px]">
            <View className="flex-row items-center justify-between">
              <Text className="mb-[7px] text-[17px] font-bold">녹음 알림</Text>
              <Switch
                value={true}
                trackColor={{ false: '#ccc', true: '#65558F' }}
                thumbColor="#fff"
                style={{ transform: [{ scale: 0.8 }] }}
              />
            </View>
            <Text className="mb-[8px] text-[14px] text-[#666]">매일 녹음 시간 알림</Text>
          </View>
        </View>

        <View className="mb-[10px] flex-row items-center justify-between">
          <View className="flex-1 px-[5px]">
            <View className="flex-row items-center justify-between">
              <Text className="mb-[7px] text-[17px] font-bold">연습 알림</Text>
              <Switch
                value={true}
                trackColor={{ false: '#ccc', true: '#65558F' }}
                thumbColor="#fff"
                style={{ transform: [{ scale: 0.8 }] }}
              />
            </View>
            <Text className="mb-[8px] text-[14px] text-[#666]">긍정적 표현 연습 리마인더</Text>
          </View>
        </View>
      </View>

      {/* 일반 설정 */}
      <View className="mb-[10px] rounded-[12px] border border-[#eee] bg-[#f9f9f9] p-[14px]">
        <View className="mx-[2px] my-[7px] flex-row items-center gap-[7px]">
          <Ionicons name="settings-outline" size={20} />
          <Text className="text-[18px] font-bold">일반 설정</Text>
        </View>

        <View className="my-[12px] mb-[20px] h-[1px] bg-[#ddd]" />

        {/* 다크모드 */}
        <View className="mb-[10px] flex-row items-center justify-between">
          <View className="flex-1 px-[5px]">
            <View className="flex-row items-center justify-between">
              <Text className="mb-[7px] text-[17px] font-bold">다크 모드</Text>
              <Switch
                value={true}
                trackColor={{ false: '#ccc', true: '#65558F' }}
                thumbColor="#fff"
                style={{ transform: [{ scale: 0.8 }] }}
              />
            </View>
            <Text className="mb-[8px] text-[14px] text-[#666]">어두운 테마 사용</Text>
          </View>
        </View>

        {/* 언어 설정 */}
        <View className="mb-[10px] flex-row items-center justify-between">
          <View className="flex-1 px-[5px]">
            <Text className="mb-[7px] text-[17px] font-bold">언어 설정</Text>
          </View>
          <TouchableOpacity className="items-center justify-center rounded-md border border-[#ccc] bg-white px-[12px] py-[8px]">
            <Text className="text-[14px] text-[#333]">한국어</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 계정 관리 */}
      <View className="rounded-[12px] border border-[#eee] bg-[#f9f9f9] p-[14px]">
        <View className="mx-[2px] my-[7px] flex-row items-center gap-[7px]">
          <Ionicons name="person-circle-outline" size={23} />
          <Text className="text-[18px] font-bold">계정 관리</Text>
        </View>

        <View className="my-[12px] mb-[20px] h-[1px] bg-[#ddd]" />

        {/* 계정 정보 */}
        <View className="mb-[10px] flex-row items-center justify-between">
          <View className="flex-1 px-[5px]">
            <Text className="mb-[7px] text-[17px] font-bold">계정 정보 변경</Text>
            <Text className="mb-[8px] text-[14px] text-[#666]">비밀번호, 이메일 등 변경</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </View>

        {/* 데이터 관리 */}
        <View className="mb-[10px] flex-row items-center justify-between">
          <View className="flex-1 px-[5px]">
            <Text className="mb-[7px] text-[17px] font-bold">데이터 관리</Text>
            <Text className="mb-[8px] text-[14px] text-[#666]">데이터 백업 및 삭제</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </View>

        {/* 로그아웃 */}
        <TouchableOpacity
          className="flex-row items-center gap-[6px] px-[5px] py-[10px]"
          onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={16} color="#e53935" />
          <Text className="text-[16px] font-semibold text-[#e53935]">로그아웃</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
