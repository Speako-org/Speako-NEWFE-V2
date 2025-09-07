import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { myPageApi, Achievement as AchievementType } from '../../api/types/statistic';

const ProfileEdit = () => {
  const router = useRouter();
  const [profileData, setProfileData] = useState<AchievementType | null>(null);
  const [editedComment, setEditedComment] = useState('');
  const [editedNickname, setEditedNickname] = useState('');
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);

  // 3D 아바타 목록
  const avatarList = [1, 3, 5, 12, 15, 17, 21, 22, 26, 28, 29, 30];

  // 아바타 이미지 소스 매핑
  const getAvatarSource = (avatarNumber: number) => {
    const avatarMap: { [key: number]: any } = {
      1: require('../../assets/UI/3D Avatars/1.png'),
      3: require('../../assets/UI/3D Avatars/3.png'),
      5: require('../../assets/UI/3D Avatars/5.png'),
      12: require('../../assets/UI/3D Avatars/12.png'),
      15: require('../../assets/UI/3D Avatars/15.png'),
      17: require('../../assets/UI/3D Avatars/17.png'),
      21: require('../../assets/UI/3D Avatars/21.png'),
      22: require('../../assets/UI/3D Avatars/22.png'),
      26: require('../../assets/UI/3D Avatars/26.png'),
      28: require('../../assets/UI/3D Avatars/28.png'),
      29: require('../../assets/UI/3D Avatars/29.png'),
      30: require('../../assets/UI/3D Avatars/30.png'),
    };
    return avatarMap[avatarNumber] || require('../../assets/default-profile.png');
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await myPageApi.getMyPageInfo();
      setProfileData(response.result.achievement);
      setEditedComment(response.result.achievement.selfComment || '');
      setEditedNickname(response.result.achievement.nickname || '');
    } catch (error) {
      console.error('프로필 데이터 로드 실패:', error);
    }
  };

  const handleImagePicker = () => {
    setShowImagePickerModal(true);
  };

  const handleAvatarSelect = (avatarNumber: number) => {
    if (selectedAvatar === avatarNumber) {
      // 이미 선택된 아바타를 다시 누르면 선택 해제
      setSelectedAvatar(null);
    } else {
      // 새로운 아바타 선택
      setSelectedAvatar(avatarNumber);
    }
  };

  const handleSave = async () => {
    try {
      // username update API 호출
      if (editedNickname !== profileData?.nickname) {
        const usernameResponse = await apiClient.updateUsername(editedNickname);
        if (usernameResponse.isSuccess) {
          console.log('닉네임 업데이트 성공:', usernameResponse.result);
        }
      }

      // self-comment update API 호출
      if (editedComment !== profileData?.selfComment) {
        const commentResponse = await apiClient.patch<{ isSuccess: boolean; message?: string }>(
          '/api/users/self-comment',
          { selfComment: editedComment }
        );
        if (commentResponse.isSuccess) {
          console.log('소개글 업데이트 성공');
        }
      }

      // 프로필 이미지 update API 호출
      if (selectedAvatar !== null) {
        const imageName = `${selectedAvatar}.png`;
        const imageResponse = await apiClient.updateProfileImage(imageName);
        if (imageResponse.isSuccess) {
          console.log('프로필 이미지 업데이트 성공');
        }
      }

      Alert.alert('성공', '프로필이 업데이트되었습니다.', [
        {
          text: '확인',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      Alert.alert('오류', '프로필 업데이트에 실패했습니다.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="flex-row items-center justify-between bg-white px-5 py-5">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">프로필 수정</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text className="text-lg font-semibold text-[#8953E0]">저장</Text>
        </TouchableOpacity>
      </View>

      {/* 프로필 수정 폼 */}
      <View className="mx-4 mt-4 flex-1 rounded-2xl bg-white p-6">
        {/* 프로필 이미지 */}
        <View className="mb-6 items-center">
          <View className="relative">
            <View className="h-20 w-20 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100">
              <Image
                source={
                  profileData?.profileImageUrl
                    ? { uri: profileData.profileImageUrl }
                    : require('../../assets/default-profile.png')
                }
                className="h-16 w-16 rounded-full"
                resizeMode="cover"
              />
            </View>
            <TouchableOpacity
              onPress={handleImagePicker}
              className="absolute bottom-0 right-0 h-7 w-7 items-center justify-center rounded-full bg-[#c1a0f6]"
              activeOpacity={0.7}>
              <Ionicons name="pencil" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 닉네임 입력 */}
        <View className="mb-4">
          <Text className="mb-2 text-sm font-semibold text-gray-700">닉네임</Text>
          <TextInput
            className="border-b border-gray-300 px-0 py-3 text-base"
            placeholder="닉네임을 입력하세요"
            value={editedNickname}
            onChangeText={setEditedNickname}
            maxLength={20}
          />
        </View>

        {/* 소개글 입력 */}
        <View className="mb-6">
          <Text className="mb-2 text-sm font-semibold text-gray-700">소개글</Text>
          <TextInput
            className="border-b border-gray-300 px-0 py-3 text-base"
            placeholder="소개글을 입력하세요"
            value={editedComment}
            onChangeText={setEditedComment}
            multiline
            maxLength={100}
            style={{ minHeight: 30 }}
          />
        </View>
      </View>

      {/* 아바타 선택 모달 */}
      <Modal visible={showImagePickerModal} transparent={true} animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              width: '90%',
              maxWidth: 400,
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 24,
            }}>
            <Text
              style={{
                marginBottom: 20,
                textAlign: 'center',
                fontSize: 18,
                fontWeight: 'bold',
              }}>
              아바타 선택
            </Text>

            {/* 3D 아바타 그리드 */}
            <View style={{ marginBottom: 20 }}>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                }}>
                {avatarList.map((avatarNumber) => (
                  <TouchableOpacity
                    key={avatarNumber}
                    onPress={() => handleAvatarSelect(avatarNumber)}
                    style={{
                      width: '22%',
                      aspectRatio: 1,
                      marginBottom: 12,
                      borderRadius: 35,
                      overflow: 'hidden',
                      borderWidth: selectedAvatar === avatarNumber ? 3 : 0,
                      borderColor: selectedAvatar === avatarNumber ? '#8953E0' : 'transparent',
                    }}>
                    <Image
                      source={getAvatarSource(avatarNumber)}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 30,
                      }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 완료 버튼 */}
            <TouchableOpacity
              onPress={() => setShowImagePickerModal(false)}
              disabled={selectedAvatar === null}
              style={{
                borderRadius: 10,
                backgroundColor: selectedAvatar !== null ? '#8953E0' : '#f3f4f6',
                paddingVertical: 14,
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 16,
                  fontWeight: '600',
                  color: selectedAvatar !== null ? 'white' : '#9ca3af',
                }}>
                완료
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileEdit;
