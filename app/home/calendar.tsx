// app/home/calendar.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Task = { task: string; description: string; dueDate: string };
const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const HEADER_COLOR = '#f8b8c4';
const PINK = '#fde2f3';

export default function CalendarScreen() {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [cursor, setCursor] = useState(dayjs());
  const [selected, setSelected] = useState(dayjs().startOf('day'));

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const raw = await AsyncStorage.getItem('tasks');
          setAllTasks(raw ? JSON.parse(raw) : []);
        } catch { setAllTasks([]); }
      })();
    }, [])
  );

  const startOfMonth = cursor.startOf('month');
  const endOfMonth = cursor.endOf('month');
  const firstDayOffset = startOfMonth.day();
  const daysInMonth = endOfMonth.date();

  const cells = useMemo(() => {
    const arr: (dayjs.Dayjs | null)[] = [];
    for (let i = 0; i < firstDayOffset; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(startOfMonth.date(d));
    return arr;
  }, [cursor.valueOf()]);

  const countsByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of allTasks) {
      const d = dayjs(t.dueDate);
      if (!d.isValid()) continue;
      const key = d.format('YYYY-MM-DD');
      map[key] = (map[key] || 0) + 1;
    }
    return map;
  }, [allTasks]);

  const tasksForSelected = useMemo(() => {
    const key = selected.format('YYYY-MM-DD');
    return allTasks
      .filter((t) => dayjs(t.dueDate).format('YYYY-MM-DD') === key)
      .sort((a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf());
  }, [allTasks, selected.valueOf()]);

  const goPrev = () => setCursor((c) => c.subtract(1, 'month'));
  const goNext = () => setCursor((c) => c.add(1, 'month'));
  const onSelect = (d: dayjs.Dayjs) => setSelected(d.startOf('day'));
  const isToday = (d: dayjs.Dayjs) => d.isSame(dayjs(), 'day');
  const isSelected = (d: dayjs.Dayjs) => d.isSame(selected, 'day');

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
      >
        {/* Header bar */}
        <View style={styles.headerBar}>
          <Text style={styles.headerIcon}>📅</Text>
          <Text style={styles.headerTitle}>Calendar</Text>
        </View>

        {/* Month switcher */}
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={goPrev} style={styles.monthBtn}>
            <Text style={styles.monthBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{cursor.format('MMMM YYYY')}</Text>
          <TouchableOpacity onPress={goNext} style={styles.monthBtn}>
            <Text style={styles.monthBtnText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Weekday labels */}
        <View style={styles.weekdayRow}>
          {WEEKDAYS.map((w) => (
            <Text key={w} style={styles.weekdayText}>{w}</Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.grid}>
          {cells.map((d, idx) => {
            if (d === null) return <View key={`blank-${idx}`} style={styles.cell} />;
            const key = d.format('YYYY-MM-DD');
            const count = countsByDate[key] || 0;
            return (
              <TouchableOpacity key={key} style={styles.cell} onPress={() => onSelect(d)} activeOpacity={0.7}>
                <View
                  style={[
                    styles.bubble,
                    isToday(d) && styles.bubbleToday,
                    isSelected(d) && { backgroundColor: HEADER_COLOR, borderColor: HEADER_COLOR },
                  ]}
                >
                  <Text style={[styles.dayText, (isToday(d) || isSelected(d)) && { color: '#5a1040' }]}>
                    {d.date()}
                  </Text>
                </View>
                {count > 0 && <View style={styles.dot} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* List heading */}
        <Text style={styles.listHeading}>Tasks To Do</Text>

        {/* Tasks for the selected day */}
        {tasksForSelected.length > 0 ? (
          tasksForSelected.map((t, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.cardTitle}>{t.task}</Text>
              <Text style={styles.cardMeta}>
                {dayjs(t.dueDate).format('MMM D • hh:mm A')} · {t.description}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>No tasks on this day.</Text>
        )}
      </ScrollView>
    </View>
  );
}

/* ---------------- styles ---------------- */
const styles = StyleSheet.create({
  // NEW: make the whole screen pink and full height
  screen: {
    flex: 1,
    backgroundColor: PINK,
  },
  // Scroll view should fill and inherit pink
  scroll: {
    flex: 1,
    backgroundColor: PINK,
  },
  // Content should grow to viewport height and keep pink.
  content: {
    flexGrow: 1,
    backgroundColor: PINK,
    padding: 20,
    paddingBottom: 100, // space for footer
  },

  headerBar: {
    backgroundColor: HEADER_COLOR,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIcon: { fontSize: 18, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#5a1040', textAlign: 'center' },

  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  monthBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    borderColor: '#eee', borderWidth: 1,
  },
  monthBtnText: { fontSize: 16, color: '#5a1040', fontWeight: '800' },
  monthTitle: { fontSize: 16, fontWeight: '700', color: '#652ea5', textAlign: 'center', flex: 1 },

  weekdayRow: { flexDirection: 'row', marginTop: 8, marginBottom: 6 },
  weekdayText: { flex: 1, textAlign: 'center', fontWeight: '600', color: '#444' },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 6 },

  bubble: {
    width: 28, height: 28, borderRadius: 10,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee',
    alignItems: 'center', justifyContent: 'center',
  },
  bubbleToday: { backgroundColor: '#ffecf1', borderColor: '#ffc2d1' },
  dayText: { fontWeight: '600', color: '#333', fontSize: 11 },

  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#652ea5', marginTop: 3 },

  listHeading: { fontSize: 14, fontWeight: '800', color: '#5a1040', marginTop: 10, marginBottom: 8 },
  card: {
    backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 10,
    borderLeftWidth: 4, borderLeftColor: '#8b5cf6',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4, color: '#111' },
  cardMeta: { fontSize: 13, color: '#666' },

  empty: { fontSize: 14, color: '#777', textAlign: 'center', marginTop: 8 },
});
