import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AddScreen() {
  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [message, setMessage] = useState('');

  const router = useRouter();

  const handleAdd = async () => {
    if (task && description && dueDate) {
      try {
        const stored = await AsyncStorage.getItem('tasks');
        const existingTasks = stored ? JSON.parse(stored) : [];

        const newTask = {
          task,
          description,
          dueDate,
        };

        const updatedTasks = [...existingTasks, newTask];
        await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));

        setMessage(`✅ Task Added: ${task} | Due: ${dueDate}`);
        setTask('');
        setDescription('');
        setDueDate('');
        setTimeout(() => setMessage(''), 3000);

        // Redirect to home page to see the task there
        router.replace('/home');
      } catch (error) {
        console.error('Error saving task:', error);
        setMessage('❌ Failed to save task');
        setTimeout(() => setMessage(''), 3000);
      }
    } else {
      setMessage('⚠️ Please fill in all fields');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>➕ Add Task</Text>

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

      {/* Web version uses native datetime input */}
      {Platform.OS === 'web' ? (
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={{
            ...styles.input,
            height: 50,
            fontSize: 16,
            fontFamily: 'sans-serif',
            color: '#000',
          }}
        />
      ) : (
        <TextInput
          style={styles.input}
          placeholder="Select Due Date and Time"
          value={dueDate}
          onChangeText={setDueDate}
          placeholderTextColor="#888"
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Create Task</Text>
      </TouchableOpacity>

      {message !== '' && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fde2f3',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#652ea5',
    textAlign: 'center',
    marginBottom: 40,
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
  message: {
    marginTop: 20,
    textAlign: 'center',
    color: '#652ea5',
    fontSize: 16,
  },
});
