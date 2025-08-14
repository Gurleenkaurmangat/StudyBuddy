// app/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export type StoredUser = {
  name: string;
  mobile: string;
  email: string;
  password: string;

  // NEW optional profile fields
  program?: string;
  yearSemester?: string;
  goals?: string;
  bio?: string;
  favoriteSubject?: string;
  dailyHours?: string;     // store as string for simple input (e.g., "3")
  avatarUrl?: string;
};

const USERS_KEY = 'users:v1';               // array of user objects
const CURRENT_KEY = 'currentUserEmail:v1';  // last/active user's email

export async function getUsers(): Promise<StoredUser[]> {
  try {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveUsers(users: StoredUser[]) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function findUserByEmail(email: string) {
  const users = await getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function addUser(user: StoredUser) {
  const users = await getUsers();
  users.push(user);
  await saveUsers(users);
}

export async function setCurrentUserEmail(email: string) {
  await AsyncStorage.setItem(CURRENT_KEY, email);
}

export async function getCurrentUserEmail(): Promise<string | null> {
  return AsyncStorage.getItem(CURRENT_KEY);
}

export async function getCurrentUser(): Promise<StoredUser | null> {
  const email = await getCurrentUserEmail();
  if (!email) return null;
  return findUserByEmail(email);
}

export async function signOut() {
  await AsyncStorage.removeItem(CURRENT_KEY);
}
