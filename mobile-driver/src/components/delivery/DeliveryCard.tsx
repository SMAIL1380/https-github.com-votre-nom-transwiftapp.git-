import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, useTheme, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatCurrency, formatDistance } from '../../utils/formatters';
import { DeliveryStatus } from '../../types/delivery';

interface DeliveryCardProps {
  delivery: {
    id: string;
    pickupAddress: string;
    deliveryAddress: string;
    distance: number;
    estimatedTime: number;
    price: number;
    status: DeliveryStatus;
    packageType: string;
    weight: number;
  };
  onPress: () => void;
}

const DeliveryCard = ({ delivery, onPress }: DeliveryCardProps) => {
  const theme = useTheme();

  const getStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case 'PENDING':
        return theme.colors.primary;
      case 'IN_PROGRESS':
        return theme.colors.accent;
      case 'COMPLETED':
        return theme.colors.success;
      case 'CANCELLED':
        return theme.colors.error;
      default:
        return theme.colors.disabled;
    }
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.packageInfo}>
              <MaterialCommunityIcons
                name="package-variant"
                size={24}
                color={theme.colors.primary}
              />
              <View style={styles.packageDetails}>
                <Text style={styles.packageType}>{delivery.packageType}</Text>
                <Text style={styles.weight}>{delivery.weight} kg</Text>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{formatCurrency(delivery.price)}</Text>
            </View>
          </View>

          <View style={styles.addressContainer}>
            <View style={styles.addressRow}>
              <Avatar.Icon
                size={24}
                icon="map-marker"
                style={[styles.icon, { backgroundColor: theme.colors.primary }]}
              />
              <Text style={styles.address} numberOfLines={2}>
                {delivery.pickupAddress}
              </Text>
            </View>
            <View style={styles.verticalLine} />
            <View style={styles.addressRow}>
              <Avatar.Icon
                size={24}
                icon="flag-checkered"
                style={[styles.icon, { backgroundColor: theme.colors.accent }]}
              />
              <Text style={styles.address} numberOfLines={2}>
                {delivery.deliveryAddress}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons
                name="map-marker-distance"
                size={16}
                color={theme.colors.primary}
              />
              <Text style={styles.infoText}>
                {formatDistance(delivery.distance)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={16}
                color={theme.colors.primary}
              />
              <Text style={styles.infoText}>
                {Math.round(delivery.estimatedTime)} min
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(delivery.status) }]}>
              <Text style={styles.statusText}>{delivery.status}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  packageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  packageDetails: {
    marginLeft: 8,
  },
  packageType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  weight: {
    fontSize: 14,
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
  addressContainer: {
    marginBottom: 16,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  address: {
    flex: 1,
    fontSize: 14,
  },
  verticalLine: {
    width: 2,
    height: 16,
    backgroundColor: '#E0E0E0',
    marginLeft: 11,
    marginVertical: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 4,
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default DeliveryCard;
