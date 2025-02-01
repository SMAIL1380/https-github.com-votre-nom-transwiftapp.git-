import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { DeliveryReport } from '../../features/reporting/services/ReportingService';
import { format } from 'date-fns';

interface ReportItemProps {
  report: DeliveryReport;
  onPress?: () => void;
  style?: any;
}

export const ReportItem: React.FC<ReportItemProps> = ({
  report,
  onPress,
  style,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const getTypeIcon = () => {
    switch (report.type) {
      case 'success':
        return 'check-circle';
      case 'failure':
        return 'error';
      case 'incident':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getTypeColor = () => {
    switch (report.type) {
      case 'success':
        return theme.colors.success;
      case 'failure':
        return theme.colors.error;
      case 'incident':
        return theme.colors.warning;
      default:
        return theme.colors.text;
    }
  };

  const getSyncIcon = () => {
    switch (report.syncStatus) {
      case 'synced':
        return 'cloud-done';
      case 'pending':
        return 'cloud-queue';
      case 'failed':
        return 'cloud-off';
      default:
        return 'cloud';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
        style,
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <Icon
            name={getTypeIcon()}
            size={24}
            color={getTypeColor()}
            style={styles.typeIcon}
          />
          <Text
            style={[styles.type, { color: getTypeColor() }]}
          >
            {t(`reports.types.${report.type}`)}
          </Text>
        </View>
        <Icon
          name={getSyncIcon()}
          size={20}
          color={
            report.syncStatus === 'synced'
              ? theme.colors.success
              : theme.colors.text
          }
        />
      </View>

      <View style={styles.content}>
        <Text style={[styles.timestamp, { color: theme.colors.text }]}>
          {format(report.timestamp, 'PPp')}
        </Text>

        {report.details.reason && (
          <Text
            style={[styles.reason, { color: theme.colors.text }]}
            numberOfLines={2}
          >
            {report.details.reason}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.batteryContainer}>
            <Icon
              name="battery-std"
              size={16}
              color={theme.colors.text}
              style={styles.batteryIcon}
            />
            <Text
              style={[styles.batteryLevel, { color: theme.colors.text }]}
            >
              {Math.round(report.batteryLevel * 100)}%
            </Text>
          </View>

          {report.details.photos && report.details.photos.length > 0 && (
            <View style={styles.photosContainer}>
              <Icon
                name="photo-library"
                size={16}
                color={theme.colors.text}
                style={styles.photosIcon}
              />
              <Text
                style={[styles.photosCount, { color: theme.colors.text }]}
              >
                {report.details.photos.length}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    marginRight: 8,
  },
  type: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  timestamp: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
  },
  reason: {
    fontSize: 14,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  batteryIcon: {
    marginRight: 4,
  },
  batteryLevel: {
    fontSize: 12,
  },
  photosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photosIcon: {
    marginRight: 4,
  },
  photosCount: {
    fontSize: 12,
  },
});
