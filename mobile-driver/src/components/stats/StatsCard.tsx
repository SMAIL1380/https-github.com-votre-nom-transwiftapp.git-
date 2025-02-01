import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/formatters';

interface StatsCardProps {
  deliveries: number;
  earnings: number;
  distance: number;
  rating: number;
}

const StatsCard = ({ deliveries, earnings, distance, rating }: StatsCardProps) => {
  const theme = useTheme();

  const stats = [
    {
      icon: 'package-variant',
      label: 'Livraisons',
      value: deliveries.toString(),
      color: theme.colors.primary,
    },
    {
      icon: 'currency-eur',
      label: 'Gains',
      value: formatCurrency(earnings),
      color: '#2E7D32',
    },
    {
      icon: 'map-marker-distance',
      label: 'Distance',
      value: `${distance} km`,
      color: theme.colors.accent,
    },
    {
      icon: 'star',
      label: 'Note',
      value: rating.toFixed(1),
      color: '#FFA000',
    },
  ];

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>Aujourd'hui</Text>
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
                <MaterialCommunityIcons
                  name={stat.icon}
                  size={24}
                  color={stat.color}
                />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
});

export default StatsCard;
