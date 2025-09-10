import { useState, useEffect, useRef } from 'react';
import { Alert, Text, View, TouchableOpacity, Animated } from 'react-native';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

import RecordButton from '~/components/RecordButton/RecordButton';
import UploadTranscribeButton from '~/components/UploadTranscribeButton';

import { formatDateTime } from '~/utils/formatDataTime';
import { formatTime } from '~/utils/formatTime';

export default function Home() {
  // 녹음 상태
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const maxRecordTime = 3600; // 1시간 제한
  const [recordStartTime, setRecordStartTime] = useState<Date | null>(null);
  const [recordEndTime, setRecordEndTime] = useState<Date | null>(null);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // 오디오 인스턴스
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [recordingInstance, setRecordingInstance] = useState<Audio.Recording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const BASE_URL = 'https://speako.site/api';

  // 현재 시각 1초마다 갱신
  useEffect(() => {
    const interval = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // 녹음 중 타이머
  useEffect(() => {
    if (recording) {
      intervalRef.current = setInterval(() => {
        setRecordTime((prev) => (prev < maxRecordTime ? prev + 1 : prev));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setRecordTime(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [recording]);

  // 재생 완료 시 상태 초기화
  useEffect(() => {
    if (sound) {
      const onPlaybackStatusUpdate = (status: any) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      };
      sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    }
  }, [sound]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (recordingInstance) {
        recordingInstance.stopAndUnloadAsync();
      }
    };
  }, [sound, recordingInstance]);

  // 녹음 시작
  const onStartRecord = async () => {
    try {
      // 기존 녹음 인스턴스 정리
      if (recordingInstance) {
        try {
          await recordingInstance.stopAndUnloadAsync();
        } catch {}
        setRecordingInstance(null);
        setRecording(false);
      }

      // 기존 재생 인스턴스 정리
      if (sound) {
        try {
          await sound.unloadAsync();
        } catch {}
        setSound(null);
        setIsPlaying(false);
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
      });
      await new Promise((r) => setTimeout(r, 300));

      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      });
      await new Promise((r) => setTimeout(r, 100));

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecordingInstance(recording);
      setRecordedUri(recording.getURI());
      setRecordStartTime(new Date());
      setRecording(true);
    } catch (error) {
      setRecording(false);
      setRecordingInstance(null);
      console.error('Failed to start recording', error);
      Alert.alert('오류', '녹음을 시작할 수 없습니다.');
    }
  };

  // 녹음 종료
  const onStopRecord = async () => {
    try {
      if (recordingInstance) {
        try {
          await recordingInstance.stopAndUnloadAsync();
        } catch {}
        const uri = recordingInstance.getURI();
        setRecordedUri(uri);
        setRecordEndTime(new Date());
        setRecordingInstance(null);
      }
      setRecording(false);
    } catch (error) {
      setRecording(false);
      setRecordingInstance(null);
      console.error('Failed to stop recording', error);
      Alert.alert('오류', '녹음을 중지할 수 없습니다.');
    }
  };

  // 파일명 추출
  const getFileNameFromUri = (uri: string) => {
    const name = uri.split('/').pop();
    if (!name) return `audio-${Date.now()}.m4a`;
    return name.includes('.') ? name : `${name}.m4a`;
  };

  // 녹음 중 애니메이션
  useEffect(() => {
    if (recording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording]);

  // 녹음 재생/일시정지
  const onPlayRecordedAudio = async () => {
    if (!recordedUri) return;
    try {
      if (isPlaying && sound) {
        // 재생 중이면 일시정지
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        // 일시정지 중이거나 처음 재생이면 재생
        if (sound) {
          await sound.playAsync();
        } else {
          // 새로운 녹음이면 새로운 sound 인스턴스 생성
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: recordedUri },
            { shouldPlay: true }
          );
          setSound(newSound);
        }
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Failed to play recording', error);
      Alert.alert('오류', '녹음을 재생할 수 없습니다.');
    }
  };

  const { formattedDate, formattedTime } = formatDateTime(currentDateTime);

  return (
    <View className="relative flex-1 items-center justify-center">
      {recording && <View className="absolute inset-0 z-10 bg-black/70" pointerEvents="none" />}
      <View className="absolute bottom-0 h-[80px] w-full" />

      <Text className="-mt-20 ml-[30px] self-start text-[33px] font-bold">음성 녹음</Text>

      <View className="mb-[25px] mt-[20px] w-[85%] flex-row justify-between">
        <Text className="rounded-xl bg-[#ececec] px-[16px] py-[8px] text-[15px] font-medium text-[#4A89F3]">
          {formattedDate}
        </Text>
        <Text className="rounded-xl bg-[#ececec] px-[16px] py-[8px] text-[15px] font-medium text-[#4A89F3]">
          {formattedTime}
        </Text>
      </View>

      <View
        className="elevation-4 shadow-xs relative z-20 mb-[80px] h-[150px] w-[85%] items-center justify-center rounded-[20px] bg-transparent px-[30px]"
        style={{ marginTop: '10%' }}>
        {recording && (
          <View className="absolute z-[-1] h-full w-full rounded-[10px] bg-transparent" />
        )}

        {recording && (
          <Text className="absolute right-[18px] mb-[220px] text-[15px] text-[#303030]">
            {`${formatTime(recordTime)} / 01:00:00`}
          </Text>
        )}

        {recording ? (
          <TouchableOpacity
            onPress={() => {
              Alert.alert('녹음 종료', '녹음을 종료하시겠어요?', [
                {
                  text: '취소',
                  style: 'cancel',
                },
                {
                  text: '종료',
                  onPress: onStopRecord,
                },
              ]);
            }}
            className="items-center">
            <Animated.Image
              source={require('../../../assets/recording_on_button.png')}
              style={{
                marginRight: 12,
                width: 80,
                height: 80,
                resizeMode: 'contain',
                transform: [{ scale: pulseAnim }],
              }}
            />
            <Text
              className="mt-8 text-[18px] font-semibold text-[#a7a7a7]"
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.5,
                shadowOffset: { width: 0, height: 1 },
                shadowRadius: 2,
                elevation: 2,
              }}>
              녹음중
            </Text>
          </TouchableOpacity>
        ) : (
          <RecordButton
            recording={!!recordingInstance}
            onStartRecord={onStartRecord}
            onStopRecord={onStopRecord}
          />
        )}

        {recording ? (
          <View className="mt-[10px] items-center">
            <Text
              className="mt-2 text-[17px] font-medium tracking-[0.5px]"
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowOffset: { width: 0, height: 1 },
                shadowRadius: 2,
                elevation: 2,
                color: '#a7a7a7',
                opacity: 0.8,
              }}>
              한번 더 누를 시 녹음이 종료돼요!
            </Text>
          </View>
        ) : null}
      </View>

      <View className="absolute bottom-[140px] left-0 right-0 px-6">
        {recordedUri && (
          <Text className="mb-4 text-center text-sm text-gray-500">
            * 업로드를 하면 기록 탭에서 분석이 시작돼요
          </Text>
        )}
        <View className="flex-row justify-center">
          <View className="max-w-[200px] flex-1">
            <TouchableOpacity
              onPress={onPlayRecordedAudio}
              disabled={!recordedUri}
              className={`mr-4 items-center justify-center rounded-xl px-6 py-4 shadow-lg ${
                recordedUri ? 'bg-[#B88FEA]' : 'bg-gray-300'
              }`}
              style={{
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
              }}>
              {recordedUri ? (
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color="#ffffff" />
              ) : (
                <Text className="text-center text-base font-semibold text-white">녹음 없음</Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="max-w-[200px] flex-1">
            <UploadTranscribeButton
              recordedUri={recordedUri}
              recordStartTime={recordStartTime}
              recordEndTime={recordEndTime}
              getFileNameFromUri={getFileNameFromUri}
              BASE_URL={BASE_URL}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
