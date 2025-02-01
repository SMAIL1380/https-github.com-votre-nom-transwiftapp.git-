import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { DeliveryReport, reportingService } from '../../features/reporting/services/ReportingService';
import { ReportItem } from './ReportItem';
import { EmptyState } from '../common/EmptyState';
import { ListItemTransition } from '../animations/transitions/ListItemTransition';

interface ReportListProps {
  startDate: number;
  endDate: number;
  style?: any;
}

export const ReportList: React.FC<ReportListProps> = ({
  startDate,
  endDate,
  style,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [reports, setReports] = useState<DeliveryReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [startDate, endDate]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      // Simuler le chargement des rapports
      const allReports = await Promise.all(
        (await reportingService.getReportsByDelivery('all'))
          .filter(
            report =>
              report.timestamp >= startDate && report.timestamp <= endDate
          )
          .sort((a, b) => b.timestamp - a.timestamp)
      );
      setReports(allReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item, index }: { item: DeliveryReport; index: number }) => (
    <ListItemTransition delay={index * 100}>
      <ReportItem report={item} style={styles.reportItem} />
    </ListItemTransition>
  );

  if (isLoading) {
    return (
      <EmptyState
        icon="hourglass-empty"
        title={t('reports.loading.title')}
        description={t('reports.loading.description')}
        loading={true}
      />
    );
  }

  if (reports.length === 0) {
    return (
      <EmptyState
        icon="assignment"
        title={t('reports.empty.title')}
        description={t('reports.empty.description')}
      />
    );
  }

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={reports}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View
            style={[
              styles.separator,
              { backgroundColor: theme.colors.border },
            ]}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  reportItem: {
    marginVertical: 8,
  },
  separator: {
    height: 1,
    marginVertical: 8,
  },
});
