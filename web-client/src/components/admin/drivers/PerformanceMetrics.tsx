import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Rating,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Info as InfoIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useParams } from 'react-router-dom';
import { useDriverPerformance } from '../../../hooks/useDriverPerformance';

export const PerformanceMetrics: React.FC = () => {
  const { driverId } = useParams<{ driverId: string }>();
  const { metrics, report, loading, error } = useDriverPerformance(driverId);
  const [selectedPeriod, setSelectedPeriod] = useState('MONTHLY');

  if (loading) return <LinearProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!report) return null;

  const renderPerformanceIndicator = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    const color = percentage >= 90 ? 'success' : percentage >= 70 ? 'warning' : 'error';

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <LinearProgress
          variant="determinate"
          value={percentage}
          color={color}
          sx={{ flexGrow: 1, mr: 1 }}
        />
        <Typography variant="body2" color="text.secondary">
          {percentage.toFixed(0)}%
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Score Global */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Score Global de Performance
            </Typography>
            <Rating
              value={report.overallScore}
              precision={0.5}
              readOnly
              size="large"
            />
            <Typography variant="h3" sx={{ my: 2 }}>
              {report.overallScore.toFixed(2)}/5
            </Typography>
            <Chip
              label={report.overallScore >= 4 ? 'Excellent' : report.overallScore >= 3 ? 'Bon' : 'À améliorer'}
              color={report.overallScore >= 4 ? 'success' : report.overallScore >= 3 ? 'primary' : 'warning'}
            />
          </Paper>
        </Grid>

        {/* Métriques Détaillées */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Évolution des Performances
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="startDate"
                  tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                />
                <YAxis />
                <ChartTooltip
                  formatter={(value: number) => [value.toFixed(2), 'Score']}
                  labelFormatter={(date) => format(new Date(date), 'dd MMMM yyyy', { locale: fr })}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2196f3"
                  name="Performance"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#4caf50"
                  strokeDasharray="5 5"
                  name="Objectif"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Indicateurs Clés */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Indicateurs Clés
            </Typography>
            {Object.entries(report.aggregated).map(([type, data]: [string, any]) => (
              <Box key={type} sx={{ mb: 2 }}>
                <Typography variant="subtitle2">{type}</Typography>
                {renderPerformanceIndicator(data.average, data.target)}
                <Typography variant="caption" color="text.secondary">
                  Min: {data.min.toFixed(2)} | Max: {data.max.toFixed(2)}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Recommandations */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recommandations
            </Typography>
            <Timeline>
              {report.recommendations.map((rec: string, index: number) => (
                <TimelineItem key={index}>
                  <TimelineSeparator>
                    <TimelineDot color="primary">
                      <InfoIcon />
                    </TimelineDot>
                    {index < report.recommendations.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography>{rec}</Typography>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Paper>
        </Grid>

        {/* Tendances */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {Object.entries(report.trends).map(([type, data]: [string, any]) => (
              <Grid item xs={12} sm={6} md={4} key={type}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {type}
                    </Typography>
                    <Box display="flex" alignItems="center">
                      {data.trend === 'up' ? (
                        <TrendingUp color="success" />
                      ) : (
                        <TrendingDown color="error" />
                      )}
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        {data.change.toFixed(1)}%
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
