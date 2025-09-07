import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://speako.site/api';

// 좋아요 추가
export async function likeArticle(articleId: number) {
  const token = await SecureStore.getItemAsync('accessToken');
  if (!token) throw new Error('액세스 토큰 없음');

  const res = await fetch(`${BASE_URL}/articles/like/post/${articleId}`, {
    method: 'POST',
    headers: {
      accept: '*/*',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`좋아요 실패: ${res.status} ${errText}`);
  }

  return res.json().catch(() => null);
}

// 좋아요 취소
export async function unlikeArticle(articleId: number) {
  const token = await SecureStore.getItemAsync('accessToken');
  if (!token) throw new Error('액세스 토큰 없음');

  const res = await fetch(`${BASE_URL}/articles/like/delete/${articleId}`, {
    method: 'DELETE',
    headers: {
      accept: '*/*',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`좋아요 취소 실패: ${res.status} ${errText}`);
  }

  return res.json().catch(() => null);
}
