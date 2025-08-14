// app/home/add.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

/** Allowed categories for new tasks (no "All", no "Project") */
const CATEGORIES = ['Class', 'Assignment', 'Exam', 'Lab', 'Presentation', 'Others'] as const;
type Category = (typeof CATEGORIES)[number];

export default function AddScreen() {
  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [taskType, setTaskType] = useState<Category | ''>('');
  const [message, setMessage] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);

  const router = useRouter();

  /** Convert web datetime-local to ISO; pass through otherwise */
  const toISO = (v: string) => {
    const d = new Date(v);
    return isNaN(d.getTime()) ? v : d.toISOString();
  };

  const showCenterPrompt = (text: string, ms = 1500) => {
    setMessage(text);
    setShowPrompt(true);
    setTimeout(() => setShowPrompt(false), ms);
  };

  const handleAdd = async () => {
    if (!task || !description || !dueDate || !taskType) {
      return showCenterPrompt('⚠️ Please fill in all fields', 2000);
    }
    if (!CATEGORIES.includes(taskType as Category)) {
      return showCenterPrompt('⚠️ Please choose a valid category', 2000);
    }

    try {
      const raw = await AsyncStorage.getItem('tasks');
      const existing = raw ? JSON.parse(raw) : [];

      const newTask = {
        task,
        description,
        dueDate: Platform.OS === 'web' ? toISO(dueDate) : dueDate,
        taskType,
      };

      await AsyncStorage.setItem('tasks', JSON.stringify([...existing, newTask]));

      setTask('');
      setDescription('');
      setDueDate('');
      setTaskType('');

      showCenterPrompt(`✅ Task Added: ${newTask.task}`);
      setTimeout(() => router.replace('/home/page'), 1200);
    } catch (e) {
      console.error('Error saving task:', e);
      showCenterPrompt('❌ Failed to save task', 2000);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Task</Text>

      <TextInput
        style={styles.input}
        placeholder="Task Name"
        value={task}
        onChangeText={setTask}
        placeholderTextColor="#888"
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Task Description"
        value={description}
        onChangeText={setDescription}
        placeholderTextColor="#888"
        multiline
        numberOfLines={3}
      />

      {/* Category Dropdown - Web */}
      {Platform.OS === 'web' ? (
        <View style={styles.webField}>
          <select
            value={taskType}
            onChange={(e) => setTaskType(e.target.value as Category)}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              outline: 'none',
              fontSize: 16,
              fontFamily: 'inherit',
              background: 'transparent',
              color: taskType ? '#000' : '#888', // gray if not chosen
            }}
          >
            <option value="" disabled hidden style={{ color: '#888' }}>
              Choose Category
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c} style={{ color: '#000' }}>
                {c}
              </option>
            ))}
          </select>
        </View>
      ) : (
        <TextInput
          style={styles.input}
          placeholder="Category (Class / Assignment / Exam / Lab / Presentation / Others)"
          value={taskType}
          onChangeText={(v) => setTaskType(v as Category)}
          placeholderTextColor="#888"
        />
      )}

      {/* Date & Time Picker */}
      {Platform.OS === 'web' ? (
        <View style={styles.webField}>
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              outline: 'none',
              fontSize: 16,
              fontFamily: 'inherit',
              background: 'transparent',
              color: dueDate ? '#000' : '#888',
            }}
          />
        </View>
      ) : (
        <TextInput
          style={styles.input}
          placeholder="Due Date (YYYY-MM-DD HH:mm)"
          value={dueDate}
          onChangeText={setDueDate}
          placeholderTextColor="#888"
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Create Task</Text>
      </TouchableOpacity>

      {/* Centered prompt overlay */}
      {showPrompt && (
        <View style={styles.promptOverlay}>
          <View style={styles.promptBox}>
            <Text style={styles.promptText}>{message}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

/* ---------------- styles ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fde2f3',
    padding: 20,
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#652ea5',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 20,
    width: '100%',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  webField: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 50,
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
  },
  button: {
    backgroundColor: '#652ea5',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  promptOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  promptBox: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    maxWidth: 320,
  },
  promptText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5a1040',
    textAlign: 'center',
  },
});
