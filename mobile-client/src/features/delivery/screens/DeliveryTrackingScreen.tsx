import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AccessibleText, AccessibleButton } from '../../../components/accessible';
import { DeliveryTrackingMap } from '../components/DeliveryTrackingMap';
import { DeliveryStatusTimeline } from '../components/DeliveryStatusTimeline';
import { DeliveryService } from '../services/delivery.service';
import { DeliveryTrackingInfo } from '../types/delivery.types';
import { CustomTheme } from '../../../theme/types';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { ErrorView } from '../../../components/common/ErrorView';
import { formatDuration } from '../../../utils/date';

interface Props {
  deliveryId: string;
}

export const DeliveryTrackingScreen: React.FC<Props> = ({ deliveryId }) => {
  const { t } = useTranslation();
  const theme = useTheme() as CustomTheme;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<DeliveryTrackingInfo | null>(null);

  const loadTrackingInfo = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const info = await DeliveryService.getTrackingInfo(deliveryId);
      setTrackingInfo(info);
      setError('');
    } catch (err) {
      setError(t('delivery.loadError'));
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTrackingInfo();
    // Set up real-time updates
    const ws = new WebSocket(`${process.env.WS_URL}/delivery/${deliveryId}`);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setTrackingInfo(prev => ({
        ...prev!,
        ...update,
      }));
    };

    return () => {
      ws.close();
    };
  }, [deliveryId]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTrackingInfo(false);
  };

  const handleCancel = async () => {
    try {
      await DeliveryService.cancelDelivery(deliveryId);
      loadTrackingInfo();
    } catch (err) {
      setError(t('delivery.cancelError'));
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={loadTrackingInfo} />;
  }

  if (!trackingInfo) return null;

  const { delivery, statusUpdates, currentLocation, eta } = trackingInfo;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <DeliveryTrackingMap trackingInfo={trackingInfo} style={styles.map} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <AccessibleText style={styles.trackingNumber}>
              {t('delivery.trackingNumber', { number: delivery.trackingNumber })}
            </AccessibleText>
            {eta && (
              <AccessibleText style={styles.eta}>
                {t('delivery.eta', { time: formatDuration(eta) })}
              </AccessibleText>
            )}
          </View>

          {delivery.status !== 'cancelled' && delivery.status !== 'delivered' && (
            <AccessibleButton
              onPress={handleCancel}
              title={t('delivery.cancel')}
              variant="danger"
            />
          )}
        </View>

        <View style={styles.addresses}>
          <View style={styles.addressBlock}>
            <AccessibleText style={styles.addressLabel}>
              {t('delivery.pickup')}
            </AccessibleText>
            <AccessibleText style={styles.address}>
              {delivery.pickup.address}
            </AccessibleText>
            <AccessibleText style={styles.contactInfo}>
              {delivery.pickup.contactName} • {delivery.pickup.contactPhone}
            </AccessibleText>
          </View>

          <View style={styles.addressBlock}>
            <AccessibleText style={styles.addressLabel}>
              {t('delivery.dropoff')}
            </AccessibleText>
            <AccessibleText style={styles.address}>
              {delivery.dropoff.address}
            </AccessibleText>
            <AccessibleText style={styles.contactInfo}>
              {delivery.dropoff.contactName} • {delivery.dropoff.contactPhone}
            </AccessibleText>
          </View>
        </View>

        <DeliveryStatusTimeline
          statusUpdates={statusUpdates}
          currentStatus={delivery.status}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    height: 300,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  trackingNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eta: {
    fontSize: 14,
    opacity: 0.7,
  },
  addresses: {
    marginBottom: 24,
  },
  addressBlock: {
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  address: {
    fontSize: 16,
    marginBottom: 4,
  },
  contactInfo: {
    fontSize: 14,
    opacity: 0.7,
  },
});
