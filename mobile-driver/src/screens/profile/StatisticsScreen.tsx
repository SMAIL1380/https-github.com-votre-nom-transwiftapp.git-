import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, Button, List, useTheme } from 'react-native-paper';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStatistics } from '../../store/slices/statisticsSlice';

const { width } = Dimensions.get('window');

const StatisticsScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [timeFrame, setTimeFrame] = useState('week'); // week, month, year
  const [statistics, setStatistics] = useState({
    earnings: [],
    deliveries: [],
    rating: 0,
    totalDeliveries: 0,
    totalEarnings: 0,
    completionRate: 0,
  });

  useEffect(() => {
    loadStatistics();
  }, [timeFrame]);

  const loadStatistics = async () => {
    try {
      const stats = await dispatch(fetchStatistics(timeFrame)).unwrap();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.onSurface,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.colors.primary,
    },
  };

  const earningsData = {
    labels: statistics.earnings.map(e => e.date),
    datasets: [{
      data: statistics.earnings.map(e => e.amount),
    }],
  };

  const deliveriesData = {
    labels: statistics.deliveries.map(d => d.date),
    datasets: [{
      data: statistics.deliveries.map(d => d.count),
    }],
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.timeFrameButtons}>
        <Button
          mode={timeFrame === 'week' ? 'contained' : 'outlined'}
          onPress={() => setTimeFrame('week')}
          style={styles.timeButton}
        >
          Semaine
        </Button>
        <Button
          mode={timeFrame === 'month' ? 'contained' : 'outlined'}
          onPress={() => setTimeFrame('month')}
          style={styles.timeButton}
        >
          Mois
        </Button>
        <Button
          mode={timeFrame === 'year' ? 'contained' : 'outlined'}
          onPress={() => setTimeFrame('year')}
          style={styles.timeButton}
        >
          Année
        </Button>
      </View>

      <Card style={styles.summaryCard}>
        <Card.Content style={styles.summaryContent}>
          <View style={styles.summaryItem}>
            <Text variant="titleLarge">{statistics.totalDeliveries}</Text>
            <Text variant="bodyMedium">Livraisons</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text variant="titleLarge">{statistics.totalEarnings}€</Text>
            <Text variant="bodyMedium">Gains</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text variant="titleLarge">{statistics.rating}⭐</Text>
            <Text variant="bodyMedium">Note</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.chartCard}>
        <Card.Title title="Gains" />
        <Card.Content>
          <LineChart
            data={earningsData}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      <Card style={styles.chartCard}>
        <Card.Title title="Livraisons" />
        <Card.Content>
          <BarChart
            data={deliveriesData}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      <List.Section>
        <List.Subheader>Performance</List.Subheader>
        <List.Item
          title="Taux de complétion"
          description={`${statistics.completionRate}%`}
          left={props => <List.Icon {...props} icon="check-circle" />}
        />
        <List.Item
          title="Temps moyen par livraison"
          description="25 minutes"
          left={props => <List.Icon {...props} icon="clock" />}
        />
        <List.Item
          title="Distance totale parcourue"
          description="342 km"
          left={props => <List.Icon {...props} icon="map-marker-distance" />}
        />
      </List.Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  timeFrameButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  timeButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  summaryCard: {
    margin: 16,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  chartCard: {
    margin: 16,
    marginTop: 0,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default StatisticsScreen;
