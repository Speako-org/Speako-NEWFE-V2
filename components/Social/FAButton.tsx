import { TouchableOpacity } from 'react-native';
import Octicons from '@expo/vector-icons/Octicons';

interface FAButtonProps {
  onPress: () => void;
}

export default function FAButton({ onPress }: FAButtonProps) {
  return (
    <TouchableOpacity
      className="absolute bottom-36 right-7 items-center justify-center rounded-full border border-gray-200 bg-white"
      style={{
        width: 62,
        height: 62,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 6,
      }}
      onPress={onPress}>
      <Octicons name="pencil" size={28} color="#8953E0" />
    </TouchableOpacity>
  );
}
