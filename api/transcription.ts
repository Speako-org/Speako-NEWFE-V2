import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://speako.site/api';

export async function updateTranscriptionTitle(
  transcriptionId: string | number,
  newTitle: string
): Promise<{ isSuccess: boolean; message?: string }> {
  const token = await SecureStore.getItemAsync('accessToken');
  const res = await fetch(`${BASE_URL}/transcriptions/${transcriptionId}/title`, {
    method: 'PATCH',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newTranscriptionTitle: newTitle }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.isSuccess === false) {
    throw new Error(data?.message || '제목 수정 실패');
  }
  return data;
}
