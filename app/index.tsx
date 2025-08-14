// app/index.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StartScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoWrap}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
      </View>

      {/* Title */}
      <Text style={styles.title}>StudyBuddy</Text>

      {/* Button */}
      <TouchableOpacity onPress={() => router.replace('/home/signin')} style={styles.button}>
        <Text style={styles.buttonText}>→</Text>
      </TouchableOpacity>
    </View>
  );
}

const PURPLE = '#652ea5';
const PURPLE_DARK = '#5a1040';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fde2f3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoWrap: { alignItems: 'center', marginBottom: 16 },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: PURPLE,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: PURPLE_DARK,
    marginBottom: 40,
    letterSpacing: 0.5,
  },
  button: {
    backgroundColor: PURPLE,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
});
