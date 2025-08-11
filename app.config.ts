import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Speako',
  slug: 'Speako',
  version: '1.0.0',
  scheme: 'Speako',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  // 네트워크 연결 개선을 위한 설정
  extra: {
    eas: {
      projectId: 'your-project-id',
    },
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.anonymous.Speako',
    infoPlist: {
      NSMicrophoneUsageDescription: '이 앱은 음성 녹음을 위해 마이크 접근이 필요합니다.',
      LSApplicationQueriesSchemes: ['kakaokompassauth', 'kakaolink'],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.amu601.nativewind',
    intentFilters: [
      {
        action: 'android.intent.action.VIEW',
        data: [
          {
            scheme: 'kakao',
            host: 'oauth',
          },
        ],
        category: ['android.intent.category.DEFAULT', 'android.intent.category.BROWSABLE'],
      },
    ],
  },
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/favicon.png',
    build: {
      babel: {
        include: ['react-native-reanimated'],
      },
    },
  },
  plugins: [
    'expo-router',
  ],
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true,
  },
});
