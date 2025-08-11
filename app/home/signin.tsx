import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Sign In</Text>

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
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.link}>Forgot password?</Text>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>SIGN IN</Text>
        </TouchableOpacity>

        <Text style={styles.bottomText}>
          Don’t have an account?{' '}
          <Text style={styles.link} onPress={() => router.push('/home/signup')}>
            Sign Up
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fde2f3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    width: '85%',
    padding: 24,
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#652ea5',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#aaa',
    paddingVertical: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  link: {
    color: '#652ea5',
    textAlign: 'right',
    marginBottom: 24,
    fontSize: 14,
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
  bottomText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 14,
  },
});
