// app/home/page.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getCurrentUser } from '../utils/storage';

type Task = {
  task: string;
  description: string;
  dueDate: string;   // ISO
  category?: string; // current field
  taskType?: string; // legacy field
};

type TimeTab = 'today' | 'week' | 'month' | 'year';
type CatTab = 'All' | 'Class' | 'Assignment' | 'Exam' | 'Lab' | 'Presentation' | 'Others';

const ALLOWED = ['Class', 'Assignment', 'Exam', 'Lab', 'Presentation'] as const;

const normalizeCategory = (t: Task): string => {
  const raw = (t.category ?? t.taskType ?? '').toString().trim();
  if (!raw) return '';
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
};

const displayCategory = (t: Task): CatTab => {
  const c = normalizeCategory(t);
  return (ALLOWED as readonly string[]).includes(c) ? (c as CatTab) : 'Others';
};

const FILTER_OPTIONS: { key: CatTab; icon: string }[] = [
  { key: 'All',          icon: '📋' },
  { key: 'Class',        icon: '🏫' },
  { key: 'Assignment',   icon: '📄' },
  { key: 'Exam',         icon: '📝' },
  { key: 'Lab',          icon: '🔬' },
  { key: 'Presentation', icon: '🎤' },
  { key: 'Others',       icon: '🧩' },
];

export default function HomeScreen() {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [activeTime, setActiveTime] = useState<TimeTab>('today');
  const [activeCat, setActiveCat] = useState<CatTab>('All');
  const [currentDate, setCurrentDate] = useState('');
  const [userName, setUserName] = useState('');

  // Center prompt state
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptMsg, setPromptMsg] = useState('🎉 Well Done!');

  // Filter modal
  const [filterOpen, setFilterOpen] = useState(false);
  const [tempCat, setTempCat] = useState<CatTab>('All');

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const stored = await AsyncStorage.getItem('tasks');
          setAllTasks(stored ? JSON.parse(stored) : []);
        } catch {
          setAllTasks([]);
        }

        try {
          const user = await getCurrentUser();
          setUserName(user?.name ?? '');
        } catch {
          setUserName('');
        }

        setCurrentDate(dayjs().format('dddd, MMMM D, YYYY'));
      };
      load();
    }, [])
  );

  // Complete task
  const completeTask = async (taskToComplete: Task) => {
    try {
      const updatedTasks = allTasks.filter(
        (t) =>
          !(
            t.task === taskToComplete.task &&
            t.description === taskToComplete.description &&
            t.dueDate === taskToComplete.dueDate &&
            displayCategory(t) === displayCategory(taskToComplete)
          )
      );
      setAllTasks(updatedTasks);
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));

      const completedStored = await AsyncStorage.getItem('completedTasks');
      const completedList = completedStored ? JSON.parse(completedStored) : [];
      completedList.push({ ...taskToComplete, completedAt: new Date().toISOString() });
      await AsyncStorage.setItem('completedTasks', JSON.stringify(completedList));

      setPromptMsg(`🎉 Well Done!\n"${taskToComplete.task}" completed`);
      setShowPrompt(true);
      setTimeout(() => setShowPrompt(false), 2000);
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  // date helpers
  const startOfToday = () => dayjs().startOf('day');
  const endOfToday = () => dayjs().endOf('day');
  const startOfWeek = () => dayjs().startOf('day').subtract(dayjs().day(), 'day'); // Sunday
  const endOfWeek = () => startOfWeek().add(6, 'day').endOf('day');
  const startOfMonth = () => dayjs().startOf('month');
  const endOfMonth = () => dayjs().endOf('month');
  const startOfYear = () => dayjs().startOf('year');
  const endOfYear = () => dayjs().endOf('year');
  const inRange = (d: dayjs.Dayjs, s: dayjs.Dayjs, e: dayjs.Dayjs) =>
    (d.isAfter(s) || d.isSame(s)) && (d.isBefore(e) || d.isSame(e));

  // time filter
  const timeFiltered = useMemo(() => {
    const items = allTasks
      .map((t) => ({ ...t, _d: dayjs(t.dueDate) }))
      .filter((t) => t._d.isValid())
      .sort((a, b) => a._d.valueOf() - b._d.valueOf());

    if (activeTime === 'today') return items.filter((t) => inRange(t._d, startOfToday(), endOfToday()));
    if (activeTime === 'week')  return items.filter((t) => inRange(t._d, startOfWeek(), endOfWeek()));
    if (activeTime === 'month') return items.filter((t) => inRange(t._d, startOfMonth(), endOfMonth()));
    return items.filter((t) => inRange(t._d, startOfYear(), endOfYear()));
  }, [allTasks, activeTime]);

  // counts for modal
  const catCounts: Record<CatTab, number> = useMemo(() => {
    const base: Record<CatTab, number> = {
      All: 0, Class: 0, Assignment: 0, Exam: 0, Lab: 0, Presentation: 0, Others: 0,
    };
    for (const t of timeFiltered) {
      base.All += 1;
      const disp = displayCategory(t as Task);
      base[disp] += 1;
    }
    return base;
  }, [timeFiltered]);

  // apply category filter
  const filtered = useMemo(() => {
    if (activeCat === 'All') return timeFiltered;
    return timeFiltered.filter((t) => displayCategory(t as Task) === activeCat);
  }, [timeFiltered, activeCat]);

  // group for non-today views
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    for (const t of filtered) {
      const key = dayjs(t.dueDate).format('YYYY-MM-DD');
      (groups[key] ||= []).push(t as Task);
    }
    return Object.entries(groups).sort((a, b) => dayjs(a[0]).valueOf() - dayjs(b[0]).valueOf());
  }, [filtered]);

  const isTodayView = activeTime === 'today';

  return (
    <View style={{ flex: 1, backgroundColor: '#fde2f3' }}>
      {/* Center Prompt */}
      <Modal transparent visible={showPrompt} animationType="fade">
        <View style={styles.promptOverlay}>
          <View style={styles.promptBox}>
            <Text style={styles.promptText}>{promptMsg}</Text>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal transparent visible={filterOpen} animationType="fade" onRequestClose={() => setFilterOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Filter by Category</Text>

            <View style={{ marginTop: 10 }}>
              {FILTER_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={styles.optionRow}
                  onPress={() => setTempCat(opt.key)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.radioOuter, tempCat === opt.key && styles.radioOuterActive]}>
                    {tempCat === opt.key && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.optionIcon}>{opt.icon}</Text>
                  <Text style={styles.optionText}>{opt.key}</Text>
                  <View style={styles.optionCount}>
                    <Text style={styles.optionCountText}>{catCounts[opt.key]}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.btnGhost]}
                onPress={() => { setTempCat('All'); }}
              >
                <Text style={[styles.modalBtnText, styles.btnGhostText]}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.btnPrimary]}
                onPress={() => { setActiveCat(tempCat); setFilterOpen(false); }}
              >
                <Text style={[styles.modalBtnText, styles.btnPrimaryText]}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>StudyBuddy</Text>
          <Text style={styles.subheading}>Hello, {userName || 'Student'}!</Text>
          <Text style={styles.date}>{currentDate}</Text>
          <Text style={styles.activeFilter}>
            Showing: <Text style={{ fontWeight: '800' }}>{activeCat}</Text>
          </Text>
        </View>

        {/* Time tabs */}
        <View style={styles.tabs}>
          <TabBtn label="Today" active={activeTime === 'today'} onPress={() => setActiveTime('today')} />
          <TabBtn label="Week"  active={activeTime === 'week'}  onPress={() => setActiveTime('week')} />
          <TabBtn label="Month" active={activeTime === 'month'} onPress={() => setActiveTime('month')} />
          <TabBtn label="Year"  active={activeTime === 'year'}  onPress={() => setActiveTime('year')} />
        </View>

        {/* Filter button BELOW Year tab — SMALL + RIGHT ALIGNED */}
        <View style={{ alignItems: 'flex-end', marginTop: 4, marginBottom: 10, paddingRight: 20 }}>
          <TouchableOpacity style={styles.filterBtn} onPress={() => { setTempCat(activeCat); setFilterOpen(true); }}>
            <Text style={styles.filterIcon}>⛃</Text>
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {isTodayView ? (
          filtered.length > 0 ? (
            filtered.map((t, idx) => (
              <TaskCard
                key={`${t.task}-${t.dueDate}-${idx}`}
                t={t as Task}
                colorIndex={idx}
                onComplete={() => completeTask(t as Task)}
              />
            ))
          ) : (
            <Empty />
          )
        ) : groupedByDate.length > 0 ? (
          groupedByDate.map(([dateKey, items]) => (
            <View key={dateKey} style={{ marginBottom: 14 }}>
              <Text style={styles.dateHeader}>{dayjs(dateKey).format('dddd, MMM D')}</Text>
              {items.map((t, idx) => (
                <TaskCard
                  key={`${dateKey}-${idx}`}
                  t={t as Task}
                  colorIndex={idx}
                  onComplete={() => completeTask(t as Task)}
                />
              ))}
            </View>
          ))
        ) : (
          <Empty />
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
      {/* (No floating Add button) */}
    </View>
  );
}

function TabBtn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.tabButton} onPress={onPress}>
      <Text style={[styles.tab, active && styles.activeTab]}>{label}</Text>
    </TouchableOpacity>
  );
}

function TaskCard({
  t,
  colorIndex,
  onComplete,
}: {
  t: Task;
  colorIndex: number;
  onComplete: () => void;
}) {
  const time = dayjs(t.dueDate).format('hh:mm A');
  const colorClass =
    colorIndex % 4 === 0 ? styles.blue :
    colorIndex % 4 === 1 ? styles.orange :
    colorIndex % 4 === 2 ? styles.red :
    styles.purple;

  const badge = displayCategory(t);

  return (
    <View style={[styles.taskCard, colorClass]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={styles.taskTitle}>{t.task}</Text>
          <Text style={styles.taskDetails}>{time} • {t.description}</Text>
          {!!badge && <Text style={styles.badge}>{badge}</Text>}
        </View>

        <TouchableOpacity onPress={onComplete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.checkmark}>✔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Empty() {
  return <Text style={styles.noTask}>No tasks in this range.</Text>;
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 100, backgroundColor: '#fde2f3', flexGrow: 1 },

  header: {
    backgroundColor: '#fca3b7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  heading: { fontSize: 24, fontWeight: '700', color: '#5a1040' },
  subheading: { fontSize: 14, color: '#5a1040', marginTop: 4 },
  date: { fontSize: 12, color: '#5a1040', marginTop: 8 },
  activeFilter: { marginTop: 6, fontSize: 12, color: '#5a1040' },

  /* Time tabs */
  tabs: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 6, marginBottom: 10 },
  tabButton: { padding: 6 },
  tab: { fontSize: 16, fontWeight: '500', color: '#5a1040', opacity: 0.6 },
  activeTab: { textDecorationLine: 'underline', fontWeight: 'bold', opacity: 1 },

  /* Filter button under tabs — SMALLER */
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  filterIcon: { fontSize: 14, marginRight: 4 },
  filterText: { fontWeight: '600', color: '#5a1040', fontSize: 13 },

  /* Cards */
  dateHeader: {
    fontSize: 13,
    color: '#7c3aed',
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 8,
  },
  taskCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    borderLeftWidth: 5,
  },
  taskTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  taskDetails: { fontSize: 14, color: '#444', marginTop: 2 },
  badge: {
    backgroundColor: '#ffe4ec',
    color: '#5a1040',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 999,
    fontSize: 12,
    overflow: 'hidden',
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  checkmark: { fontSize: 22, color: 'green', fontWeight: 'bold' },

  blue: { borderLeftColor: '#3b82f6' },
  orange: { borderLeftColor: '#fb923c' },
  red: { borderLeftColor: '#ef4444' },
  purple: { borderLeftColor: '#8b5cf6' },

  noTask: { textAlign: 'center', color: '#999', fontSize: 14, marginTop: 20 },

  /* Center prompt styles */
  promptOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptBox: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 240,
    alignItems: 'center',
    elevation: 6,
  },
  promptText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#5a1040',
    textAlign: 'center',
    lineHeight: 22,
  },

  /* Filter modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#111' },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  optionIcon: { fontSize: 16, marginRight: 8, marginLeft: 8 },
  optionText: { flex: 1, fontSize: 14, color: '#111', fontWeight: '600' },
  optionCount: {
    minWidth: 26,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  optionCountText: { fontSize: 12, color: '#475569', fontWeight: '800' },

  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: { borderColor: '#7c3aed' },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7c3aed',
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  btnGhost: { backgroundColor: '#fff', borderColor: '#e5e7eb' },
  btnGhostText: { color: '#334155', fontWeight: '800' },
  btnPrimary: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  btnPrimaryText: { color: '#fff', fontWeight: '800' },
});