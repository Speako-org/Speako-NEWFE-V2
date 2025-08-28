import { TouchableOpacity, View, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

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

    if (recording) onStopRecord();
    else onStartRecord();
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      {recording ? (
        <Image
          className="mt-[10px]"
          source={require('../../assets/recording_on.png')}
          style={{
            width: 100,
            height: 100,
            resizeMode: 'contain',
          }}
        />
      ) : (
        <View
          className="elevation-4 h-[80px] w-[100px] items-center justify-center rounded-full shadow-sm"
          style={{
            shadowColor: '#A088E0',
            shadowOpacity: 0.5,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 5,
            elevation: 5,
          }}>
          <LinearGradient
            colors={['#EADEFF', '#D0C4EF']}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 50,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999,
              position: 'relative',
            }}>
            <Ionicons name="mic-outline" size={40} color="#ffffff" />
          </LinearGradient>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default RecordButton;
