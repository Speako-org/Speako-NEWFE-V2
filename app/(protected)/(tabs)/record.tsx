import { View, Text, ActivityIndicator } from 'react-native';
import RecordDate from '../../../components/RecordDate/RecordDate';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

type RecordType = {
  id: string;
  title: string;
  date: string;
  duration: string;
};

export default function Record() {
  const [records, setRecords] = useState<RecordType[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const BASE_URL = 'https://speako.site/api';

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // 녹음 시간 계산 함수
  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffSec = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);

    const min = Math.floor(diffSec / 60);
    const sec = diffSec % 60;

    const minStr = min.toString().padStart(2, '0');
    const secStr = sec.toString().padStart(2, '0');

    return `${minStr}:${secStr}`;
  };

  const fetchRecords = async (date: Date) => {
    try {
      setLoading(true);
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const response = await fetch(`${BASE_URL}/transcriptions/?date=${formatDate(date)}`, {
        method: 'GET',
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      // console.log(data.result);
      const mappedRecords: RecordType[] = (data.result || []).map((item: any) => ({
        id: item.transcriptionId.toString(),
        title: item.title,
        date: item.startTime.split('T')[0],
        duration: calculateDuration(item.startTime, item.endTime),
      }));
      setRecords(mappedRecords);
    } catch (error) {
      console.error('녹음 기록 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(selectedDate);
  }, [selectedDate]);

  return (
    <View className="flex-1 bg-[#f2f2f2] pt-[90px]">
      {/* 하단 탭바 배경 */}
      <View className="absolute bottom-0 h-[111px] w-full" />

      {/* 상단 헤더 */}
      <View className="mb-5 px-[35px]">
        <Text className="self-start text-[33px] font-bold">음성 기록</Text>
      </View>

      {/* 기록 카드 */}
      <View className="flex-1">
        <RecordDate records={records} onDateChange={setSelectedDate} selectedDate={selectedDate} />
      </View>

      {/* 로딩 오버레이 */}
      {loading && (
        <View className="absolute inset-0 flex-1 items-center justify-center bg-[#f2f2f2]/70">
          <ActivityIndicator size="large" color="#8962C8" />
          <Text className="mt-2 text-gray-500">녹음 기록을 불러오는 중...</Text>
        </View>
      )}
    </View>
  );
}
