import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import GradientText from '../../components/GradientText';

type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Main: undefined;
};

type SignupScreenProps = NativeStackScreenProps<RootStackParamList, 'Signup'>;

interface SignupFormData {
  email: string;
  password: string;
  passwordConfirm: string;
  username: string;
  age: number;
  gender: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  passwordConfirm?: string;
  username?: string;
  gender?: string;
}

const Signup: React.FC<SignupScreenProps> = ({ navigation }) => {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    passwordConfirm: '',
    username: '',
    age: 0,
    gender: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // 이메일 검증 (이메일 형식)
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    // 비밀번호 검증 (2-10자, 한글/영문/숫자)
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (!/^[가-힣a-zA-Z0-9]{2,10}$/.test(formData.password)) {
      newErrors.password = '2-10자의 한글/영문/숫자만 가능합니다';
    }

    // 비밀번호 확인 검증
    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다';
    }

    // username 검증 (6자 이내, 한글/영문/숫자)
    if (!formData.username) {
      newErrors.username = '닉네임을 입력해주세요';
    } else if (!/^[가-힣a-zA-Z0-9]{1,6}$/.test(formData.username)) {
      newErrors.username = '6자 이내의 한글/영문/숫자만 가능합니다';
    }

    // 성별 필수
    if (!formData.gender) {
      newErrors.gender = '성별을 선택해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // 입력 시 해당 필드의 에러 메시지 제거
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleGenderSelect = (gender: string) => {
    setFormData((prev) => ({ ...prev, gender }));
  };

  const handleSignUp = async () => {
    try {
      setIsLoading(true);

      if (!validateForm()) {
        return;
      }

      // API 호출
      const genderMap: Record<string, string> = {
        Male: 'Male',
        Female: 'Female',
        None: 'Other',
      };

      const requestData = {
        ...formData,
        gender: genderMap[formData.gender] || 'Other',
      };

      console.log('회원가입 요청 시작');

      // 직접 API 호출
      const response = await fetch('https://speako.site/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        console.error('회원가입 실패 - 상태코드:', response.status);

        // 409 에러
        if (response.status === 409) {
          Alert.alert('중복 오류', '이미 가입된 이메일이거나 사용 중인 사용자명입니다.');
          return;
        }

        throw new Error(`회원가입에 실패했습니다. (${response.status})`);
      }

      // 성공 시 로그인 페이지로 이동
      Alert.alert('성공', '회원가입이 완료되었습니다.', [
        {
          text: '확인',
          onPress: () => router.push({ pathname: '/(public)/login' }),
        },
      ]);
    } catch (error) {
      console.error('회원가입 오류 발생');

      // CORS 오류인 경우 특별한 메시지 표시
      if (error instanceof Error && error.message.includes('CORS')) {
        Alert.alert('네트워크 오류', '서버 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.');
      } else {
        Alert.alert(
          '오류',
          error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6">
          <View className="mt-12 flex-1 items-center justify-center">
            <GradientText text="회원가입" style="mt-20 text-center text-[30px] font-bold mb-1" />
            <Text className="mb-8 text-base leading-7 text-gray-500">계정을 생성하세요!</Text>
            <View className="mb-1 w-[98%]">
              <View className="flex-row items-center justify-between">
                <Text className="mb-1 mt-3 text-sm font-medium text-[#333]">이메일*</Text>
                {errors.email && <Text className="text-xs text-red-500">{errors.email}</Text>}
              </View>
              <View
                className="mb-5 flex-row items-center border-b py-1"
                style={{
                  borderBottomColor: '#D1D5DB',
                  borderBottomWidth: 1,
                }}>
                <Ionicons name="mail-outline" size={20} color="#CECECE" className="mr-2" />
                <TextInput
                  className="h-[40px] flex-1 px-1 text-[#333]"
                  placeholder="이메일을 입력하세요"
                  placeholderTextColor="#CECECE"
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="mt-3 text-sm font-medium text-[#333]">비밀번호*</Text>
                {errors.password && <Text className="text-xs text-red-500">{errors.password}</Text>}
              </View>
              <View
                className="mb-5 flex-row items-center border-b py-1"
                style={{
                  borderBottomColor: '#D1D5DB',
                  borderBottomWidth: 1,
                }}>
                <Ionicons name="lock-closed-outline" size={20} color="#CECECE" className="mr-2" />
                <TextInput
                  className="h-[50px] flex-1 px-1 text-[#333]"
                  placeholder="비밀번호를 입력하세요"
                  placeholderTextColor="#CECECE"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                />
                <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
                  <Ionicons
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={20}
                    color="#999"
                    className="mr-2"
                  />
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="mb-1 mt-3 text-sm font-medium text-[#333]">비밀번호 확인*</Text>
                {errors.passwordConfirm && (
                  <Text className="text-xs text-red-500">{errors.passwordConfirm}</Text>
                )}
              </View>
              <View
                className="mb-5 flex-row items-center border-b py-1"
                style={{
                  borderBottomColor: '#D1D5DB',
                  borderBottomWidth: 1,
                }}>
                <Ionicons name="lock-closed-outline" size={20} color="#CECECE" className="mr-2" />
                <TextInput
                  className="h-[40px] flex-1 px-1 text-[#333]"
                  placeholder="비밀번호를 다시 입력하세요"
                  placeholderTextColor="#CECECE"
                  secureTextEntry={!showPasswordConfirm}
                  value={formData.passwordConfirm}
                  onChangeText={(text) => handleInputChange('passwordConfirm', text)}
                />
                <TouchableOpacity onPress={() => setShowPasswordConfirm((prev) => !prev)}>
                  <Ionicons
                    name={showPasswordConfirm ? 'eye' : 'eye-off'}
                    size={20}
                    color="#999"
                    className="mr-2"
                  />
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="mb-1 mt-3 text-sm font-medium text-[#333]">닉네임*</Text>
                {errors.username && <Text className="text-xs text-red-500">{errors.username}</Text>}
              </View>
              <View
                className="mb-5 flex-row items-center border-b py-1"
                style={{
                  borderBottomColor: '#D1D5DB',
                  borderBottomWidth: 1,
                }}>
                <Ionicons name="person-outline" size={20} color="#CECECE" className="mr-2" />
                <TextInput
                  className="h-[40px] flex-1 px-1 text-[#333]"
                  placeholder="닉네임을 입력하세요"
                  placeholderTextColor="#CECECE"
                  value={formData.username}
                  onChangeText={(text) => handleInputChange('username', text)}
                />
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="mb-1 mt-3 text-sm font-medium text-[#333]">성별*</Text>
                {errors.gender && <Text className="text-xs text-red-500">{errors.gender}</Text>}
              </View>
              <View className="mb-3 flex-row justify-between">
                {[
                  { value: 'Male', label: '남' },
                  { value: 'Female', label: '여' },
                  { value: 'None', label: '선택안함' },
                ].map((g) => (
                  <TouchableOpacity
                    key={g.value}
                    className={`mx-1 mt-2 flex-1 items-center rounded-lg border px-2 py-3 ${
                      formData.gender === g.value ? 'border-[#9491f5]' : 'border-gray-300'
                    }`}
                    onPress={() => handleGenderSelect(g.value)}>
                    <Text className="text-gray-600">{g.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="mb-1 mt-5 text-sm font-medium text-[#333]">나이 (선택)</Text>
              <View
                className="mb-5 flex-row items-center border-b py-1"
                style={{
                  borderBottomColor: '#D1D5DB',
                  borderBottomWidth: 1,
                }}>
                <TextInput
                  className="h-[40px] flex-1 px-1 text-[#333]"
                  placeholder="나이를 입력하세요"
                  placeholderTextColor="#CECECE"
                  value={formData.age ? formData.age.toString() : ''}
                  onChangeText={(text) => {
                    const age = parseInt(text) || 0;
                    setFormData((prev) => ({ ...prev, age }));
                  }}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <TouchableOpacity
              style={{
                height: 50,
                width: '100%',
                borderRadius: 10,
                overflow: 'hidden',
                marginTop: 10,
              }}
              onPress={handleSignUp}
              disabled={isLoading}>
              <LinearGradient
                colors={['#94A0FF', '#D2B6FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: 50,
                  width: '100%',
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>회원가입</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View className="mt-5 flex-row">
              <Text className="mr-1 text-gray-500">계정이 있으신가요?</Text>
              <TouchableOpacity onPress={() => router.push({ pathname: '/(public)/login' })}>
                <Text className="text-m mb-10 font-semibold text-[#8884FF]">로그인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Signup;
