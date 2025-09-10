import { Tabs } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import Octicons from '@expo/vector-icons/Octicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'black',
        headerShown: false,

        // @ts-ignore
        tabBarStyle: {
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          height: 105,
          backgroundColor: '#fff',
          position: 'absolute',
          bottom: 0,
          overflow: 'hidden',
          margin: 0,
          padding: 5,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },

        tabBarIconStyle: {
          marginTop: 17,
        },
        tabBarItemStyle: {
          flex: 1,
          marginHorizontal: -8,
          paddingHorizontal: 0,
          flexDirection: 'column',
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: '',
          // @ts-ignore
          tabBarIcon: ({ color, focused }) => (
            <Feather name="home" size={32} color={focused ? 'black' : '#C8C2C2'} />
          ),
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: '',
          // @ts-ignore
          tabBarIcon: ({ color, focused }) => (
            <Octicons name="three-bars" size={32} color={focused ? 'black' : '#C8C2C2'} />
          ),
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: '',
          // @ts-ignore
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="people" size={32} color={focused ? 'black' : '#C8C2C2'} />
          ),
        }}
      />
      <Tabs.Screen
        name="my"
        options={{
          title: '',
          // @ts-ignore
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="person" size={32} color={focused ? 'black' : '#C8C2C2'} />
          ),
        }}
      />
    </Tabs>
  );
}
