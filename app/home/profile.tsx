import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  getCurrentUser,
  getCurrentUserEmail,
  getUsers,
  saveUsers,
  setCurrentUserEmail,
  signOut,
  StoredUser,
} from '../utils/storage';

type Task = { task: string; description: string; dueDate: string };

const DEFAULT_AVATAR =
  'https://i.pinimg.com/564x/94/1c/80/941c80b0a1fd42c70e9fc01c253adf84.jpg';

export default function ProfileScreen() {
  const router = useRouter();

  // core fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>(DEFAULT_AVATAR);

  // extended
  const [program, setProgram] = useState('');
  const [yearSemester, setYearSemester] = useState('');
  const [goals, setGoals] = useState('');
  const [bio, setBio] = useState('');
  const [favoriteSubject, setFavoriteSubject] = useState('');
  const [dailyHours, setDailyHours] = useState('');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [originalEmail, setOriginalEmail] = useState<string>('');
  const BIO_MAX = 500;

  // Load user + tasks
  useEffect(() => {
    (async () => {
      const current = await getCurrentUser();
      const currentEmail = await getCurrentUserEmail();
      if (current) {
        setName(current.name || '');
        setEmail(current.email || '');
        setMobile(current.mobile || '');
        setProgram(current.program || '');
        setYearSemester(current.yearSemester || '');
        setGoals(current.goals || '');
        setBio(current.bio || '');
        setFavoriteSubject(current.favoriteSubject || '');
        setDailyHours(current.dailyHours || '');
        setAvatarUrl(current.avatarUrl || DEFAULT_AVATAR);
      } else {
        setAvatarUrl(DEFAULT_AVATAR);
      }
      setOriginalEmail(currentEmail || '');

      try {
        const raw = await AsyncStorage.getItem('tasks');
        setTasks(raw ? JSON.parse(raw) : []);
      } catch {
        setTasks([]);
      }
    })();
  }, []);

  // Stats
  const todayCount = tasks.filter(t => dayjs(t.dueDate).isSame(dayjs(), 'day')).length;
  const upcomingCount = tasks.filter(t => dayjs(t.dueDate).isAfter(dayjs(), 'day')).length;

  // Initials
  const initials = useMemo(() => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    const f = parts[0]?.[0] || '';
    const l = parts[1]?.[0] || '';
    return (f + l).toUpperCase();
  }, [name]);

  const validate = () => {
    if (!name.trim()) return 'Please enter your name';
    if (!email.trim() || !email.includes('@')) return 'Please enter a valid email';
    return '';
  };

  const handleSave = async () => {
    const err = validate();
    if (err) return Alert.alert('⚠️', err);

    const updated: StoredUser = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      password: (await getCurrentUser())?.password || '',
      program: program.trim(),
      yearSemester: yearSemester.trim(),
      goals: goals.trim(),
      bio: bio.trim(),
      favoriteSubject: favoriteSubject.trim(),
      dailyHours: dailyHours.trim(),
      avatarUrl: avatarUrl || undefined,
    };

    const all = await getUsers();
    const idx = all.findIndex(
      u => (u.email || '').toLowerCase() === (originalEmail || '').toLowerCase()
    );
    if (idx === -1) {
      Alert.alert('❌', 'Could not find current user to update.');
      return;
    }
    all[idx] = { ...all[idx], ...updated };
    await saveUsers(all);

    if ((originalEmail || '').toLowerCase() !== updated.email.toLowerCase()) {
      await setCurrentUserEmail(updated.email);
      setOriginalEmail(updated.email);
    }

    Alert.alert('✅ Saved', 'Your profile has been updated.');
    setIsEditing(false);
  };

  const handleCancel = async () => {
    const current = await getCurrentUser();
    if (current) {
      setName(current.name || '');
      setEmail(current.email || '');
      setMobile(current.mobile || '');
      setProgram(current.program || '');
      setYearSemester(current.yearSemester || '');
      setGoals(current.goals || '');
      setBio(current.bio || '');
      setFavoriteSubject(current.favoriteSubject || '');
      setDailyHours(current.dailyHours || '');
      setAvatarUrl(current.avatarUrl || DEFAULT_AVATAR);
      setOriginalEmail(current.email || originalEmail);
    }
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  /* -------------------- IMAGE PICKER (gallery only) -------------------- */
  const pickFromLibrary = async () => {
    if (!isEditing) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos to pick an image.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!res.canceled && res.assets?.length) setAvatarUrl(res.assets[0].uri);
  };

  const removePhoto = () => {
    if (!isEditing) return;
    setAvatarUrl(DEFAULT_AVATAR);
  };

  /* -------------------- RENDER -------------------- */
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fde2f3' }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView contentContainerStyle={styles.scrollBody} keyboardShouldPersistTaps="handled">
        {/* Header card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            {/* Avatar + vertical image actions (visible only in Edit) */}
            <View style={{ alignItems: 'center' }}>
              <View style={styles.avatarWrap}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={styles.initialsBubble}>
                    <Text style={styles.initialsText}>{initials}</Text>
                  </View>
                )}
              </View>

              {isEditing && (
                <View style={styles.avatarActionsCol}>
                  <TouchableOpacity style={styles.avatarActionBtn} onPress={pickFromLibrary}>
                    <Text style={styles.avatarActionText}>Choose Image</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.avatarActionBtn, styles.avatarActionDanger]}
                    onPress={removePhoto}
                  >
                    <Text style={[styles.avatarActionText, styles.avatarActionDangerText]}>
                      Remove Photo
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.nameBlock}>
              {isEditing ? (
                <>
                  <TextInput
                    style={styles.editInput}
                    value={name}
                    onChangeText={setName}
                    placeholder="Full Name"
                  />
                  <TextInput
                    style={styles.editInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  <TextInput
                    style={styles.editInput}
                    value={mobile}
                    onChangeText={setMobile}
                    placeholder="Mobile"
                    keyboardType="phone-pad"
                  />
                </>
              ) : (
                <>
                  <Text style={styles.nameText}>{name || 'Student'}</Text>
                  <Text style={styles.emailText}>{email || '—'}</Text>
                  <View style={styles.tagRow}>
                    <View style={[styles.tag, styles.tagPrimary]}>
                      <Text style={styles.tagText}>📚 StudyBuddy</Text>
                    </View>
                    {!!program && (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>🎓 {program}</Text>
                      </View>
                    )}
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            {isEditing ? (
              <>
                <TouchableOpacity style={styles.actionBtn} onPress={handleSave}>
                  <Text style={styles.actionText}>💾 Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.actionDanger]} onPress={handleCancel}>
                  <Text style={[styles.actionText, styles.actionDangerText]}>✖ Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.actionBtn} onPress={() => setIsEditing(true)}>
                  <Text style={styles.actionText}>✏️ Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.actionDanger]} onPress={handleSignOut}>
                  <Text style={[styles.actionText, styles.actionDangerText]}>↪️ Sign Out</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statPink]}>
            <Text style={styles.statNum}>{todayCount}</Text>
            <Text style={styles.statLabel}>Tasks Today</Text>
          </View>
          <View style={[styles.statCard, styles.statPurple]}>
            <Text style={styles.statNum}>{upcomingCount}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          <View style={[styles.statCard, styles.statBlue]}>
            <Text style={styles.statNum}>{tasks.length}</Text>
            <Text style={styles.statLabel}>All Tasks</Text>
          </View>
        </View>

        {/* Info / Extended fields */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Profile</Text>

          {!isEditing ? (
            <>
              <InfoRow k="Program" v={program} />
              <InfoRow k="Year/Semester" v={yearSemester} />
              <InfoRow k="Favourite Subject" v={favoriteSubject} />
              <InfoRow k="Daily Study Hours" v={dailyHours} />
              <InfoRow k="Study Goals" v={goals} multiline />
              <InfoRow k="About Me" v={bio} multiline />
            </>
          ) : (
            <>
              <EditRow placeholder="Program" value={program} onChangeText={setProgram} />
              <EditRow placeholder="Year/Semester" value={yearSemester} onChangeText={setYearSemester} />
              <EditRow placeholder="Favourite Subject" value={favoriteSubject} onChangeText={setFavoriteSubject} />
              <EditRow
                placeholder="Daily Study Hours (e.g., 3)"
                value={dailyHours}
                onChangeText={setDailyHours}
                keyboardType="numeric"
              />
              <EditArea placeholder="Study Goals" value={goals} onChangeText={setGoals} />
              <EditArea
                placeholder="About Me"
                value={bio}
                onChangeText={t => t.length <= BIO_MAX && setBio(t)}
              />
              <Text style={styles.counterText}>{bio.length}/{BIO_MAX}</Text>
            </>
          )}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ---------- Small presentational helpers ---------- */
function InfoRow({ k, v, multiline }: { k: string; v?: string; multiline?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoKey}>{k}</Text>
      <Text style={[styles.infoValue, multiline && { flex: 1, textAlign: 'right' }]}>
        {v && v.trim().length ? v : '—'}
      </Text>
    </View>
  );
}

function EditRow(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      {...props}
      style={[styles.editInput, { marginBottom: 10 }]}
      placeholderTextColor="#999"
    />
  );
}

function EditArea(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      {...props}
      style={[styles.editInput, { height: 110, textAlignVertical: 'top', marginBottom: 8, paddingTop: 12 }]}
      multiline
      numberOfLines={5}
      placeholderTextColor="#999"
    />
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  scrollBody: {
    padding: 18,
    paddingBottom: 120,
    rowGap: 16,
    flexGrow: 1,
    backgroundColor: '#fde2f3',
  },

  headerCard: {
    backgroundColor: '#ffcad4',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  headerTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },

  /* Avatar + vertical actions */
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  avatar: { width: 96, height: 96, borderRadius: 18 },
  initialsBubble: {
    width: 96,
    height: 96,
    borderRadius: 20,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: { color: '#fff', fontWeight: '800', fontSize: 28 },

  avatarActionsCol: {
    marginTop: 10,
    width: 120,
    rowGap: 8,
  },
  avatarActionBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
  },
  avatarActionText: { fontSize: 12, fontWeight: '700', color: '#5a1040' },
  avatarActionDanger: { backgroundColor: '#fff0f3' },
  avatarActionDangerText: { color: '#be123c' },

  nameBlock: { flex: 1 },
  nameText: { fontSize: 20, fontWeight: '800', color: '#5a1040' },
  emailText: { fontSize: 14, color: '#5a1040', opacity: 0.9 },
  tagRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  tag: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  tagPrimary: { backgroundColor: '#ffe4ec' },
  tagText: { fontSize: 12, fontWeight: '600', color: '#5a1040' },

  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  actionBtn: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  actionText: { fontWeight: '700', color: '#5a1040' },
  actionDanger: { backgroundColor: '#fff0f3' },
  actionDangerText: { color: '#be123c' },

  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderLeftWidth: 5,
  },
  statPink: { borderLeftColor: '#f472b6' },
  statPurple: { borderLeftColor: '#8b5cf6' },
  statBlue: { borderLeftColor: '#60a5fa' },
  statNum: { fontSize: 22, fontWeight: '800', color: '#111' },
  statLabel: { fontSize: 12, color: '#555' },

  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  infoTitle: { fontSize: 16, fontWeight: '800', color: '#5a1040', marginBottom: 10 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  infoKey: { color: '#444', fontWeight: '600', marginRight: 10 },
  infoValue: { color: '#652ea5', fontWeight: '700', marginLeft: 10, flexShrink: 1, textAlign: 'right' },

  editInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  counterText: { fontSize: 12, color: '#6b7280', textAlign: 'right', marginTop: 4 },
});
