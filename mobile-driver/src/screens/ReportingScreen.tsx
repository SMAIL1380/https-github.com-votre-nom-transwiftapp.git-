import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/common/Header';
import { StatusBar } from '../components/common/StatusBar';
import { MetricsCard } from '../components/reporting/MetricsCard';
import { ReportList } from '../components/reporting/ReportList';
import { LoadingAnimation } from '../components/animations/LoadingAnimation';
import { reportingService, ReportMetrics } from '../features/reporting/services/ReportingService';
import { DateRangePicker } from '../components/reporting/DateRangePicker';

export const ReportingScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [dateRange, setDateRange] = useState<{
    startDate: number;
    endDate: number;
  }>({
    startDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 jours
    endDate: Date.now(),
  });

  useEffect(() => {
    loadMetrics();
  }, [dateRange]);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const data = await reportingService.getMetrics(
        dateRange.startDate,
        dateRange.endDate
      );
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateRangeChange = (startDate: number, endDate: number) => {
    setDateRange({ startDate, endDate });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LoadingAnimation type="pulse" color={theme.colors.primary} size={50} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar />
      <Header title={t('reporting.title')} />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <DateRangePicker
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onChange={handleDateRangeChange}
          style={styles.datePicker}
        />

        {metrics && (
          <>
            <View style={styles.metricsContainer}>
              <MetricsCard
                title={t('reporting.metrics.deliveries')}
                value={metrics.totalDeliveries}
                icon="local-shipping"
                trend={{
                  value: ((metrics.successfulDeliveries / metrics.totalDeliveries) * 100) || 0,
                  label: t('reporting.metrics.successRate'),
                }}
              />
              <MetricsCard
                title={t('reporting.metrics.incidents')}
                value={metrics.incidents}
                icon="warning"
                style={styles.metricCard}
              />
              <MetricsCard
                title={t('reporting.metrics.battery')}
                value={Math.round(metrics.batteryConsumption * 100)}
                unit="%"
                icon="battery-charging-full"
                style={styles.metricCard}
              />
            </View>

            <ReportList
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              style={styles.reportList}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  datePicker: {
    marginBottom: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  metricCard: {
    marginLeft: 16,
  },
  reportList: {
    marginTop: 24,
  },
});
