// app/home/completed.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Task = {
  task: string;
  description: string;
  dueDate: string;       // ISO
  category?: string;     // or legacy taskType
  taskType?: string;     // legacy key
  completedAt?: string;  // ISO when moved here
};

const normalizeCat = (t: Task) => {
  const raw = (t.category ?? t.taskType ?? '').toString().trim();
  if (!raw) return '';
  const c = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  const allowed = ['Class', 'Assignment', 'Exam', 'Lab', 'Presentation'];
  return allowed.includes(c) ? c : '';
};

export default function CompletedScreen() {
  const [completed, setCompleted] = useState<Task[]>([]);

  // Load list every time screen is focused
  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const raw = await AsyncStorage.getItem('completedTasks');
          const list: Task[] = raw ? JSON.parse(raw) : [];
          // newest first
          list.sort((a, b) => dayjs(b.completedAt).valueOf() - dayjs(a.completedAt).valueOf());
          setCompleted(list);
        } catch {
          setCompleted([]);
        }
      })();
    }, [])
  );

  const undoTask = async (idx: number) => {
    try {
      const t = completed[idx];

      // 1) remove from completed
      const nextCompleted = completed.filter((_, i) => i !== idx);
      setCompleted(nextCompleted);
      await AsyncStorage.setItem('completedTasks', JSON.stringify(nextCompleted));

      // 2) add back to active tasks
      const rawActive = await AsyncStorage.getItem('tasks');
      const active = rawActive ? JSON.parse(rawActive) : [];
      active.push({
        task: t.task,
        description: t.description,
        dueDate: t.dueDate,
        category: t.category ?? t.taskType,
      });
      await AsyncStorage.setItem('tasks', JSON.stringify(active));
    } catch (e) {
      console.log('Undo failed', e);
    }
  };

  const deleteTask = async (idx: number) => {
    try {
      const nextCompleted = completed.filter((_, i) => i !== idx);
      setCompleted(nextCompleted);
      await AsyncStorage.setItem('completedTasks', JSON.stringify(nextCompleted));
    } catch (e) {
      console.log('Delete failed', e);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fde2f3' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.heading}>Completed Tasks</Text>
          <Text style={styles.subheading}>{completed.length} total</Text>
        </View>

        {completed.length === 0 ? (
          <Text style={styles.empty}>No completed tasks yet.</Text>
        ) : (
          completed.map((t, i) => (
            <View key={`${t.task}-${t.dueDate}-${i}`} style={styles.card}>
              <View style={styles.topRow}>
                <Text style={styles.title}>{t.task}</Text>
                {!!normalizeCat(t) && <Text style={styles.badge}>{normalizeCat(t)}</Text>}
              </View>

              <Text style={styles.meta}>
                Due {dayjs(t.dueDate).format('MMM D • hh:mm A')}
                {'  ·  '}
                Completed {t.completedAt ? dayjs(t.completedAt).format('MMM D, YYYY hh:mm A') : '—'}
              </Text>

              <View style={styles.actions}>
                <TouchableOpacity onPress={() => undoTask(i)} style={[styles.btn, styles.btnUndo]}>
                  <Text style={[styles.btnText, styles.btnUndoText]}>↩︎ Undo</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTask(i)} style={[styles.btn, styles.btnDelete]}>
                  <Text style={[styles.btnText, styles.btnDeleteText]}>🗑 Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 100, backgroundColor: '#fde2f3', flexGrow: 1 },
  header: { backgroundColor: '#fca3b7', borderRadius: 16, padding: 18, marginBottom: 12 },
  heading: { fontSize: 20, fontWeight: '800', color: '#5a1040' },
  subheading: { fontSize: 14, color: '#5a1040', marginTop: 4 },

  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '700', color: '#111' },
  meta: { marginTop: 4, color: '#555', fontSize: 13 },

  badge: {
    backgroundColor: '#e9defa',
    color: '#4c1d95',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    fontSize: 12,
    overflow: 'hidden',
  },

  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  btnUndo: { backgroundColor: '#f0fdf4', borderColor: '#86efac' },
  btnDelete: { backgroundColor: '#fff1f2', borderColor: '#fecdd3' },
  btnText: { fontWeight: '800' },
  btnUndoText: { color: '#166534' },
  btnDeleteText: { color: '#9f1239' },

  empty: { textAlign: 'center', color: '#777', marginTop: 20 },
});
