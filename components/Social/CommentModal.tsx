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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Comment {
  id: number;
  userName: string;
  timeAgo: string;
  content: string;
}

interface CommentModalProps {
  visible: boolean;
  comments: Comment[];
  commentText: string;
  setCommentText: (text: string) => void;
  onClose: () => void;
  onAddComment: () => void;
}

export default function CommentModal({
  visible,
  comments,
  commentText,
  setCommentText,
  onClose,
  onAddComment,
}: CommentModalProps) {
  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black bg-opacity-50" onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{ height: '80%' }}
          className="mt-auto rounded-t-3xl bg-white">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}>
            <View className="flex-row items-center justify-between border-b border-gray-200 p-4">
              <Text className="ml-4 text-lg font-semibold">댓글</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* 댓글 리스트 */}
            <ScrollView className="flex-1 p-4">
              {comments.map((comment) => (
                <View key={comment.id} className="mb-4">
                  <View className="mb-2 flex-row items-start">
                    <View className="mr-3 mt-1 h-8 w-8 rounded-full bg-gray-300" />
                    <View className="flex-1">
                      <View className="mb-1 flex-row items-center">
                        <Text className="font-medium">{comment.userName}</Text>
                        <Text className="ml-2 text-sm text-gray-500">{comment.timeAgo}</Text>
                      </View>
                      <Text className="text-sm">{comment.content}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* 입력창 */}
            <View className="border-t border-gray-200 p-4">
              <View className="flex-row items-center">
                <View className="flex-1 rounded-full bg-gray-100 px-4 py-3">
                  <TextInput
                    value={commentText}
                    onChangeText={setCommentText}
                    placeholder="댓글을 입력하세요..."
                    placeholderTextColor="#9CA3AF"
                    style={{ fontSize: 16, color: '#000000' }}
                    returnKeyType="send"
                    onSubmitEditing={onAddComment}
                  />
                </View>
                {commentText.trim() && (
                  <TouchableOpacity onPress={onAddComment}>
                    <Ionicons name="send" size={20} color="#8953E0" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
