import { useState } from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { useQueryClient } from '@tanstack/react-query';
import { formatDateKey, toCustomISOStringKST, calculateDuration } from '~/utils/recordDates';

type Props = {
  recordedUri: string | null;
  recordStartTime: Date | null;
  recordEndTime: Date | null;
  getFileNameFromUri: (uri: string) => string;
  BASE_URL?: string;
};

type RecordType = {
  id: string;
  title: string;
  date: string;
  duration: string;
  status: string;
};

const DEFAULT_BASE = 'https://speako.site/api';

export default function UploadTranscribeButton({
  recordedUri,
  recordStartTime,
  recordEndTime,
  getFileNameFromUri,
  BASE_URL = DEFAULT_BASE,
}: Props) {
  const qc = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const getPresignedUrl = async (
    fileName: string,
    recordId?: number | null
  ): Promise<{ uploadUrl: string; recordId: number } | null> => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');

      const query = recordId
        ? `recordId=${recordId}&fileName=${encodeURIComponent(fileName)}`
        : `fileName=${encodeURIComponent(fileName)}`;

      const url = `${BASE_URL}/records/presigned-url?${query}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const text = await res.text();
      const data = JSON.parse(text);
      return { uploadUrl: data.result.presignedUrl, recordId: data.result.recordId };
    } catch (e) {
      console.error('Presigned URL 요청 실패:', e);
      Alert.alert('오류', '파일 업로드 URL을 받지 못했습니다.');
      return null;
    }
  };

  const uploadToS3 = async (uri: string, uploadUrl: string) => {
    const res = await FileSystem.uploadAsync(uploadUrl, uri, {
      httpMethod: 'PUT',
      headers: { 'Content-Type': 'audio/x-m4a' },
    });
    if (res.status !== 200 && res.status !== 201) {
      throw new Error(`S3 업로드 실패: ${res.status}`);
    }
  };

  const requestTranscription = async (
    recordId: number,
    fileS3Path: string,
    startTime: string,
    endTime: string
  ) => {
    const token = await SecureStore.getItemAsync('accessToken');
    const qs = new URLSearchParams({ recordS3Path: fileS3Path, startTime, endTime });
    const url = `${BASE_URL}/records/${recordId}/transcriptions?${qs.toString()}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('STT 요청 실패');
  };

  const addOptimisticItem = (dateKey: string, draft: RecordType) => {
    qc.setQueryData<RecordType[]>(['records', dateKey], (prev) => {
      const list = prev ?? [];
      if (list.some((r) => r.id === draft.id)) return list;
      return [draft, ...list];
    });
  };

  const onPress = async () => {
    if (!recordedUri) {
      Alert.alert('오류', '녹음된 파일이 없습니다.');
      return;
    }
    setIsUploading(true);

    try {
      const fileName = getFileNameFromUri(recordedUri);
      const presigned = await getPresignedUrl(fileName, null);
      if (!presigned?.uploadUrl) throw new Error('유효한 업로드 URL 없음');

      // 1) 업로드
      await uploadToS3(recordedUri, presigned.uploadUrl);

      // 2) S3 경로 & 시간 포맷
      const fileUrl = presigned.uploadUrl.split('?')[0];
      const recordS3Path = fileUrl.split('.com/')[1];

      const startISO = (recordStartTime ?? new Date()).toISOString();
      const endISO = (recordEndTime ?? new Date()).toISOString();

      const startCustom = toCustomISOStringKST(recordStartTime ?? new Date());
      const endCustom = toCustomISOStringKST(recordEndTime ?? new Date());

      // 3) STT 요청
      await requestTranscription(presigned.recordId, recordS3Path, startCustom, endCustom);

      // 4) 낙관적 리스트 추가
      const dateKey = formatDateKey(new Date());
      const optimisticId = `tmp-${presigned.recordId}`;
      const optimisticItem: RecordType = {
        id: optimisticId,
        title: fileName.replace(/\.[^/.]+$/, ''),
        date: dateKey,
        duration: calculateDuration(startISO, endISO),
        status: 'STT_IN_PROGRESS',
      };

      addOptimisticItem(dateKey, optimisticItem);
      qc.invalidateQueries({ queryKey: ['records', dateKey] });

      Alert.alert('요청 완료', '음성 텍스트 변환을 시작했습니다.');
    } catch (e: any) {
      console.error('업로드/전사 요청 실패:', e);
      Alert.alert('오류', e?.message ?? '업로드/변환 요청 실패');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!recordedUri || isUploading}
      style={{
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: !recordedUri || isUploading ? '#cccccc' : '#4caf50',
        borderRadius: 10,
      }}>
      <Text style={{ color: 'white', fontWeight: 'bold' }}>
        {isUploading ? '업로드 중...' : '녹음 업로드 및 텍스트화 요청'}
      </Text>
    </TouchableOpacity>
  );
}
