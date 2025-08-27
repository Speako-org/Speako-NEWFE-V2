import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FAButtonProps {
  onPress: () => void;
}

export default function FAButton({ onPress }: FAButtonProps) {
  return (
    <TouchableOpacity
      className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg"
      onPress={onPress}>
      <Ionicons name="create" size={24} color="#8953E0" />
    </TouchableOpacity>
  );
}
