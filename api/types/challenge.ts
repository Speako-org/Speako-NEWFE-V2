import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

export interface Challenge {
  challengeName: string;
  description: string;
  icon: string;
  levelName: string;
  currentAmount: number;
  requiredAmount: number;
  progressPercentage: number;
}

export interface ChallengeResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  result: Challenge[];
}

export const challengeApi = {
  /**
   * 사용자의 현재 진행 중인 챌린지를 조회합니다.
   */
  getActiveChallenges: async (): Promise<ChallengeResponse> => {
    return apiClient.get<ChallengeResponse>(API_ENDPOINTS.CHALLENGES);
  },
};
