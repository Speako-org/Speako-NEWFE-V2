import { FlatList, Text, TouchableOpacity, View, Animated } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import { useRef } from 'react';

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
  onDeleteRecord: (id: string) => void; // ✅ 추가
}

export default function RecordDate({
  records,
  selectedDate,
  onDateChange,
  onDeleteRecord,
}: RecordProps) {
  const router = useRouter();
  const openedRef = useRef<Swipeable | null>(null); // 현재 열린 스와이프 아이템

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
      pathname: 'record-detail',
      params: { id: record.id },
    });
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    id: string
  ) => {
    const translateX = dragX.interpolate({
      inputRange: [-120, 0],
      outputRange: [0, 40],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={{
          width: 100,
          backgroundColor: '#ef4444',
          justifyContent: 'center',
          alignItems: 'center',
          transform: [{ translateX }],
          marginVertical: 10,
          marginRight: 10,
        }}>
        <TouchableOpacity
          onPress={() => {
            openedRef.current?.close();
            onDeleteRecord(id);
          }}
          className="items-center justify-center"
          accessibilityLabel="기록 삭제">
          <AntDesign name="delete" size={22} color="#fff" />
          <Text className="mt-[6px] text-[12px] font-semibold text-white">삭제</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderItem = ({ item }: { item: RecordType }) => {
    let swipeRef: Swipeable | null = null;

    return (
      <Swipeable
        ref={(ref) => {
          swipeRef = ref;
        }}
        onSwipeableOpen={() => {
          if (openedRef.current && openedRef.current !== swipeRef) {
            openedRef.current.close();
          }
          openedRef.current = swipeRef;
        }}
        onSwipeableClose={() => {
          if (openedRef.current === swipeRef) openedRef.current = null;
        }}
        renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item.id)}
        friction={2}
        rightThreshold={20}
        overshootRight={false}>
        <TouchableOpacity onPress={() => handleRecordPress(item)} activeOpacity={0.8}>
          <View className="mx-[15px] my-[8px] flex-row items-center justify-between bg-white py-[15px]">
            <Text className="text-[16px] font-bold">{item.title}</Text>
            <Text className="mr-2 text-[14px] text-[#777]">{item.duration}</Text>
          </View>
          <View className="mx-[10px] h-[1px] bg-[#eee]" />
        </TouchableOpacity>
      </Swipeable>
    );
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
        renderItem={renderItem}
        ListEmptyComponent={
          <Text className="mx-[15px] mt-[20px] text-[15px] text-[#888]">기록 없음</Text>
        }
        contentContainerStyle={{ paddingBottom: 10 }}
      />
    </View>
  );
}
