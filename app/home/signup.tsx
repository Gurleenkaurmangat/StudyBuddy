import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SignUpScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSignUp = async () => {
    if (name && mobile && email && pass && confirm) {
      if (pass !== confirm) {
        Alert.alert('⚠️ Passwords do not match');
        return;
      }

      try {
        await AsyncStorage.setItem('userName', name);
        router.replace('/home/page');
      } catch (error) {
        console.error('Error saving name:', error);
        Alert.alert('❌ Failed to save user data');
      }
    } else {
      Alert.alert('⚠️ Please fill in all fields');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Top Row: Back and Title */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.push('/home/signin')}>
  <         Text style={styles.backText}>←</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Sign Up</Text>
          <View style={{ width: 60 }} /> {/* spacer to balance layout */}
        </View>

        {/* Input Fields */}
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Mobile Number"
          placeholderTextColor="#aaa"
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          value={pass}
          onChangeText={setPass}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#aaa"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>SIGN UP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fde2f3',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backText: {
    color: '#652ea5',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#652ea5',
    textAlign: 'center',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#aaa',
    paddingVertical: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#652ea5',
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});
