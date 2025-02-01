import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { AccessibleText } from '../../../components/accessible';
import { CustomTheme } from '../../../theme/types';
import { DeliveryService } from '../../delivery/services/delivery.service';
import { DeliveryStatus } from '../../delivery/types/delivery.types';

interface OrderHistoryItem {
  id: string;
  createdAt: string;
  status: DeliveryStatus;
  pickupAddress: string;
  deliveryAddress: string;
  price: number;
  trackingNumber: string;
}

export const OrderHistoryScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme() as CustomTheme;
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await DeliveryService.getDeliveryHistory();
      setOrders(data);
    } catch (err) {
      setError(t('orders.loadError'));
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders(false);
  };

  const getStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case 'completed':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      case 'in_progress':
        return theme.colors.primary;
      default:
        return theme.colors.text;
    }
  };

  const renderOrder = ({ item }: { item: OrderHistoryItem }) => (
    <TouchableOpacity
      style={[styles.orderCard, { backgroundColor: theme.colors.card }]}
      onPress={() => {/* Navigate to order details */}}
    >
      <View style={styles.orderHeader}>
        <AccessibleText style={styles.trackingNumber}>
          {t('orders.trackingNumber', { number: item.trackingNumber })}
        </AccessibleText>
        <AccessibleText
          style={[styles.status, { color: getStatusColor(item.status) }]}
        >
          {t(`orders.status.${item.status}`)}
        </AccessibleText>
      </View>

      <AccessibleText style={styles.date}>
        {format(new Date(item.createdAt), 'PPp')}
      </AccessibleText>

      <View style={styles.addressContainer}>
        <AccessibleText style={styles.addressLabel}>
          {t('orders.from')}:
        </AccessibleText>
        <AccessibleText style={styles.address} numberOfLines={1}>
          {item.pickupAddress}
        </AccessibleText>
      </View>

      <View style={styles.addressContainer}>
        <AccessibleText style={styles.addressLabel}>
          {t('orders.to')}:
        </AccessibleText>
        <AccessibleText style={styles.address} numberOfLines={1}>
          {item.deliveryAddress}
        </AccessibleText>
      </View>

      <AccessibleText style={styles.price}>
        {t('orders.price', { price: item.price })}
      </AccessibleText>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {error ? (
        <AccessibleText style={[styles.error, { color: theme.colors.error }]}>
          {error}
        </AccessibleText>
      ) : null}

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <AccessibleText style={styles.emptyText}>
              {t('orders.noOrders')}
            </AccessibleText>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  orderCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  date: {
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.7,
  },
  addressContainer: {
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  address: {
    fontSize: 16,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'right',
  },
  error: {
    padding: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
});
