import { getApiConfig } from './config';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

type UpdateProfileImageRes = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    userId: number;
    newImageTypeUrl: string;
  };
};

const config = getApiConfig();

// 토큰 가져오기 함수
const getAuthToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      // 웹 환경: localStorage 사용
      return localStorage.getItem('accessToken');
    } else {
      // 네이티브: SecureStore 사용
      return await SecureStore.getItemAsync('accessToken');
    }
  } catch (error) {
    console.error('토큰 가져오기 실패:', error);
    return null;
  }
};

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    try {
      const url = `${config.BASE_URL}${endpoint}`;
      // console.log('API 호출 URL:', url);

      const accessToken = await getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.TIMEOUT);

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return await response.json();
    } catch (error) {
      console.error('API 요청 실패:', error);
      throw error;
    }
  },

  async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const url = `${config.BASE_URL}${endpoint}`;
      // console.log('API 호출 URL:', url);

      const accessToken = await getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.TIMEOUT);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return await response.json();
    } catch (error) {
      console.error('API 요청 실패:', error);
      throw error;
    }
  },

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const url = `${config.BASE_URL}${endpoint}`;
      // console.log('API 호출 URL:', url);

      const accessToken = await getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.TIMEOUT);

      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return await response.json();
    } catch (error) {
      console.error('API 요청 실패:', error);
      throw error;
    }
  },

  // 사용자 이름 업데이트 API
  async updateUsername(newUserName: string): Promise<{
    isSuccess: boolean;
    code: string;
    message: string;
    result: {
      userId: number;
      updatedUserName: string;
    };
  }> {
    return this.patch('/api/users/username', { newUserName });
  },

  // 프로필 이미지 업데이트 API
  async updateProfileImage(newImageNumber: string): Promise<UpdateProfileImageRes> {
    const url = `/api/users/image?newImageNumber=${encodeURIComponent(newImageNumber)}`;
    return this.patch(url);
  },
};
