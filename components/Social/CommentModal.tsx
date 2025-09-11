import {
  Modal,
  Pressable,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { UseMutationResult } from '@tanstack/react-query';

export interface ServerComment {
  commentId: number;
  userId: number;
  username: string;
  ImageType?: string | null;
  mainBadgeId?: number;
  mainBadgeTitle?: string;
  content: string;
  createdAt: string;
}

interface CommentModalProps {
  visible: boolean;
  comments: ServerComment[];
  commentText: string;
  setCommentText: (text: string) => void;
  onClose: () => void;
  onAddComment: () => void;
  deleteCommentMutation: UseMutationResult<any, unknown, number, unknown>;
  currentUserId?: number; // 현재 사용자 ID
}

function formatKSTDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  d.setHours(d.getHours() + 9);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(
    2,
    '0'
  )}`;
}

const SHEET_RATIO = 0.75;
const DURATION = 220;

export default function CommentModal({
  visible,
  comments,
  commentText,
  setCommentText,
  onClose,
  onAddComment,
  deleteCommentMutation,
  currentUserId,
}: CommentModalProps) {
  const { height: screenH } = useWindowDimensions();
  const sheetH = Math.round(screenH * SHEET_RATIO);
  const router = useRouter();

  const progress = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedComment, setSelectedComment] = useState<ServerComment | null>(null);
  const [optionsPosition, setOptionsPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (mounted) {
      Animated.timing(progress, {
        toValue: 0,
        duration: DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const backdropOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [sheetH, 0],
  });

  const sorted = useMemo(() => {
    const safe = (comments ?? []).filter(
      (c) => c && typeof c.commentId === 'number' && (c.content ?? '').trim()
    );
    return [...safe].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [comments]);

  const handleOptionsPress = (comment: ServerComment, event: any) => {
    event.persist();
    const { pageX, pageY } = event.nativeEvent;
    setSelectedComment(comment);
    setOptionsPosition({ x: pageX, y: pageY });
    setOptionsModalVisible(true);
  };

  const handleDeleteComment = () => {
    if (selectedComment) {
      deleteCommentMutation.mutate(selectedComment.commentId);
      setOptionsModalVisible(false);
      setSelectedComment(null);
    }
  };

  const handleReportComment = () => {
    setOptionsModalVisible(false);
    setSelectedComment(null);
  };

  const isMyComment = (comment: ServerComment) => {
    return currentUserId && comment.userId === currentUserId;
  };

  const handleProfilePress = (comment: ServerComment) => {
    // 댓글창 닫기
    onClose();

    if (currentUserId && comment.userId === currentUserId) {
      // 내 프로필이면 마이페이지로
      router.push('/(protected)/(tabs)/my' as any);
    } else {
      // 상대방 프로필이면 상대 프로필로
      router.push({
        pathname: '/(protected)/other-profile/[id]' as any,
        params: { id: String(comment.userId) },
      });
    }
  };

  if (!mounted) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}>
      <View className="flex-1">
        <Animated.View style={{ opacity: backdropOpacity }} className="absolute inset-0 bg-black">
          <Pressable className="absolute inset-0" onPress={onClose} />
        </Animated.View>

        <Animated.View
          pointerEvents="box-none"
          style={{ height: sheetH, transform: [{ translateY }] }}
          className="absolute inset-x-0 bottom-0">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            className="flex-1 overflow-hidden rounded-t-3xl bg-white">
            {/* 헤더 */}
            <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-4">
              <Text className="mx-3 mt-1.5 text-xl font-bold">댓글</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={25} color="#6B7280" className="mr-2" />
              </TouchableOpacity>
            </View>

            {/* 댓글 리스트 */}
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              showsVerticalScrollIndicator
              bounces
              scrollEventThrottle={16}
              automaticallyAdjustKeyboardInsets>
              {sorted.map((c) => (
                <View key={String(c.commentId)} className="mb-6">
                  <View className="mb-3 flex-row items-start">
                    <TouchableOpacity onPress={() => handleProfilePress(c)}>
                      {c.ImageType ? (
                        <Image
                          source={{ uri: c.ImageType }}
                          className="mr-4 h-14 w-14 rounded-full border border-gray-200 bg-gray-200"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="mr-4 h-14 w-14 rounded-full border border-gray-200 bg-gray-300" />
                      )}
                    </TouchableOpacity>
                    <View className="flex-1">
                      <View className="mb-1 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Text className="text-lg font-semibold">{c.username}</Text>
                          <Text className="ml-2 text-sm text-gray-500">
                            {formatKSTDate(c.createdAt)}
                          </Text>
                        </View>

                        <TouchableOpacity onPress={(event) => handleOptionsPress(c, event)}>
                          <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
                        </TouchableOpacity>
                      </View>
                      <Text className="text-base leading-6">{c.content}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* 입력 바 */}
            <View className="flex-row items-center border-t border-gray-100 px-6 py-3 pb-11">
              <View className="flex-grow rounded-2xl bg-gray-100 px-5 py-4">
                <TextInput
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder="댓글을 입력하세요..."
                  placeholderTextColor="#9CA3AF"
                  className="text-[16px] text-black"
                  returnKeyType="send"
                  onSubmitEditing={onAddComment}
                  multiline={false}
                  blurOnSubmit={false}
                  enablesReturnKeyAutomatically
                />
              </View>
              {commentText.trim() ? (
                <TouchableOpacity onPress={onAddComment} className="ml-3">
                  <Ionicons name="send" size={26} color="#8953E0" className="px-1" />
                </TouchableOpacity>
              ) : (
                <View className="ml-3 opacity-40">
                  <Ionicons name="send" size={26} color="#9CA3AF" className="px-1" />
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </Animated.View>

        {/* 옵션 모달 */}
        {optionsModalVisible && (
          <View className="absolute inset-0">
            <Pressable className="absolute inset-0" onPress={() => setOptionsModalVisible(false)} />
            <View
              className="absolute min-w-[120px] rounded-xl border border-gray-300 bg-white"
              style={{
                left: Math.max(10, optionsPosition.x - 110),
                top: optionsPosition.y + 10,
              }}>
              {selectedComment && isMyComment(selectedComment) ? (
                <TouchableOpacity
                  onPress={handleDeleteComment}
                  className="flex-row items-center px-4 py-3">
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  <Text className="ml-2 font-medium text-red-500">삭제하기</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleReportComment}
                  className="flex-row items-center px-4 py-3">
                  <Ionicons name="flag-outline" size={18} color="#6B7280" />
                  <Text className="ml-2 font-medium text-gray-700">신고하기</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
