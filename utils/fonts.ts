import * as Font from 'expo-font';

export const loadFonts = async () => {
  try {
    await Font.loadAsync({
      'Pretendard-Medium': require('../assets/fonts/Pretendard-Medium.ttf'),
      'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.ttf'),
      'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.ttf'),
    });
  } catch (error) {
    console.log('Font loading failed, using system font:', error);
  }
};
