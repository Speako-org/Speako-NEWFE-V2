import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type RecordType = {
  id: string;
  title: string;
  date: string;
  duration: string;
};

interface RecordProps {
  records: RecordType[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function RecordDate({ records, selectedDate, onDateChange }: RecordProps) {
  const router = useRouter();

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    onDateChange(newDate);
  };

  const formattedSelectedDate = selectedDate.toISOString().split('T')[0];

  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];
  const isToday = formattedSelectedDate === formattedToday;

  const handleRecordPress = (record: RecordType) => {
    router.push({
      pathname: '/(protected)/record-detail',
      params: { id: record.id },
    });
  };

  return (
    <View className="mx-[28px] h-[580px] rounded-[15px] bg-white px-[10px] py-[20px]">
      {/* 날짜 이동 컨트롤 */}
      <View className="mx-[15px] my-[20px] flex-row items-center justify-between">
        <TouchableOpacity onPress={() => changeDate(-1)}>
          <AntDesign name="left" size={20} />
        </TouchableOpacity>

        <Text className="text-[20px] font-semibold text-[#8962c8]">{formattedSelectedDate}</Text>

        <TouchableOpacity onPress={() => changeDate(1)} disabled={isToday}>
          <AntDesign name="right" size={20} color={isToday ? '#bbb' : 'black'} />
        </TouchableOpacity>
      </View>

      <View className="mx-[10px] h-[1px] bg-[#eee]" />

      {/* 기록 리스트 */}
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleRecordPress(item)}>
            <View className="mx-[15px] flex-row items-center justify-between py-[20px]">
              <Text className="text-[16px] font-bold">{item.title}</Text>
              <Text className="text-[14px] text-[#777]">{item.duration}</Text>
            </View>
            <View className="mx-[10px] h-[1px] bg-[#eee]" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text className="mx-[15px] mt-[20px] text-[15px] text-[#888]">기록 없음</Text>
        }
      />
    </View>
  );
}
