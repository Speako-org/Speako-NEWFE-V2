import { apiClient } from '../client';
import * as SecureStore from 'expo-secure-store';

export const myPageApi = {
  getMyPageInfo: async (userId?: string | number): Promise<MyPageResponse> => {
    const uid = String(userId ?? (await SecureStore.getItemAsync('userId')) ?? '');
    if (!uid) throw new Error('NO_USER_ID');

    let lastErr: any;
    for (let i = 0; i < 3; i++) {
      try {
        const res = await apiClient.get<MyPageResponse>(`/api/users/${uid}/mypage`);
        if (!res?.isSuccess) {
          const msg = res?.message || 'REQUEST_FAILED';
          const code = res?.code || '500';
          const error = new Error(msg);
          (error as any).code = code;
          throw error;
        }
        return res;
      } catch (e: any) {
        lastErr = e;
        const code = (e?.code ?? '').toString();
        if (code.startsWith('5') || e?.response?.status >= 500) {
          await new Promise((r) => setTimeout(r, 300 * (i + 1)));
          continue;
        }
        throw e;
      }
    }
    throw lastErr;
  },
};

// 마이페이지 관련 타입 정의
export interface Achievement {
  nickname: string;
  profileImageUrl: string;
  mainBadgeName: string;
  mainBadgeId: number;
  selfComment: string;
  totalRecordedDays: number;
  avgPositiveRatio: number;
  badgeAcquisitionRate: number;
}

export interface MonthlyStat {
  year: number;
  month: number;
  avgPositiveRatio: number;
  avgNegativeRatio: number;
  maxStreak: number;
}

export interface MyPageResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    achievement: Achievement;
    monthlyStats: MonthlyStat[];
  };
}
