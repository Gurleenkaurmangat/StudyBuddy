// app/home/analytics.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart, PieChart, StackedBarChart } from 'react-native-chart-kit';

type Cat = 'Class' | 'Assignment' | 'Exam' | 'Lab' | 'Presentation';
const CATS: Cat[] = ['Class','Assignment','Exam','Lab','Presentation'];

type Task = {
  task: string;
  description: string;
  dueDate: string;      // ISO
  category?: string;    // or legacy taskType
  taskType?: string;
  completedAt?: string; // present only in completedTasks
};

const normalizeCat = (t: Task): Cat | '' => {
  const raw = (t.category ?? t.taskType ?? '').toString().trim();
  if (!raw) return '';
  const c = (raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()) as Cat;
  return (CATS as string[]).includes(c) ? c : '';
};

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 40; // padding 20 on each side

const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(90, 16, 64, ${opacity})`,     // #5a1040
  labelColor: (opacity = 1) => `rgba(85, 85, 85, ${opacity})`,
  propsForBackgroundLines: { stroke: '#eee' },
  barPercentage: 0.6,
};

const COLORS = {
  done: '#7c3aed',       // purple
  pending: '#fca3b7',    // pink
  class: '#f59e0b',      // amber
  assignment: '#6366f1', // indigo
  exam: '#ef4444',       // red
  lab: '#22c55e',        // green
  presentation: '#ec4899'// pink
};

export default function AnalyticsDashboard() {
  const [active, setActive] = useState<Task[]>([]);
  const [completed, setCompleted] = useState<Task[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const a = await AsyncStorage.getItem('tasks');
          setActive(a ? JSON.parse(a) : []);
        } catch { setActive([]); }
        try {
          const c = await AsyncStorage.getItem('completedTasks');
          setCompleted(c ? JSON.parse(c) : []);
        } catch { setCompleted([]); }
      })();
    }, [])
  );

  // -------- Weekly (Sun-Sat) completed vs pending, by due date --------
  const weekStart = dayjs().startOf('day').subtract(dayjs().day(), 'day'); // Sun
  const weekDays = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));
  const weeklyStack = useMemo(() => {
    const labels = weekDays.map(d => d.format('dd')); // Su Mo Tu ...
    const duePerDay = weekDays.map(() => 0);
    const donePerDay = weekDays.map(() => 0);

    const inThisWeek = (d: string) => {
      const x = dayjs(d);
      return x.isValid() &&
        (x.isSame(weekStart, 'week') || (x.isAfter(weekStart) && x.diff(weekStart, 'day') <= 6));
    };

    // due counts (active + completed, counted by dueDate)
    [...active, ...completed].forEach(t => {
      if (!inThisWeek(t.dueDate)) return;
      const idx = dayjs(t.dueDate).startOf('day').diff(weekStart, 'day');
      if (idx >= 0 && idx < 7) duePerDay[idx] += 1;
    });

    // done counts (by dueDate)
    completed.forEach(t => {
      if (!inThisWeek(t.dueDate)) return;
      const idx = dayjs(t.dueDate).startOf('day').diff(weekStart, 'day');
      if (idx >= 0 && idx < 7) donePerDay[idx] += 1;
    });

    const pendingPerDay = duePerDay.map((d, i) => Math.max(0, d - donePerDay[i]));
    return {
      labels,
      data: [donePerDay, pendingPerDay], // stacked series
      barColors: [COLORS.done, COLORS.pending],
      totalDue: duePerDay.reduce((s, n) => s + n, 0),
      totalDone: donePerDay.reduce((s, n) => s + n, 0),
    };
  }, [active, completed]);

  // -------- Last 4 weeks completion % (line) --------
  const lastNWeeks = 4;
  const lineSeries = useMemo(() => {
    const labels: string[] = [];
    const rates: number[] = [];
    for (let i = lastNWeeks - 1; i >= 0; i--) {
      const start = dayjs().startOf('week').subtract(i, 'week');
      const end = start.add(6, 'day').endOf('day');
      labels.push(start.format('MM/D'));
      const inRange = (d: string) => {
        const x = dayjs(d);
        return x.isValid() && (x.isAfter(start) || x.isSame(start)) && (x.isBefore(end) || x.isSame(end));
      };
      const due = [...active, ...completed].filter(t => inRange(t.dueDate)).length;
      const done = completed.filter(t => inRange(t.dueDate)).length;
      const rate = due === 0 ? 0 : Math.round((done / due) * 100);
      rates.push(rate);
    }
    return { labels, datasets: [{ data: rates }] };
  }, [active, completed]);

  // -------- Category pie (distribution by due this month) --------
  const startMonth = dayjs().startOf('month');
  const endMonth = dayjs().endOf('month');
  const pieData = useMemo(() => {
    const counts: Record<Cat, number> = { Class:0, Assignment:0, Exam:0, Lab:0, Presentation:0 };
    const inMonth = (d: string) => {
      const x = dayjs(d);
      return x.isValid() && (x.isAfter(startMonth) || x.isSame(startMonth)) && (x.isBefore(endMonth) || x.isSame(endMonth));
    };
    [...active, ...completed].forEach(t => {
      if (!inMonth(t.dueDate)) return;
      const c = normalizeCat(t);
      if (c) counts[c] += 1;
    });
    const mapping: Record<Cat, string> = {
      Class: COLORS.class,
      Assignment: COLORS.assignment,
      Exam: COLORS.exam,
      Lab: COLORS.lab,
      Presentation: COLORS.presentation,
    } as const;

    const data = CATS.map((c) => ({
      name: c,
      population: counts[c],
      color: mapping[c],
      legendFontColor: '#444',
      legendFontSize: 12,
    })).filter(d => d.population > 0);

    // fallback slice if none
    return data.length ? data : [{
      name: 'No Tasks',
      population: 1,
      color: '#e5e7eb',
      legendFontColor: '#444',
      legendFontSize: 12,
    }];
  }, [active, completed]);

  // -------- Achievements / quick stats --------
  const kpis = useMemo(() => {
    // streak: consecutive days up to today with any completedAt
    let streak = 0;
    for (let i = 0; i < 60; i++) {
      const day = dayjs().startOf('day').subtract(i, 'day');
      const any = completed.some(t => t.completedAt && dayjs(t.completedAt).isSame(day, 'day'));
      if (any) streak += 1; else break;
    }

    const bestDay = (() => {
      const counts: Record<string, number> = {};
      completed.forEach(t => {
        if (!t.completedAt) return;
        const k = dayjs(t.completedAt).format('YYYY-MM-DD');
        counts[k] = (counts[k] || 0) + 1;
      });
      const top = Object.entries(counts).sort((a,b) => b[1]-a[1])[0];
      return top ? `${dayjs(top[0]).format('MMM D')}: ${top[1]} done` : '—';
    })();

    const onTimeRate = (() => {
      // consider on-time if completedAt exists and <= dueDate endOfDay
      let onTime = 0;
      let considered = 0;
      completed.forEach(t => {
        if (!t.completedAt) return;
        considered += 1;
        if (dayjs(t.completedAt).isBefore(dayjs(t.dueDate).endOf('day')) || dayjs(t.completedAt).isSame(dayjs(t.dueDate).endOf('day'))) {
          onTime += 1;
        }
      });
      return considered === 0 ? 0 : Math.round((onTime / considered) * 100);
    })();

    return { streak, bestDay, onTimeRate };
  }, [completed]);

  const weeklyCompletionRate = useMemo(() => {
    const { totalDone, totalDue } = weeklyStack;
    return totalDue === 0 ? 0 : Math.round((totalDone / totalDue) * 100);
  }, [weeklyStack]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fde2f3' }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>Weekly Analysis</Text>
          <Text style={styles.subheading}>
            {dayjs().startOf('week').format('MMM D')} – {dayjs().endOf('week').format('MMM D, YYYY')}
          </Text>
          <Text style={styles.kicker}>This week: <Text style={styles.kickerStrong}>{weeklyCompletionRate}%</Text> completed</Text>
        </View>

        {/* Stacked bar: Completed vs Pending (Sun–Sat) */}
        <Text style={styles.sectionTitle}>Completed vs Pending</Text>
        <View style={styles.card}>
          <StackedBarChart
            width={chartWidth}
            height={220}
            data={{
              labels: weeklyStack.labels,
              legend: ['Completed', 'Pending'],
              data: weeklyStack.data, // [completed[], pending[]]
              barColors: weeklyStack.barColors,
            }}
            chartConfig={chartConfig}
            style={styles.chart}
          />
          <View style={styles.legendRow}>
            <LegendDot color={COLORS.done} label="Completed" />
            <LegendDot color={COLORS.pending} label="Pending" />
          </View>
        </View>

        {/* Line: Last 4 weeks completion % */}
        <Text style={styles.sectionTitle}>4‑Week Trend</Text>
        <View style={styles.card}>
          <LineChart
            width={chartWidth}
            height={220}
            data={lineSeries}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            fromZero
            yAxisSuffix="%"
          />
        </View>

        {/* Pie: Category distribution this month */}
        <Text style={styles.sectionTitle}>Category Breakdown (This Month)</Text>
        <View style={styles.card}>
          <PieChart
            data={pieData}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="8"
            absolute
          />
        </View>

        {/* Achievements */}
        <Text style={styles.sectionTitle}>Highlights</Text>
        <View style={styles.kpiRow}>
          <Kpi label="Streak" value={`${kpis.streak} days`} />
          <Kpi label="On‑time Rate" value={`${kpis.onTimeRate}%`} />
        </View>
        <View style={styles.kpiRow}>
          <Kpi label="Best Day" value={kpis.bestDay} />
          <Kpi label="This Week" value={`${weeklyCompletionRate}%`} />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

/* ---------- small UI bits ---------- */
function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 120, backgroundColor: '#fde2f3', flexGrow: 1 },
  header: {
    backgroundColor: '#fca3b7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  heading: { fontSize: 20, fontWeight: '800', color: '#5a1040' },
  subheading: { fontSize: 14, color: '#5a1040', marginTop: 4 },
  kicker: { marginTop: 6, color: '#5a1040' },
  kickerStrong: { fontWeight: '800' },

  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#5a1040', marginTop: 10, marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12 },
  chart: { borderRadius: 12 },

  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 12, height: 12, borderRadius: 2 },
  legendText: { fontSize: 12, color: '#444' },

  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  kpi: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  kpiValue: { fontSize: 18, fontWeight: '800', color: '#111' },
  kpiLabel: { fontSize: 12, color: '#555', marginTop: 6 },
});
