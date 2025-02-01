import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AccessibleText } from '../../../components/accessible';
import { DeliveryStatus, DeliveryStatusUpdate } from '../types/delivery.types';
import { CustomTheme } from '../../../theme/types';

interface DeliveryStatusTimelineProps {
  statusUpdates: DeliveryStatusUpdate[];
  currentStatus: DeliveryStatus;
}

export const DeliveryStatusTimeline: React.FC<DeliveryStatusTimelineProps> = ({
  statusUpdates,
  currentStatus,
}) => {
  const { t } = useTranslation();
  const theme = useTheme() as CustomTheme;

  const getStatusIcon = (status: DeliveryStatus) => {
    switch (status) {
      case 'pending':
        return 'clock-outline';
      case 'accepted':
        return 'check-circle-outline';
      case 'picked_up':
        return 'package-variant';
      case 'in_transit':
        return 'truck-delivery';
      case 'delivered':
        return 'check-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'circle-outline';
    }
  };

  const getStatusColor = (status: DeliveryStatus, isCompleted: boolean) => {
    if (!isCompleted) return theme.colors.disabled;

    switch (status) {
      case 'delivered':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  const isStatusCompleted = (status: DeliveryStatus) => {
    const statusOrder: DeliveryStatus[] = [
      'pending',
      'accepted',
      'picked_up',
      'in_transit',
      'delivered',
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const statusIndex = statusOrder.indexOf(status);
    return statusIndex <= currentIndex;
  };

  return (
    <View style={styles.container}>
      {statusUpdates.map((update, index) => {
        const isCompleted = isStatusCompleted(update.status);
        const color = getStatusColor(update.status, isCompleted);

        return (
          <View key={index} style={styles.statusItem}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={getStatusIcon(update.status)}
                size={24}
                color={color}
              />
              {index < statusUpdates.length - 1 && (
                <View
                  style={[
                    styles.line,
                    {
                      backgroundColor: isCompleted
                        ? theme.colors.primary
                        : theme.colors.disabled,
                    },
                  ]}
                />
              )}
            </View>
            <View style={styles.statusContent}>
              <AccessibleText style={[styles.statusText, { color }]}>
                {t(`delivery.status.${update.status}`)}
              </AccessibleText>
              <AccessibleText style={styles.timestamp}>
                {format(new Date(update.timestamp), 'PPp', { locale: fr })}
              </AccessibleText>
              {update.note && (
                <AccessibleText style={styles.note}>{update.note}</AccessibleText>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  statusItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  statusContent: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  note: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});
