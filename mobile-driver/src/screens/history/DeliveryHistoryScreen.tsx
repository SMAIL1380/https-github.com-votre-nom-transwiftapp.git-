import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  useTheme,
  Searchbar,
  Chip,
  Portal,
  Modal,
  Button,
  Divider,
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../store';
import { getDeliveryHistory } from '../../services/delivery.service';
import { formatCurrency, formatDateTime, formatDistance } from '../../utils/formatters';
import { DeliveryStatus } from '../../types/delivery';

const DeliveryHistoryScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.auth.user);
  const isExternalDriver = user?.type === 'EXTERNAL';

  const [deliveries, setDeliveries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<DeliveryStatus | null>(null);
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    completedDeliveries: 0,
    totalDistance: 0,
    totalEarnings: 0,
    averageRating: 0,
  });

  useEffect(() => {
    loadDeliveries();
  }, [selectedStatus]);

  const loadDeliveries = async () => {
    try {
      const data = await getDeliveryHistory({
        status: selectedStatus,
        search: searchQuery,
      });
      setDeliveries(data.deliveries);
      setStats(data.stats);
    } catch (error) {
      console.error('Error loading delivery history:', error);
    }
  };

  const filterDeliveries = (delivery) => {
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        delivery.id.toLowerCase().includes(searchLower) ||
        delivery.pickupAddress.toLowerCase().includes(searchLower) ||
        delivery.deliveryAddress.toLowerCase().includes(searchLower)
      );
    }
    return true;
  };

  const statusFilters: { label: string; value: DeliveryStatus | null }[] = [
    { label: 'Tous', value: null },
    { label: 'En cours', value: 'IN_PROGRESS' },
    { label: 'Terminées', value: 'COMPLETED' },
    { label: 'Annulées', value: 'CANCELLED' },
  ];

  const renderDeliveryCard = ({ item: delivery }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('DeliveryDetails', { id: delivery.id })}
    >
      <Card style={styles.deliveryCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.deliveryId}>Livraison #{delivery.id}</Text>
              <Text style={styles.date}>{formatDateTime(delivery.createdAt)}</Text>
            </View>
            {isExternalDriver && (
              <View style={styles.priceContainer}>
                <Text style={styles.price}>{formatCurrency(delivery.price)}</Text>
              </View>
            )}
          </View>

          <Divider style={styles.divider} />

          <View style={styles.addresses}>
            <Text numberOfLines={1} style={styles.address}>
              De: {delivery.pickupAddress}
            </Text>
            <Text numberOfLines={1} style={styles.address}>
              À: {delivery.deliveryAddress}
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.distance}>
              {formatDistance(delivery.distance)}
            </Text>
            <Chip
              mode="outlined"
              selectedColor={getStatusColor(delivery.status)}
              style={{ borderColor: getStatusColor(delivery.status) }}
            >
              {delivery.status}
            </Chip>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const getStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case 'IN_PROGRESS':
        return theme.colors.primary;
      case 'COMPLETED':
        return theme.colors.success;
      case 'CANCELLED':
        return theme.colors.error;
      default:
        return theme.colors.disabled;
    }
  };

  return (
    <View style={styles.container}>
      {/* Search and Filters */}
      <View style={styles.header}>
        <Searchbar
          placeholder="Rechercher une livraison"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
        >
          {statusFilters.map((filter) => (
            <Chip
              key={filter.value || 'all'}
              selected={selectedStatus === filter.value}
              onPress={() => setSelectedStatus(filter.value)}
              style={styles.filterChip}
            >
              {filter.label}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Stats Summary */}
      <TouchableOpacity
        onPress={() => setStatsModalVisible(true)}
        style={styles.statsCard}
      >
        <Card>
          <Card.Content>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalDeliveries}</Text>
                <Text style={styles.statLabel}>Livraisons</Text>
              </View>
              {isExternalDriver && (
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {formatCurrency(stats.totalEarnings)}
                  </Text>
                  <Text style={styles.statLabel}>Gains</Text>
                </View>
              )}
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {formatDistance(stats.totalDistance)}
                </Text>
                <Text style={styles.statLabel}>Distance</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>

      {/* Deliveries List */}
      <FlatList
        data={deliveries.filter(filterDeliveries)}
        renderItem={renderDeliveryCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />

      {/* Stats Modal */}
      <Portal>
        <Modal
          visible={statsModalVisible}
          onDismiss={() => setStatsModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Statistiques détaillées</Text>
          
          <View style={styles.modalStats}>
            <View style={styles.modalStatItem}>
              <Text style={styles.modalStatValue}>{stats.totalDeliveries}</Text>
              <Text style={styles.modalStatLabel}>Total des livraisons</Text>
            </View>
            
            <View style={styles.modalStatItem}>
              <Text style={styles.modalStatValue}>{stats.completedDeliveries}</Text>
              <Text style={styles.modalStatLabel}>Livraisons terminées</Text>
            </View>
            
            <View style={styles.modalStatItem}>
              <Text style={styles.modalStatValue}>
                {formatDistance(stats.totalDistance)}
              </Text>
              <Text style={styles.modalStatLabel}>Distance totale</Text>
            </View>
            
            {isExternalDriver && (
              <View style={styles.modalStatItem}>
                <Text style={styles.modalStatValue}>
                  {formatCurrency(stats.totalEarnings)}
                </Text>
                <Text style={styles.modalStatLabel}>Gains totaux</Text>
              </View>
            )}
            
            <View style={styles.modalStatItem}>
              <Text style={styles.modalStatValue}>
                {stats.averageRating.toFixed(1)}
              </Text>
              <Text style={styles.modalStatLabel}>Note moyenne</Text>
            </View>
          </View>

          <Button
            mode="contained"
            onPress={() => setStatsModalVisible(false)}
            style={styles.modalButton}
          >
            Fermer
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
  },
  searchBar: {
    marginBottom: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  statsCard: {
    margin: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  listContainer: {
    padding: 16,
  },
  deliveryCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    opacity: 0.7,
  },
  priceContainer: {
    backgroundColor: '#E8F5E9',
    padding: 8,
    borderRadius: 8,
  },
  price: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
  },
  addresses: {
    marginBottom: 12,
  },
  address: {
    fontSize: 14,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distance: {
    fontSize: 12,
    opacity: 0.7,
  },
  modal: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modalStatItem: {
    width: '45%',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalStatLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  modalButton: {
    marginTop: 16,
  },
});

export default DeliveryHistoryScreen;
