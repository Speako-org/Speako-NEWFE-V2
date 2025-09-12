import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import { useRef, useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as SecureStore from 'expo-secure-store';
import { useRecordTitleStore } from '~/store/recordTitle';

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

  // 오디오 재생 관련 상태 - 각 녹음별로 독립적인 상태 관리
  const [sounds, setSounds] = useState<Map<string, Audio.Sound>>(new Map());
  const [playingStates, setPlayingStates] = useState<Map<string, boolean>>(new Map());

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    onDateChange(newDate);
  };

  const formattedSelectedDate = selectedDate.toISOString().split('T')[0];
  const formattedToday = new Date().toISOString().split('T')[0];
  const isToday = formattedSelectedDate === formattedToday;
  const titles = useRecordTitleStore((s) => s.titles);
  const setInitial = useRecordTitleStore((s) => s.setInitial);

  useEffect(() => {
    if (!records?.length) return;
    setInitial(records.map((r) => ({ id: r.id, title: r.title })));
  }, [records, setInitial]);

  const handleRecordPress = (record: RecordType) => {
    const isCompleted = COMPLETED_STATUSES.includes(record.status);
    if (!isCompleted) return;

    router.push(`/(protected)/record-detail?id=${record.id}` as any);
  };

  // 오디오 재생/일시정지 함수
  const onPlayRecordedAudio = async (recordId: string) => {
    try {
      const currentSound = sounds.get(recordId);
      const isCurrentlyPlaying = playingStates.get(recordId) || false;

      if (isCurrentlyPlaying && currentSound) {
        // 현재 재생 중인 녹음이면 일시정지
        await currentSound.pauseAsync();
        setPlayingStates((prev) => new Map(prev).set(recordId, false));
      } else {
        if (currentSound) {
          // 이미 로드된 녹음이면 재생
          await currentSound.playAsync();
          setPlayingStates((prev) => new Map(prev).set(recordId, true));
        } else {
          // 새로운 녹음 로드 및 재생
          const accessToken = await SecureStore.getItemAsync('accessToken');
          const audioUrl = `https://speako.site/api/transcriptions/${recordId}/audio`;

          const { sound: newSound } = await Audio.Sound.createAsync(
            {
              uri: audioUrl,
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
            { shouldPlay: true }
          );

          // 재생 완료 시 상태 초기화
          newSound.setOnPlaybackStatusUpdate((status: any) => {
            if (status.didJustFinish) {
              setPlayingStates((prev) => new Map(prev).set(recordId, false));
            }
          });

          setSounds((prev) => new Map(prev).set(recordId, newSound));
          setPlayingStates((prev) => new Map(prev).set(recordId, true));
        }
      }
    } catch (error) {
      console.error('Failed to play recording', error);
      Alert.alert('오류', '녹음을 재생할 수 없습니다.');
    }
  };

  // 컴포넌트 언마운트 시 모든 오디오 정리
  useEffect(() => {
    return () => {
      sounds.forEach((sound) => {
        sound.unloadAsync();
      });
    };
  }, [sounds]);

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    id: string
  ) => {
    const translateX = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 40],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={{
          width: 80,
          justifyContent: 'center',
          alignItems: 'center',
          transform: [{ translateX }],
          marginRight: 10,
          borderTopRightRadius: 12,
          borderBottomRightRadius: 12,
          overflow: 'hidden',
        }}>
        <LinearGradient
          colors={['#f8f5ff', '#e8d5ff', '#d8c5ff', '#c8b5ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 3, y: 0 }}
          locations={[0, 0.3, 0.7, 1]}
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() => {
              openedRef.current?.close();
              onDeleteRecord(id);
            }}
            className="items-center justify-center"
            accessibilityLabel="기록 삭제">
            <AntDesign name="delete" size={20} color="#ef4444" />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderItem = ({ item }: { item: RecordType }) => {
    let swipeRef: Swipeable | null = null;
    const isCompleted = COMPLETED_STATUSES.includes(item.status);
    const inProgress = !isCompleted;
    const displayedTitle = titles[item.id] ?? item.title;

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
          <View className="my-[8px] mr-[15px] flex-row items-center justify-between py-[15px]">
            <View className="flex-1 flex-row items-center">
              <Text className="ml-5 flex-1 text-[16px] font-bold">{displayedTitle}</Text>
              {!isCompleted && (
                <View className="ml-1 flex-row items-center rounded-full bg-[#eee] px-1 py-[2px]">
                  <ActivityIndicator size="small" color="#8962c8" />
                  <Text className="ml-1 text-[10px] text-[#8962c8]">{badgeText}</Text>
                </View>
              )}
            </View>

            <View className="flex-row items-center">
              {isCompleted && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    onPlayRecordedAudio(item.id);
                  }}
                  className="mr-2.5 h-8 w-8 items-center justify-center rounded-full bg-[#8962c8] pl-0.5">
                  <Ionicons
                    name={playingStates.get(item.id) ? 'pause' : 'play'}
                    size={16}
                    color="#ffffff"
                  />
                </TouchableOpacity>
              )}
              <Text className="ml-1 w-[45px] text-[14px] text-[#777]">{item.duration}</Text>
            </View>
          </View>

          {!isCompleted && <View className="absolute inset-0 bg-white/50" pointerEvents="none" />}

          <View className="mx-[10px] h-[1px] bg-[#eee]" />
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <View className="mx-[20px] h-[580px] rounded-[15px] bg-white px-[5px] py-[20px]">
      {/* 날짜 이동 컨트롤 */}
      <View className="mx-[15px] my-[20px] flex-row items-center justify-center">
        <TouchableOpacity
          onPress={() => changeDate(-1)}
          className="absolute left-0 h-10 w-10 items-center justify-center">
          <AntDesign name="left" size={20} color="#666" />
        </TouchableOpacity>

        <Text className="text-[20px] font-semibold text-[#8962c8]">{formattedSelectedDate}</Text>

        <TouchableOpacity
          onPress={() => changeDate(1)}
          disabled={isToday}
          className="absolute right-0 h-10 w-10 items-center justify-center">
          <AntDesign name="right" size={20} color={isToday ? '#bbb' : '#666'} />
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
