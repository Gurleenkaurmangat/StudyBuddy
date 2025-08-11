// app/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = 'tasks';

export async function getTasks() {
  try {
    const storedTasks = await AsyncStorage.getItem(TASKS_KEY);
    return storedTasks ? JSON.parse(storedTasks) : [];
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return [];
  }
}

export async function saveTask(newTask: { task: string; dueDate: string }) {
  try {
    const existing = await getTasks();
    const updated = [...existing, newTask];
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save task:', error);
  }
}

export async function clearTasks() {
  try {
    await AsyncStorage.removeItem(TASKS_KEY);
  } catch (error) {
    console.error('Failed to clear tasks:', error);
  }
}
