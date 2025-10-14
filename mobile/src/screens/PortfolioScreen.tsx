import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function PortfolioScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Portfolio Overview</Text>
        <Text style={styles.cardText}>Portfolio management coming soon...</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
    padding: 20,
  },
  card: {
    backgroundColor: '#1f2937',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  cardText: {
    color: '#9ca3af',
  },
});
