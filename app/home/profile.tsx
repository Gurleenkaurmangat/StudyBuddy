import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://i.pinimg.com/564x/94/1c/80/941c80b0a1fd42c70e9fc01c253adf84.jpg' }}
        style={styles.avatar}
      />
      <Text style={styles.name}>Harsahib Kaur</Text>
      <Text style={styles.email}>harsahib@student.langara.ca</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>🎓 Program:</Text>
        <Text style={styles.value}>Biology Associate Degree</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>💼 Role:</Text>
        <Text style={styles.value}>Medical Office Assistant</Text>
      </View>

      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editText}>✏️ Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fde2f3',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#652ea5',
    marginBottom: 6,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#652ea5',
    marginTop: 4,
  },
  editButton: {
    marginTop: 30,
    padding: 12,
    backgroundColor: '#652ea5',
    borderRadius: 10,
  },
  editText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
