import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Text, Card, SegmentedButtons } from 'react-native-paper';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useAPI } from '../../hooks/useAPI';
import { formatCurrency, formatDistance } from '../../utils/formatters';

const StatisticsScreen = () => {
  const { api } = useAPI();
  const [timeRange, setTimeRange] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [hourlyStats, setHourlyStats] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [areaStats, setAreaStats] = useState(null);

  useEffect(() => {
    loadStatistics();
  }, [timeRange]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const [statsRes, metricsRes, rankingRes, hourlyRes, weeklyRes, areaRes] = await Promise.all([
        api.get('/statistics'),
        api.get('/statistics/performance'),
        api.get('/statistics/ranking'),
        api.get('/statistics/hourly'),
        api.get('/statistics/weekly'),
        api.get('/statistics/area'),
      ]);

      setStats(statsRes.data[timeRange]);
      setPerformanceMetrics(metricsRes.data);
      setRanking(rankingRes.data);
      setHourlyStats(hourlyRes.data);
      setWeeklyStats(weeklyRes.data);
      setAreaStats(areaRes.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const weeklyData = {
    labels: weekDays,
    datasets: [
      {
        data: weeklyStats.map(stat => stat.deliveries),
      },
    ],
  };

  const hourlyData = {
    labels: Array.from({ length: 24 }, (_, i) => i.toString()),
    datasets: [
      {
        data: hourlyStats.map(stat => stat.deliveries),
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <SegmentedButtons
        value={timeRange}
        onValueChange={setTimeRange}
        buttons={[
          { value: 'daily', label: 'Jour' },
          { value: 'weekly', label: 'Semaine' },
          { value: 'monthly', label: 'Mois' },
        ]}
        style={styles.segmentedButtons}
      />

      <Card style={styles.card}>
        <Card.Title title="Aperçu des livraisons" />
        <Card.Content>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Terminées</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.onTime}</Text>
              <Text style={styles.statLabel}>À l'heure</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.cancelled}</Text>
              <Text style={styles.statLabel}>Annulées</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Performance" />
        <Card.Content>
          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Taux de complétion</Text>
            <Text style={styles.performanceValue}>
              {performanceMetrics.completionRate.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Taux de ponctualité</Text>
            <Text style={styles.performanceValue}>
              {performanceMetrics.onTimeRate.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Temps moyen de livraison</Text>
            <Text style={styles.performanceValue}>
              {Math.round(performanceMetrics.averageDeliveryTime)} min
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Classement" />
        <Card.Content>
          <Text style={styles.rankingText}>
            Vous êtes #{ranking.rank} sur {ranking.totalDrivers} livreurs
          </Text>
          <Text style={styles.percentileText}>
            Top {ranking.percentile.toFixed(1)}%
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Activité hebdomadaire" />
        <Card.Content>
          <BarChart
            data={weeklyData}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            }}
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Activité horaire" />
        <Card.Content>
          <LineChart
            data={hourlyData}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            }}
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Statistiques par zone" />
        <Card.Content>
          {areaStats.map((area, index) => (
            <View key={index} style={styles.areaRow}>
              <Text style={styles.areaName}>{area.area}</Text>
              <View style={styles.areaStats}>
                <Text style={styles.areaStat}>
                  {area.deliveries} livraisons
                </Text>
                <Text style={styles.areaStat}>
                  {formatCurrency(area.earnings)}
                </Text>
                <Text style={styles.areaStat}>
                  {Math.round(area.averageTime)} min en moyenne
                </Text>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentedButtons: {
    margin: 16,
  },
  card: {
    margin: 8,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  performanceLabel: {
    color: '#666',
  },
  performanceValue: {
    fontWeight: 'bold',
  },
  rankingText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 4,
  },
  percentileText: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
    marginVertical: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  areaRow: {
    marginVertical: 8,
  },
  areaName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  areaStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  areaStat: {
    color: '#666',
    fontSize: 12,
  },
});

export default StatisticsScreen;
