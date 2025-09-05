import { View, Text, ActivityIndicator } from 'react-native';
import RecordDate from '~/components/RecordDate/RecordDate';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

type ApiItem = {
  transcriptionId: number;
  title: string;
  startTime: string;
  endTime: string;
  transcriptionStatus: string;
};

export type RecordType = {
  id: string;
  title: string;
  date: string;
  duration: string;
  status: string; // transcriptionStatus 저장
};

const BASE_URL = 'https://speako.site/api';

const formatDate = (date: Date) => date.toISOString().split('T')[0];

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

export default function Record() {
  const [records, setRecords] = useState<RecordType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

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

      const mapped: RecordType[] = (data.result || []).map((item: ApiItem) => ({
        id: String(item.transcriptionId),
        title: item.title,
        date: item.startTime.split('T')[0],
        duration: calculateDuration(item.startTime, item.endTime),
        status: item.transcriptionStatus ?? 'UNKNOWN',
      }));

      setRecords(mapped);
    } catch (e) {
      console.error('녹음 기록 불러오기 실패:', e);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(selectedDate);
  }, [selectedDate]);

  const onDeleteRecord = async (id: string) => {
    // 삭제 API 연결
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <View className="flex-1 bg-[#f2f2f2] pt-[90px]">
      <View className="absolute bottom-0 h-[111px] w-full" />

      <View className="mb-5 px-[35px]">
        <Text className="self-start text-[33px] font-bold">음성 기록</Text>
      </View>

      <View className="flex-1">
        <RecordDate
          records={records}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onDeleteRecord={onDeleteRecord}
        />
      </View>

      {loading && (
        <View className="absolute inset-0 flex-1 items-center justify-center bg-[#f2f2f2]/70">
          <ActivityIndicator size="large" color="#8962C8" />
          <Text className="mt-2 text-gray-500">녹음 기록을 불러오는 중...</Text>
        </View>
      )}
    </View>
  );
}
