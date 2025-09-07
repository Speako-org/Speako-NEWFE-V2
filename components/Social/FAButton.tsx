import { TouchableOpacity } from 'react-native';
import Octicons from '@expo/vector-icons/Octicons';

interface FAButtonProps {
  onPress: () => void;
}

export default function FAButton({ onPress }: FAButtonProps) {
  return (
    <TouchableOpacity
      className="absolute bottom-40 right-9 h-14 w-14 items-center justify-center rounded-full bg-white shadow shadow-stone-400"
      onPress={onPress}>
      <Octicons name="pencil" size={24} color="#8953E0" />
    </TouchableOpacity>
  );
}
