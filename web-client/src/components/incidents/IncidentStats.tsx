import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  DialogTitle,
  DialogContent,
  Grid,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { Incident, IncidentSeverity, IncidentStatus } from '../../types/incident';

interface IncidentStatsProps {
  incidents: Incident[];
  onClose?: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF0000'];

const IncidentStats: React.FC<IncidentStatsProps> = ({ incidents, onClose }) => {
  // Préparation des données pour les graphiques
  const getIncidentsByMonth = () => {
    const monthlyData: { [key: string]: number } = {};
    incidents.forEach((incident) => {
      const date = new Date(incident.reportedAt);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
    });

    return Object.entries(monthlyData)
      .map(([month, count]) => ({
        month,
        count,
      }))
      .sort((a, b) => {
        const [aMonth, aYear] = a.month.split('/').map(Number);
        const [bMonth, bYear] = b.month.split('/').map(Number);
        return aYear === bYear ? aMonth - bMonth : aYear - bYear;
      });
  };

  const getIncidentsBySeverity = () => {
    const severityData: { [key: string]: number } = {};
    incidents.forEach((incident) => {
      severityData[incident.severity] = (severityData[incident.severity] || 0) + 1;
    });

    return Object.entries(severityData).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const getIncidentsByStatus = () => {
    const statusData: { [key: string]: number } = {};
    incidents.forEach((incident) => {
      statusData[incident.status] = (statusData[incident.status] || 0) + 1;
    });

    return Object.entries(statusData).map(([status, count]) => ({
      status,
      count,
    }));
  };

  const getAverageResolutionTime = () => {
    const resolvedIncidents = incidents.filter(
      (incident) => incident.status === IncidentStatus.RESOLVED,
    );
    if (resolvedIncidents.length === 0) return 0;

    const totalTime = resolvedIncidents.reduce((sum, incident) => {
      const reportDate = new Date(incident.reportedAt);
      const resolveDate = new Date(incident.resolution?.date || '');
      return sum + (resolveDate.getTime() - reportDate.getTime());
    }, 0);

    return Math.round(totalTime / resolvedIncidents.length / (1000 * 60 * 60)); // en heures
  };

  return (
    <>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6">Statistiques des incidents</Typography>
          <Box sx={{ flexGrow: 1 }} />
          {onClose && (
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Incidents par mois"
                avatar={<TimelineIcon />}
              />
              <CardContent>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getIncidentsByMonth()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Incidents"
                        stroke="#8884d8"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Répartition par sévérité"
                avatar={<PieChartIcon />}
              />
              <CardContent>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getIncidentsBySeverity()}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {getIncidentsBySeverity().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Statut des incidents"
                avatar={<TrendingUpIcon />}
              />
              <CardContent>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getIncidentsByStatus()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="count"
                        name="Incidents"
                        fill="#82ca9d"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Métriques clés" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Total des incidents
                    </Typography>
                    <Typography variant="h4">{incidents.length}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Temps moyen de résolution
                    </Typography>
                    <Typography variant="h4">
                      {getAverageResolutionTime()} h
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Incidents critiques
                    </Typography>
                    <Typography variant="h4">
                      {
                        incidents.filter(
                          (i) => i.severity === IncidentSeverity.CRITICAL,
                        ).length
                      }
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Taux de résolution
                    </Typography>
                    <Typography variant="h4">
                      {Math.round(
                        (incidents.filter(
                          (i) => i.status === IncidentStatus.RESOLVED,
                        ).length /
                          incidents.length) *
                          100,
                      )}
                      %
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
    </>
  );
};

export default IncidentStats;
