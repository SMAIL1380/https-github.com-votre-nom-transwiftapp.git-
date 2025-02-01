import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, List, useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EarningsDashboardScreen = () => {
  const theme = useTheme();
  const user = useSelector(state => state.auth.user);
  const isInternalDriver = user?.driverType === 'internal';
  
  const [earnings, setEarnings] = useState({
    available: 0,
    pending: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    // Pour les chauffeurs internes
    salary: 0,
    bonuses: 0,
    overtimeHours: 0,
  });
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEarningsData();
  }, []);

  const loadEarningsData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(
        `${process.env.API_URL}/api/driver/earnings`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setEarnings(response.data.earnings);
      setRecentDeliveries(response.data.recentDeliveries);
    } catch (error) {
      console.error('Failed to load earnings:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEarningsData();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return `${amount.toFixed(2)} €`;
  };

  const renderInternalDriverContent = () => (
    <>
      <Card style={styles.salaryCard}>
        <Card.Content>
          <Text variant="titleMedium">Salaire mensuel</Text>
          <Text variant="headlineLarge" style={styles.amount}>
            {formatCurrency(earnings.salary)}
          </Text>
          {earnings.bonuses > 0 && (
            <Text variant="bodyMedium" style={styles.bonusText}>
              Primes: {formatCurrency(earnings.bonuses)}
            </Text>
          )}
          {earnings.overtimeHours > 0 && (
            <Text variant="bodyMedium" style={styles.overtimeText}>
              Heures supplémentaires: {earnings.overtimeHours}h
            </Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.deliveriesCard}>
        <Card.Content>
          <Text variant="titleMedium">Livraisons du mois</Text>
          {recentDeliveries.map((delivery) => (
            <List.Item
              key={delivery.id}
              title={`Livraison #${delivery.id}`}
              description={new Date(delivery.completedAt).toLocaleDateString()}
              right={() => <Text>Effectuée</Text>}
            />
          ))}
        </Card.Content>
      </Card>
    </>
  );

  const renderExternalDriverContent = () => (
    <>
      <Card style={styles.earningsCard}>
        <Card.Content>
          <Text variant="titleMedium">Gains disponibles</Text>
          <Text variant="headlineLarge" style={styles.amount}>
            {formatCurrency(earnings.available)}
          </Text>
          <Text variant="bodyMedium" style={styles.pendingText}>
            En attente: {formatCurrency(earnings.pending)}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text variant="titleMedium">Cette semaine</Text>
              <Text variant="headlineSmall" style={styles.summaryAmount}>
                {formatCurrency(earnings.weeklyEarnings)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text variant="titleMedium">Ce mois</Text>
              <Text variant="headlineSmall" style={styles.summaryAmount}>
                {formatCurrency(earnings.monthlyEarnings)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.deliveriesCard}>
        <Card.Content>
          <Text variant="titleMedium">Dernières livraisons</Text>
          {recentDeliveries.map((delivery) => (
            <List.Item
              key={delivery.id}
              title={`Livraison #${delivery.id}`}
              description={new Date(delivery.completedAt).toLocaleDateString()}
              right={() => (
                <Text style={styles.deliveryAmount}>
                  {formatCurrency(delivery.earnings)}
                </Text>
              )}
            />
          ))}
        </Card.Content>
      </Card>
    </>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {isInternalDriver ? renderInternalDriverContent() : renderExternalDriverContent()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  salaryCard: {
    margin: 16,
    marginBottom: 8,
  },
  earningsCard: {
    margin: 16,
    marginBottom: 8,
  },
  amount: {
    marginVertical: 8,
    color: 'green',
  },
  pendingText: {
    color: '#666',
  },
  bonusText: {
    color: '#2196F3',
    marginTop: 4,
  },
  overtimeText: {
    color: '#FF9800',
    marginTop: 4,
  },
  summaryCard: {
    margin: 16,
    marginVertical: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryAmount: {
    marginTop: 8,
    color: '#2196F3',
  },
  deliveriesCard: {
    margin: 16,
    marginVertical: 8,
  },
  deliveryAmount: {
    color: 'green',
  },
});

export default EarningsDashboardScreen;
