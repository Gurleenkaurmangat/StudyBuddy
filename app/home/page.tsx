import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Task = {
  task: string;
  description: string;
  dueDate: string;
};

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState('');
  const [userName, setUserName] = useState('');

  useFocusEffect(
    useCallback(() => {
      const fetchTasks = async () => {
        try {
          const stored = await AsyncStorage.getItem('tasks');
          if (stored) {
            const parsed: Task[] = JSON.parse(stored);
            const today = dayjs().format('YYYY-MM-DD');

            const todaysTasks = parsed.filter(
              (t) => dayjs(t.dueDate).format('YYYY-MM-DD') === today
            );

            setTasks(todaysTasks.reverse());
          }
        } catch (error) {
          console.log('Failed to load tasks:', error);
        }
      };

      const fetchName = async () => {
        try {
          const storedName = await AsyncStorage.getItem('userName');
          if (storedName) {
            setUserName(storedName);
          }
        } catch (error) {
          console.log('Failed to load user name:', error);
        }
      };

      const dateStr = dayjs().format('dddd, MMMM D, YYYY');
      setCurrentDate(dateStr);

      fetchTasks();
      fetchName();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>StudyBuddy</Text>
        <Text style={styles.subheading}>Good morning, {userName || 'User'}!</Text>
        <Text style={styles.date}>{currentDate}</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={styles.tabButton}>
          <Text style={[styles.tab, styles.activeTab]}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton}>
          <Text style={styles.tab}>Week</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton}>
          <Text style={styles.tab}>Month</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton}>
          <Text style={styles.tab}>Year</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.dateTitle}>{currentDate}</Text>

      {tasks.length > 0 ? (
        tasks.map((t, index) => {
          const time = dayjs(t.dueDate).format('hh:mm A');

          const colorClass =
            index % 4 === 0
              ? styles.blue
              : index % 4 === 1
              ? styles.orange
              : index % 4 === 2
              ? styles.red
              : styles.purple;

          return (
            <View key={index} style={[styles.taskCard, colorClass]}>
              <Text style={styles.taskTitle}>{t.task}</Text>
              <Text style={styles.taskDetails}>
                {time} | {t.description}
              </Text>
            </View>
          );
        })
      ) : (
        <Text style={styles.noTask}>No tasks for today.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
    backgroundColor: '#fde2f3',
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#fca3b7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#5a1040',
    marginBottom: 6,
  },
  subheading: {
    fontSize: 16,
    color: '#5a1040',
  },
  date: {
    fontSize: 14,
    color: '#5a1040',
    marginTop: 6,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  tabButton: {
    padding: 6,
  },
  tab: {
    fontSize: 16,
    fontWeight: '500',
    color: '#5a1040',
    opacity: 0.6,
  },
  activeTab: {
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    opacity: 1,
  },
  dateTitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#5a1040',
  },
  taskCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    borderLeftWidth: 5,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  taskDetails: {
    fontSize: 14,
    color: '#444',
  },
  blue: {
    borderLeftColor: '#3b82f6',
  },
  orange: {
    borderLeftColor: '#fb923c',
  },
  red: {
    borderLeftColor: '#ef4444',
  },
  purple: {
    borderLeftColor: '#8b5cf6',
  },
  noTask: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 20,
  },
});
