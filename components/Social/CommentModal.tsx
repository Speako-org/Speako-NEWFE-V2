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
} from 'react-native';
import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';

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

export default function CommentModal({
  visible,
  comments,
  commentText,
  setCommentText,
  onClose,
  onAddComment,
}: CommentModalProps) {
  const sorted = useMemo(() => {
    const safe = (comments ?? []).filter(
      (c) => c && typeof c.commentId === 'number' && (c.content ?? '').trim()
    );
    return [...safe].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [comments]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}>
      <View style={{ flex: 1 }} pointerEvents="box-none">
        <Pressable
          onPress={onClose}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.2)',
          }}
        />

        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '75%',
            zIndex: 1,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            backgroundColor: '#fff',
            overflow: 'hidden',
          }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}>
            <View className="flex-row items-center justify-between border-b border-gray-200 p-4">
              <Text className="ml-4 text-lg font-semibold">댓글</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16 }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              nestedScrollEnabled
              bounces={false}
              showsVerticalScrollIndicator
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
                      <View className="mb-1 flex-row items-center">
                        <Text className="font-medium">{c.username}</Text>
                        <Text className="ml-2 text-sm text-gray-500">
                          {formatKSTDate(c.createdAt)}
                        </Text>
                      </View>
                      <Text className="text-sm">{c.content}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* 입력창 */}
            <View className="border-t border-gray-200 p-4 pb-8">
              <View className="flex-row items-center">
                <View className="flex-1 rounded-full bg-gray-100 px-4 py-3">
                  <TextInput
                    value={commentText}
                    onChangeText={setCommentText}
                    placeholder="댓글을 입력하세요..."
                    placeholderTextColor="#9CA3AF"
                    style={{ fontSize: 15, color: '#000000' }}
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
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}
