import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface MetricsCardProps {
  title: string;
  value: number;
  icon: string;
  unit?: string;
  trend?: {
    value: number;
    label: string;
  };
  style?: any;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  icon,
  unit,
  trend,
  style,
}) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
        style,
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {title}
        </Text>
        <Icon name={icon} size={24} color={theme.colors.primary} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.value, { color: theme.colors.text }]}>
          {value}
          {unit && <Text style={styles.unit}>{unit}</Text>}
        </Text>

        {trend && (
          <View style={styles.trendContainer}>
            <Icon
              name={trend.value >= 0 ? 'trending-up' : 'trending-down'}
              size={16}
              color={trend.value >= 0 ? theme.colors.success : theme.colors.error}
              style={styles.trendIcon}
            />
            <Text
              style={[
                styles.trendValue,
                {
                  color:
                    trend.value >= 0
                      ? theme.colors.success
                      : theme.colors.error,
                },
              ]}
            >
              {Math.abs(trend.value).toFixed(1)}%
            </Text>
            <Text
              style={[styles.trendLabel, { color: theme.colors.text }]}
            >
              {trend.label}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 150,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  content: {
    flex: 1,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  unit: {
    fontSize: 16,
    fontWeight: 'normal',
    marginLeft: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  trendIcon: {
    marginRight: 4,
  },
  trendValue: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  trendLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
});
