import { FlatList, Text, TouchableOpacity, View, Animated, ActivityIndicator } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import { useRef } from 'react';

export type RecordType = {
  id: string;
  title: string;
  date: string;
  duration: string;
  status: string; // 분석중 or 분석완료
};

interface RecordProps {
  records: RecordType[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onDeleteRecord: (id: string) => void;
}

const COMPLETED_STATUSES = ['ANALYSIS_COMPLETED', 'STT_COMPLETED', 'COMPLETED'];

export default function RecordDate({
  records,
  selectedDate,
  onDateChange,
  onDeleteRecord,
}: RecordProps) {
  const router = useRouter();
  const openedRef = useRef<Swipeable | null>(null);

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    onDateChange(newDate);
  };

  const formattedSelectedDate = selectedDate.toISOString().split('T')[0];
  const formattedToday = new Date().toISOString().split('T')[0];
  const isToday = formattedSelectedDate === formattedToday;

  const handleRecordPress = (record: RecordType) => {
    const isCompleted = COMPLETED_STATUSES.includes(record.status);
    if (!isCompleted) return;

    const href = {
      pathname: '/(protected)/record-detail',
      params: { id: record.id },
    } as const;

    router.push(href as Href);
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
          borderTopRightRadius: 12,
          borderBottomRightRadius: 12,
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
    const isCompleted = COMPLETED_STATUSES.includes(item.status);
    const inProgress = !isCompleted;

    const badgeText =
      item.status === 'STT_IN_PROGRESS'
        ? '분석 중'
        : item.status === 'ANALYSIS_IN_PROGRESS'
          ? '분석 중'
          : inProgress
            ? '처리 중'
            : '';

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
        <TouchableOpacity
          onPress={() => handleRecordPress(item)}
          activeOpacity={isCompleted ? 0.8 : 1}
          disabled={!isCompleted}>
          <View className="my-[8px] mr-[15px] flex-row items-center justify-between bg-white py-[15px]">
            <View className="flex-row items-center">
              <Text className="ml-5 text-[16px] font-bold">{item.title}</Text>
              {!isCompleted && (
                <View className="ml-1 flex-row items-center rounded-full bg-[#eee] px-1 py-[2px]">
                  <ActivityIndicator size="small" color="#8962c8" />
                  <Text className="ml-1 text-[10px] text-[#8962c8]">{badgeText}</Text>
                </View>
              )}
            </View>

            <Text className="mr-2 text-[14px] text-[#777]">{item.duration}</Text>
          </View>

          {!isCompleted && <View className="absolute inset-0 bg-white/50" pointerEvents="none" />}

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
