import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StartScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📱 StudyBuddy</Text>
      <TouchableOpacity onPress={() => router.replace('/home/signin')}>
        <Text style={styles.button}>Enter App →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fde2f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#652ea5',
    marginBottom: 40,
  },
  button: {
    fontSize: 18,
    color: '#fff',
    backgroundColor: '#652ea5',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
});
