import { Slot, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Layout() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Slot />
      </View>

      <View style={styles.nav}>
        <TouchableOpacity onPress={() => router.push('/home/page')}>
          <Text style={styles.icon}>🏠</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/home/calendar')}>
          <Text style={styles.icon}>📅</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/home/add')}>
          <Text style={styles.icon}>➕</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/home/profile')}>
          <Text style={styles.icon}>👤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgb(255, 205, 213)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingVertical: 10,
  },
  icon: {
    fontSize: 24,
    color: '#333',
  },
});
