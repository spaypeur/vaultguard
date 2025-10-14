import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { socketService } from '../services/socket';
import * as Notifications from 'expo-notifications';
import { useRecentActivity } from '../hooks/useRecentActivity';

export default function DashboardScreen({ navigation }: any) {
  const activities = useRecentActivity();
  const [stats, setStats] = useState([
    { label: 'Total Value', value: '$1,234,567', change: '+12.5%' },
    { label: 'Active Threats', value: '3', change: 'Critical' },
    { label: 'Portfolios', value: '5', change: 'Active' },
    { label: 'Compliance', value: '98%', change: 'On Track' },
  ]);

  useEffect(() => {
    // Configure notifications
    async function setupNotifications() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Warning', 'Notifications are disabled. You may miss important security alerts.');
      }
    }

    // Initialize WebSocket connection
    async function setupWebSocket() {
      await socketService.connect();
      
      socketService.subscribeThreatAlerts(async (threat) => {
        // Update threat count in stats
        setStats(currentStats => {
          const newStats = [...currentStats];
          const threatStat = newStats.find(s => s.label === 'Active Threats');
          if (threatStat) {
            const currentValue = parseInt(threatStat.value);
            threatStat.value = (currentValue + 1).toString();
            threatStat.change = threat.severity;
          }
          return newStats;
        });

        // Show push notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Security Alert',
            body: `${threat.title} - ${threat.severity} severity`,
            data: { threatId: threat.id },
          },
          trigger: null,
        });
      });
    }

    setupNotifications();
    setupWebSocket();

    // Cleanup
    return () => {
      socketService.unsubscribeThreatAlerts();
      socketService.disconnect();
    };
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Security Command Center</Text>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statChange}>{stat.change}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.portfolioButton}
        onPress={() => navigation.navigate('Portfolio')}
      >
        <Text style={styles.portfolioButtonText}>View Portfolios</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {activities.length > 0 ? (
          activities.map((activity) => (
            <View key={activity.id} style={[
              styles.activityCard,
              activity.severity === 'critical' && styles.severity_critical,
              activity.severity === 'high' && styles.severity_high,
              activity.severity === 'medium' && styles.severity_medium,
              activity.severity === 'low' && styles.severity_low,
            ]}>
              <Text style={styles.activityType}>{activity.type.toUpperCase()}</Text>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityText}>{activity.description}</Text>
              <Text style={styles.activityTime}>
                {new Date(activity.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.activityCard}>
            <Text style={styles.activityText}>No recent activity</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    margin: '1%',
    borderWidth: 1,
    borderColor: '#374151',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statChange: {
    fontSize: 12,
    color: '#22c55e',
  },
  portfolioButton: {
    backgroundColor: '#0ea5e9',
    padding: 16,
    borderRadius: 8,
    margin: 20,
    alignItems: 'center',
  },
  portfolioButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  activityCard: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 8,
  },
  activityText: {
    color: '#9ca3af',
    marginTop: 4,
  },
  activityType: {
    color: '#0ea5e9',
    fontSize: 12,
    fontWeight: '600',
  },
  activityTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  activityTime: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  severity_critical: {
    borderColor: '#ef4444',
  },
  severity_high: {
    borderColor: '#f97316',
  },
  severity_medium: {
    borderColor: '#eab308',
  },
  severity_low: {
    borderColor: '#22c55e',
  },
});
