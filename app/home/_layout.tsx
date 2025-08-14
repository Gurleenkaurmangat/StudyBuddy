// app/home/layout.tsx
import { Slot, useRouter, useSegments } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Layout() {
  const router = useRouter();
  const segments = useSegments();

  // last segment of the current route (e.g., 'page', 'calendar', 'signin', etc.)
  const current = segments[segments.length - 1] || '';

  // Hide footer if we are on auth screens
  const hideFooter = current === 'signin' || current === 'signup';

  // simple active check for tabs
  const isActive = (name: string) => current === name;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Slot />
      </View>

      {!hideFooter && (
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => router.push('/home/page')}>
            <Text style={[styles.icon, isActive('page') && styles.active]}>🏠</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/home/calendar')}>
            <Text style={[styles.icon, isActive('calendar') && styles.active]}>📅</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/home/add')}>
            <Text style={[styles.iconAdd, isActive('add') && styles.active]}>➕</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/home/analytics')}>
            <Text style={[styles.icon, isActive('analytics') && styles.active]}>📊</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/home/completed')}>
            <Text style={[styles.icon, isActive('completed') && styles.active]}>✅</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/home/profile')}>
            <Text style={[styles.icon, isActive('profile') && styles.active]}>👤</Text>
          </TouchableOpacity>
        </View>
      )}
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
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingVertical: 10,
  },
  icon: {
    fontSize: 22,
    color: '#333',
    opacity: 0.75,
  },
  iconAdd: {
    fontSize: 26,
    color: '#333',
    opacity: 0.9,
  },
  active: {
    color: '#5a1040',
    opacity: 1,
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
});
