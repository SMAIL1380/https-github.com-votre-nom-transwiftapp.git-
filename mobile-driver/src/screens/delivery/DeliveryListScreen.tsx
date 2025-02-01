import React, { useState, useEffect } from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, Button, List, Badge, useTheme, Portal, Modal } from 'react-native-paper';
import { useSelector } from 'react-redux';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

enum DeliveryStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  PICKED_UP = 'picked_up',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

interface Delivery {
  id: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupTime: Date;
  expectedDeliveryTime: Date;
  status: DeliveryStatus;
  distance: number;
  price: number;
  customerName: string;
  packageDetails: {
    weight: number;
    dimensions: string;
    type: string;
  };
  pickupLocation: {
    latitude: number;
    longitude: number;
  };
  deliveryLocation: {
    latitude: number;
    longitude: number;
  };
}

const DeliveryListScreen = ({ navigation }) => {
  const theme = useTheme();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/driver/deliveries`);
      setDeliveries(response.data);
    } catch (error) {
      console.error('Failed to load deliveries:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDeliveries();
    setRefreshing(false);
  };

  const handleAcceptDelivery = async (deliveryId: string) => {
    try {
      await axios.post(`${API_URL}/api/driver/deliveries/${deliveryId}/accept`);
      await loadDeliveries();
      navigation.navigate('DeliveryDetails', { deliveryId });
    } catch (error) {
      console.error('Failed to accept delivery:', error);
    }
  };

  const handleRejectDelivery = async (deliveryId: string) => {
    try {
      await axios.post(`${API_URL}/api/driver/deliveries/${deliveryId}/reject`);
      await loadDeliveries();
    } catch (error) {
      console.error('Failed to reject delivery:', error);
    }
  };

  const getStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case DeliveryStatus.PENDING:
        return theme.colors.warning;
      case DeliveryStatus.ACCEPTED:
        return theme.colors.primary;
      case DeliveryStatus.PICKED_UP:
        return theme.colors.secondary;
      case DeliveryStatus.IN_PROGRESS:
        return theme.colors.info;
      case DeliveryStatus.COMPLETED:
        return theme.colors.success;
      case DeliveryStatus.CANCELLED:
        return theme.colors.error;
      default:
        return theme.colors.surface;
    }
  };

  const getStatusText = (status: DeliveryStatus) => {
    switch (status) {
      case DeliveryStatus.PENDING:
        return 'En attente';
      case DeliveryStatus.ACCEPTED:
        return 'Acceptée';
      case DeliveryStatus.PICKED_UP:
        return 'Récupérée';
      case DeliveryStatus.IN_PROGRESS:
        return 'En cours';
      case DeliveryStatus.COMPLETED:
        return 'Terminée';
      case DeliveryStatus.CANCELLED:
        return 'Annulée';
      default:
        return status;
    }
  };

  const renderDeliveryCard = (delivery: Delivery) => (
    <Card
      style={styles.deliveryCard}
      onPress={() => setSelectedDelivery(delivery)}
    >
      <Card.Content>
        <View style={styles.headerRow}>
          <Text variant="titleMedium">Livraison #{delivery.id}</Text>
          <Badge
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(delivery.status) }
            ]}
          >
            {getStatusText(delivery.status)}
          </Badge>
        </View>

        <List.Item
          title="Adresse de collecte"
          description={delivery.pickupAddress}
          left={props => <Icon {...props} name="map-marker" size={24} color={theme.colors.primary} />}
        />

        <List.Item
          title="Adresse de livraison"
          description={delivery.deliveryAddress}
          left={props => <Icon {...props} name="flag-checkered" size={24} color={theme.colors.secondary} />}
        />

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Icon name="clock-outline" size={20} color={theme.colors.primary} />
            <Text variant="bodyMedium">
              {format(new Date(delivery.pickupTime), 'HH:mm', { locale: fr })}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="map-marker-distance" size={20} color={theme.colors.primary} />
            <Text variant="bodyMedium">{delivery.distance} km</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="currency-eur" size={20} color={theme.colors.primary} />
            <Text variant="bodyMedium">{delivery.price} €</Text>
          </View>
        </View>

        {delivery.status === DeliveryStatus.PENDING && (
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={() => handleAcceptDelivery(delivery.id)}
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            >
              Accepter
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleRejectDelivery(delivery.id)}
              style={styles.actionButton}
            >
              Refuser
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <List.Section>
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh}>
          {deliveries.map(delivery => renderDeliveryCard(delivery))}
        </RefreshControl>
      </List.Section>

      <Portal>
        <Modal
          visible={!!selectedDelivery}
          onDismiss={() => setSelectedDelivery(null)}
          contentContainerStyle={styles.modal}
        >
          {selectedDelivery && (
            <View>
              <Text variant="titleLarge" style={styles.modalTitle}>
                Détails de la livraison
              </Text>

              <Card style={styles.mapCard}>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={styles.map}
                  initialRegion={{
                    latitude: selectedDelivery.pickupLocation.latitude,
                    longitude: selectedDelivery.pickupLocation.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  }}
                >
                  <Marker
                    coordinate={selectedDelivery.pickupLocation}
                    title="Point de collecte"
                    pinColor={theme.colors.primary}
                  />
                  <Marker
                    coordinate={selectedDelivery.deliveryLocation}
                    title="Point de livraison"
                    pinColor={theme.colors.secondary}
                  />
                </MapView>
              </Card>

              <List.Item
                title="Client"
                description={selectedDelivery.customerName}
                left={props => <Icon {...props} name="account" size={24} />}
              />

              <List.Item
                title="Colis"
                description={`${selectedDelivery.packageDetails.weight}kg - ${selectedDelivery.packageDetails.dimensions} - ${selectedDelivery.packageDetails.type}`}
                left={props => <Icon {...props} name="package-variant" size={24} />}
              />

              <View style={styles.modalButtons}>
                <Button
                  mode="contained"
                  onPress={() => {
                    navigation.navigate('DeliveryDetails', {
                      deliveryId: selectedDelivery.id,
                    });
                    setSelectedDelivery(null);
                  }}
                  style={styles.modalButton}
                >
                  Voir les détails
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => setSelectedDelivery(null)}
                  style={styles.modalButton}
                >
                  Fermer
                </Button>
              </View>
            </View>
          )}
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
  deliveryCard: {
    margin: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  modal: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  mapCard: {
    marginVertical: 16,
    height: 200,
    overflow: 'hidden',
  },
  map: {
    height: '100%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default DeliveryListScreen;
