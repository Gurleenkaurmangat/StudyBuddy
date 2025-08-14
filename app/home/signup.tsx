// app/home/signup.tsx
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
import { addUser, findUserByEmail, setCurrentUserEmail, StoredUser } from '../utils/storage';

const BG = '#fde2f3';
const PURPLE = '#652ea5';
const PURPLE_DARK = '#5a1040';

export default function SignUpScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignUp = async () => {
    const n = name.trim(),
      m = mobile.trim(),
      e = email.trim().toLowerCase(),
      p = pass,
      c = confirm;

    if (!n || !m || !e || !p || !c) {
      Alert.alert('⚠️ Please fill in all fields');
      return;
    }
    if (p !== c) {
      Alert.alert('⚠️ Passwords do not match');
      return;
    }

    const existing = await findUserByEmail(e);
    if (existing) {
      Alert.alert('⚠️ Email already registered', 'Try signing in instead.');
      return;
    }

    const newUser: StoredUser = { name: n, mobile: m, email: e, password: p };
    try {
      await addUser(newUser);
      await setCurrentUserEmail(e);
      router.replace('/home/page');
    } catch (err) {
      console.error('Signup error:', err);
      Alert.alert('❌ Failed to create account');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      </View>

      <View style={styles.cardShadow}>
        <View style={styles.card}>
          <View style={styles.topRow}>
            <TouchableOpacity onPress={() => router.replace('/home/signin')}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Sign Up</Text>
            <View style={{ width: 20 }} />
          </View>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.inputUnderline}
            placeholder=""
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Mobile Number</Text>
          <TextInput
            style={styles.inputUnderline}
            placeholder=""
            placeholderTextColor="#aaa"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Email address</Text>
          <TextInput
            style={styles.inputUnderline}
            placeholder=""
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={[styles.label, { marginTop: 12 }]}>Password</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.inputUnderline, { flex: 1, marginBottom: 0 }]}
              placeholder=""
              placeholderTextColor="#aaa"
              value={pass}
              onChangeText={setPass}
              secureTextEntry={!showPass}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPass((s) => !s)}
              style={styles.eyeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={{ fontSize: 16 }}>{showPass ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { marginTop: 12 }]}>Confirm Password</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.inputUnderline, { flex: 1, marginBottom: 0 }]}
              placeholder=""
              placeholderTextColor="#aaa"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirm((s) => !s)}
              style={styles.eyeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={{ fontSize: 16 }}>{showConfirm ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleSignUp}>
            <Text style={styles.primaryText}>SIGN UP</Text>
          </TouchableOpacity>
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
    borderRadius: 50,
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backText: { color: PURPLE, fontSize: 20, fontWeight: '600' },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: PURPLE_DARK,
    textAlign: 'center',
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
    marginBottom: 20, // space before next element / button
  },
  eyeBtn: { marginLeft: 10, paddingBottom: 6, paddingTop: 6 },
  primaryBtn: {
    backgroundColor: PURPLE,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '800', letterSpacing: 0.5 },
});
