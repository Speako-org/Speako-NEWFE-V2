import * as SecureStore from 'expo-secure-store';

const KEY_PREFIX = 'liked_v1_';

const keyOf = (userKey: string) => `${KEY_PREFIX}${userKey}`;

/** 유저별 좋아요 Set 로드 */
export async function loadLikedSet(userKey: string): Promise<Set<number>> {
  try {
    const key = keyOf(userKey);
    const raw = await SecureStore.getItemAsync(key);
    if (!raw) return new Set();
    const arr: number[] = JSON.parse(raw);
    return new Set(arr);
  } catch (e) {
    console.error('SecureStore loadLikedSet error:', e);
    return new Set();
  }
}

/** 유저별 좋아요 Set 저장 */
export async function saveLikedSet(userKey: string, set: Set<number>) {
  try {
    const key = keyOf(userKey);
    await SecureStore.setItemAsync(key, JSON.stringify([...set]));
  } catch (e) {
    console.error('SecureStore saveLikedSet error:', e);
  }
}

export function toggleInSet(prev: Set<number>, id: number, nextLiked: boolean) {
  const next = new Set(prev);
  if (nextLiked) next.add(id);
  else next.delete(id);
  return next;
}
