import Constants from 'expo-constants';

// API 설정
export const API_CONFIG = {
  // 개발 환경
  DEVELOPMENT: {
    BASE_URL: Constants.expoConfig?.extra?.apiBaseUrl || 'https://speako.site',
    TIMEOUT: Constants.expoConfig?.extra?.apiTimeout || 10000,
  },
  // 프로덕션 환경
  PRODUCTION: {
    BASE_URL: Constants.expoConfig?.extra?.apiBaseUrl || 'https://speako.site',
    TIMEOUT: Constants.expoConfig?.extra?.apiTimeout || 15000,
  },
};

// 현재 환경에 따른 설정 반환
export const getApiConfig = () => {
  const isDevelopment = __DEV__;
  return isDevelopment ? API_CONFIG.DEVELOPMENT : API_CONFIG.PRODUCTION;
};

// API 엔드포인트
export const API_ENDPOINTS = {
  CHALLENGES: '/api/user/challenges',
  BADGES: '/api/user/badges',
} as const;
