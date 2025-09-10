import { TouchableOpacity } from 'react-native';
import Octicons from '@expo/vector-icons/Octicons';

interface FAButtonProps {
  onPress: () => void;
}

export default function FAButton({ onPress }: FAButtonProps) {
  return (
    <TouchableOpacity
      className="absolute bottom-40 right-9 h-16 w-16 items-center justify-center rounded-full bg-white shadow shadow-stone-400"
      onPress={onPress}>
      <Octicons name="pencil" size={28} color="#8953E0" />
    </TouchableOpacity>
  );
}
