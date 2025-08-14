// app/home/signin.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { findUserByEmail, setCurrentUserEmail } from '../utils/storage';

/* THEME */
const BG = '#fde2f3';
const PURPLE = '#652ea5';
const PURPLE_DARK = '#5a1040';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSignIn = async () => {
    const e = email.trim().toLowerCase();
    if (!e || !pass) {
      Alert.alert('⚠️ Please fill in all fields');
      return;
    }

    try {
      const user = await findUserByEmail(e);
      if (!user) return Alert.alert('❌ No account found. Please sign up first.');
      if (user.password !== pass) return Alert.alert('❌ Invalid email or password');

      await setCurrentUserEmail(e);
      router.replace('/home/page');
    } catch (err) {
      console.error('Sign in error:', err);
      Alert.alert('❌ Failed to sign in');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/logo.png')} // <-- your logo file here
          style={styles.logo}
        />
      </View>

      <View style={styles.cardShadow}>
        <View style={styles.card}>
          <Text style={styles.title}>Sign In</Text>

          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.inputUnderline}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder=""
            placeholderTextColor="#aaa"
          />

          <Text style={[styles.label, { marginTop: 18 }]}>Password</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.inputUnderline, { flex: 1, marginBottom: 0 }]}
              value={pass}
              onChangeText={setPass}
              secureTextEntry={!showPass}
              autoCapitalize="none"
              placeholder=""
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity
              onPress={() => setShowPass((s) => !s)}
              style={styles.eyeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={{ fontSize: 16 }}>{showPass ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleSignIn}>
            <Text style={styles.primaryText}>SIGN IN</Text>
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <Text style={styles.smallText}>Don’t have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/home/signup')}>
              <Text style={[styles.smallText, styles.link]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50, // circular shape
    borderWidth: 3,
    borderColor: PURPLE,
    backgroundColor: '#fff',
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: PURPLE,
    padding: 18,
  },
  title: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: PURPLE_DARK,
  },
  label: { fontSize: 12, color: PURPLE_DARK, marginBottom: 6 },
  inputUnderline: {
    borderBottomWidth: 2,
    borderBottomColor: PURPLE_DARK,
    paddingVertical: 6,
    marginBottom: 6,
    color: '#111',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  eyeBtn: { marginLeft: 10, paddingBottom: 6, paddingTop: 6 },
  primaryBtn: {
    backgroundColor: PURPLE,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '800', letterSpacing: 0.5 },
  bottomRow: {
    marginTop: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  smallText: { fontSize: 12, color: PURPLE_DARK },
  link: { color: PURPLE, fontWeight: '700' },
});
