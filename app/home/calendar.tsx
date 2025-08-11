import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function CalendarScreen() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getMonthLayout = () => {
    const totalDays = 31;
    const firstDayOffset = 5; // August 1, 2025 = Friday = index 5
    const layout = [];

    // Add empty spaces before the 1st
    for (let i = 0; i < firstDayOffset; i++) {
      layout.push(null);
    }

    // Add the days
    for (let i = 1; i <= totalDays; i++) {
      layout.push(i);
    }

    return layout;
  };

  const daysLayout = getMonthLayout();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📅 August 2025</Text>

      {/* Weekday Labels */}
      <View style={styles.weekdayRow}>
        {days.map((day) => (
          <Text key={day} style={styles.weekdayText}>{day}</Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.grid}>
        {daysLayout.map((day, index) => (
          <View key={index} style={styles.cell}>
            {day && (
              <View
                style={[
                  styles.dateBubble,
                  day === 9 && styles.today, // highlight current
                ]}
              >
                <Text style={styles.dateText}>{day}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Upcoming */}
      <Text style={styles.subtitle}>📌 Upcoming</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🧪 Bio Quiz</Text>
        <Text style={styles.cardDate}>Aug 9 - Dr. Smith</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📘 English Essay</Text>
        <Text style={styles.cardDate}>Aug 15 - Ms. Brown</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fde2f3',
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#652ea5',
    textAlign: 'center',
    marginBottom: 16,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  weekdayText: {
    width: '14.28%',
    textAlign: 'center',
    fontWeight: '600',
    color: '#444',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  cell: {
    width: '13.5%',
    alignItems: 'center',
    marginVertical: 6,
  },
  dateBubble: {
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  today: {
    backgroundColor: '#ffcad4',
  },
  dateText: {
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7c3aed',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 14,
    color: '#666',
  },
});
