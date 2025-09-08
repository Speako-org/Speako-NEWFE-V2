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
}: CommentModalProps) {
  const { height: screenH } = useWindowDimensions();
  const sheetH = Math.round(screenH * SHEET_RATIO);

  const progress = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

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

  if (!mounted) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}>
      <Animated.View style={{ opacity: backdropOpacity }} className="absolute inset-0 bg-black">
        <Pressable className="absolute inset-0" onPress={onClose} />
      </Animated.View>

      <Animated.View
        pointerEvents="box-none"
        style={{ height: sheetH, transform: [{ translateY }] }}
        className="absolute inset-x-0 bottom-0">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 overflow-hidden rounded-t-3xl bg-white">
          {/* 헤더 */}
          <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3">
            <Text className="mx-2.5 mt-1.5 text-lg font-bold">댓글</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* 댓글 리스트 */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16 }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator
            bounces={false}
            scrollEventThrottle={16}>
            {sorted.map((c) => (
              <View key={String(c.commentId)} className="mb-4">
                <View className="mb-2 flex-row items-start">
                  {c.ImageType ? (
                    <Image
                      source={{ uri: c.ImageType }}
                      className="mr-3 h-10 w-10 rounded-full bg-gray-200"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="mr-3 h-10 w-10 rounded-full bg-gray-300" />
                  )}
                  <View className="flex-1">
                    <View className="mb-1 flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Text className="font-semibold">{c.username}</Text>
                        <Text className="ml-2 text-xs text-gray-500">
                          {formatKSTDate(c.createdAt)}
                        </Text>
                      </View>
                      {/* 휴지통 아이콘 */}
                      <TouchableOpacity onPress={() => deleteCommentMutation.mutate(c.commentId)}>
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                    <Text className="text-sm leading-5">{c.content}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* 입력 바 */}
          <View className="flex-row items-center border-t border-gray-200 px-4 pb-6 pt-4">
            <View className="flex-1 rounded-full bg-gray-100 px-4 py-3">
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="댓글을 입력하세요..."
                placeholderTextColor="#9CA3AF"
                className="text-[15px] text-black"
                returnKeyType="send"
                onSubmitEditing={onAddComment}
              />
            </View>
            {commentText.trim() ? (
              <TouchableOpacity onPress={onAddComment} className="ml-2">
                <Ionicons name="send" size={20} color="#8953E0" />
              </TouchableOpacity>
            ) : (
              <View className="ml-2 opacity-40">
                <Ionicons name="send" size={20} color="#9CA3AF" />
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}
