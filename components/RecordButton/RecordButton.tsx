import { TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

interface RecordButtonProps {
  recording: boolean;
  onStartRecord: () => void;
  onStopRecord: () => void;
}

const RecordButton: React.FC<RecordButtonProps> = ({ recording, onStartRecord, onStopRecord }) => {
  const handlePress = async () => {
    console.log('RecordButton pressed', recording);

    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      Alert.alert('권한 거부됨', '녹음을 위해 마이크 권한을 허용해주세요.');
      return;
    }

    onStartRecord();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="h-[90px] w-[100px] items-center justify-center "
      style={{
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      }}>
      <Ionicons name="mic-outline" size={70} color="#ffffff" />
    </TouchableOpacity>
  );
};

export default RecordButton;
