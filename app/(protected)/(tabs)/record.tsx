import { View, Text, ActivityIndicator } from 'react-native';
import RecordDate from '~/components/RecordDate/RecordDate';
import { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const diffSec = Math.max(0, Math.floor((e - s) / 1000));
  const min = Math.floor(diffSec / 60);
  const sec = diffSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

async function fetchRecordsByDate(dateStr: string): Promise<RecordType[]> {
  const accessToken = await SecureStore.getItemAsync('accessToken');
  const res = await fetch(`${BASE_URL}/transcriptions/?date=${dateStr}`, {
    headers: { accept: '*/*', Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();

  const items: ApiItem[] = data?.result ?? [];
  return items.map((item) => ({
    id: String(item.transcriptionId),
    title: item.title,
    date: item.startTime?.split('T')[0] ?? dateStr,
    duration: calculateDuration(item.startTime, item.endTime),
    status: item.transcriptionStatus ?? 'UNKNOWN',
  }));
}

export default function Record() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const queryClient = useQueryClient();
  const dateStr = formatDate(selectedDate);

  const {
    data: records = [],
    isLoading,
    isFetching,
  } = useQuery<RecordType[]>({
    queryKey: ['records', dateStr],
    queryFn: () => fetchRecordsByDate(dateStr),
    refetchInterval: (query) => {
      const list = query.state.data as RecordType[] | undefined;
      if (!list) return false;

      const hasInProgress = list.some(
        (r: RecordType) => r.status && r.status !== 'ANALYSIS_COMPLETED'
      );
      return hasInProgress ? 5000 : false;
    },
    staleTime: 10_000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const onDeleteRecord = async (id: string) => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
    } catch (e) {
      console.error('삭제 실패:', e);
    } finally {
      queryClient.invalidateQueries({ queryKey: ['records', dateStr] });
    }
  };

  const loading = isLoading || isFetching;

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
