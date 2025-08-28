import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

// 뱃지 관련 타입 정의
export interface Badge {
  userBadgeId: number;
  badgeName: string;
  description: string;
  icon: string;
}

export interface BadgeResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: Badge[];
}

// 사용자가 획득한 뱃지 목록 조회
export const badgeApi = {
  getBadges: async (): Promise<BadgeResponse> => {
    return apiClient.get<BadgeResponse>(API_ENDPOINTS.BADGES);
  },
};
