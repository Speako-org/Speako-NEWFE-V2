import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

// 사용자의 마이페이지 정보 조회
export const myPageApi = {
  getMyPageInfo: async (): Promise<MyPageResponse> => {
    return apiClient.get<MyPageResponse>(API_ENDPOINTS.MYPAGE);
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
