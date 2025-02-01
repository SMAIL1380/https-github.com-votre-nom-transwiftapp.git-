import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AccessibleText } from '../../../components/accessible';
import {
  AgentDashboardMetrics,
  TeamMetrics,
  AgentAvailability,
} from '../types/agent.types';
import { agentService } from '../services/agent.service';
import { CustomTheme } from '../../../theme/types';
import {
  LineChart,
  BarChart,
  PieChart,
} from 'react-native-chart-kit';

interface AgentDashboardProps {
  agentId: string;
  teamId?: string;
  onClose: () => void;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({
  agentId,
  teamId,
  onClose,
}) => {
  const { t } = useTranslation();
  const theme = useTheme() as CustomTheme;
  const [metrics, setMetrics] = useState<AgentDashboardMetrics | null>(null);
  const [teamMetrics, setTeamMetrics] = useState<TeamMetrics | null>(null);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day');
  const [availability, setAvailability] = useState<AgentAvailability | null>(null);

  useEffect(() => {
    loadMetrics();
    if (teamId) {
      loadTeamMetrics();
    }
    const unsubscribe = agentService.subscribeToMetrics(agentId, (newMetrics) => {
      setMetrics(newMetrics);
    });
    return unsubscribe;
  }, [agentId, teamId, timeframe]);

  const loadMetrics = async () => {
    try {
      const data = await agentService.getDashboardMetrics(agentId, timeframe);
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const loadTeamMetrics = async () => {
    if (!teamId) return;
    try {
      const data = await agentService.getTeamMetrics(teamId, timeframe);
      setTeamMetrics(data);
    } catch (error) {
      console.error('Error loading team metrics:', error);
    }
  };

  const renderMetricCard = (
    title: string,
    value: number | string,
    icon: string,
    trend?: number
  ) => (
    <View style={[styles.metricCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.metricHeader}>
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={theme.colors.primary}
        />
        <AccessibleText style={[styles.metricTitle, { color: theme.colors.text }]}>
          {title}
        </AccessibleText>
      </View>
      <AccessibleText style={[styles.metricValue, { color: theme.colors.text }]}>
        {value}
      </AccessibleText>
      {trend !== undefined && (
        <View
          style={[
            styles.trendBadge,
            {
              backgroundColor:
                trend > 0 ? theme.colors.success : theme.colors.error,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={trend > 0 ? 'trending-up' : 'trending-down'}
            size={16}
            color="#FFFFFF"
          />
          <AccessibleText style={styles.trendText}>
            {Math.abs(trend)}%
          </AccessibleText>
        </View>
      )}
    </View>
  );

  const renderPerformanceChart = () => {
    if (!metrics) return null;

    const data = {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [
        {
          data: metrics.performance.responseTime.byPriority,
          color: () => theme.colors.primary,
        },
      ],
    };

    return (
      <View style={styles.chartContainer}>
        <AccessibleText style={[styles.chartTitle, { color: theme.colors.text }]}>
          {t('support.dashboard.responseTimeChart')}
        </AccessibleText>
        <LineChart
          data={data}
          width={Dimensions.get('window').width - 32}
          height={220}
          chartConfig={{
            backgroundColor: theme.colors.card,
            backgroundGradientFrom: theme.colors.card,
            backgroundGradientTo: theme.colors.card,
            decimalPlaces: 0,
            color: () => theme.colors.primary,
            labelColor: () => theme.colors.text,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: theme.colors.primary,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    );
  };

  const renderWorkloadDistribution = () => {
    if (!metrics) return null;

    const data = {
      labels: ['Urgent', 'High', 'Medium', 'Low'],
      datasets: [
        {
          data: [
            metrics.performance.workload.activeTickets,
            metrics.performance.workload.pendingTransfers,
            metrics.performance.workload.escalations,
            0,
          ],
        },
      ],
    };

    return (
      <View style={styles.chartContainer}>
        <AccessibleText style={[styles.chartTitle, { color: theme.colors.text }]}>
          {t('support.dashboard.workloadChart')}
        </AccessibleText>
        <PieChart
          data={[
            {
              name: 'Urgent',
              population: metrics.performance.workload.activeTickets,
              color: theme.colors.error,
              legendFontColor: theme.colors.text,
            },
            {
              name: 'High',
              population: metrics.performance.workload.pendingTransfers,
              color: theme.colors.warning,
              legendFontColor: theme.colors.text,
            },
            {
              name: 'Medium',
              population: metrics.performance.workload.escalations,
              color: theme.colors.primary,
              legendFontColor: theme.colors.text,
            },
          ]}
          width={Dimensions.get('window').width - 32}
          height={220}
          chartConfig={{
            color: () => theme.colors.text,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <AccessibleText style={[styles.title, { color: theme.colors.text }]}>
          {t('support.dashboard.title')}
        </AccessibleText>
        <View style={styles.timeframeButtons}>
          {(['day', 'week', 'month'] as const).map((tf) => (
            <Pressable
              key={tf}
              style={[
                styles.timeframeButton,
                {
                  backgroundColor:
                    timeframe === tf
                      ? theme.colors.primary
                      : theme.colors.card,
                },
              ]}
              onPress={() => setTimeframe(tf)}
            >
              <AccessibleText
                style={[
                  styles.timeframeText,
                  {
                    color:
                      timeframe === tf
                        ? '#FFFFFF'
                        : theme.colors.text,
                  },
                ]}
              >
                {t(`support.dashboard.timeframe.${tf}`)}
              </AccessibleText>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <MaterialCommunityIcons
            name="close"
            size={24}
            color={theme.colors.text}
          />
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.metricsGrid}>
          {metrics && (
            <>
              {renderMetricCard(
                t('support.dashboard.responseTime'),
                `${metrics.performance.responseTime.average}min`,
                'clock-outline',
                metrics.performance.responseTime.trend
              )}
              {renderMetricCard(
                t('support.dashboard.resolution'),
                `${metrics.performance.resolution.rate}%`,
                'check-circle-outline',
                metrics.performance.resolution.rate - 100
              )}
              {renderMetricCard(
                t('support.dashboard.satisfaction'),
                `${metrics.performance.satisfaction.current}%`,
                'star-outline',
                metrics.performance.satisfaction.trend
              )}
              {renderMetricCard(
                t('support.dashboard.activeTickets'),
                metrics.performance.workload.activeTickets,
                'ticket-outline'
              )}
            </>
          )}
        </View>

        {renderPerformanceChart()}
        {renderWorkloadDistribution()}

        {teamMetrics && (
          <View style={styles.teamSection}>
            <AccessibleText
              style={[styles.sectionTitle, { color: theme.colors.text }]}
            >
              {t('support.dashboard.teamMetrics')}
            </AccessibleText>
            <View style={styles.teamStats}>
              {renderMetricCard(
                t('support.dashboard.teamResolution'),
                `${teamMetrics.metrics.resolvedToday}`,
                'account-group'
              )}
              {renderMetricCard(
                t('support.dashboard.teamBacklog'),
                teamMetrics.metrics.backlog,
                'clock-alert'
              )}
              {renderMetricCard(
                t('support.dashboard.teamSatisfaction'),
                `${teamMetrics.metrics.satisfactionScore}%`,
                'star'
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  timeframeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  timeframeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timeframeText: {
    fontSize: 14,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    position: 'absolute',
    right: 8,
    bottom: 8,
  },
  trendText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
  },
  chartContainer: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  teamSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  teamStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
});
