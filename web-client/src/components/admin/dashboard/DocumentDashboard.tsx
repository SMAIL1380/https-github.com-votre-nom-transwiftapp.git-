import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useDocumentStats } from '../../../hooks/useDocumentStats';
import { DashboardCard } from './DashboardCard';
import { StatsOverview } from './StatsOverview';
import { DocumentTable } from './DocumentTable';
import { useWebSocket } from '../../../hooks/useWebSocket';

export const DocumentDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const { stats, compliance, trends, loading } = useDocumentStats(selectedPeriod);
  const socket = useWebSocket();

  useEffect(() => {
    if (socket) {
      socket.on('document.verified', () => {
        // Rafraîchir les statistiques
      });
      socket.on('document.expired', () => {
        // Rafraîchir les statistiques
      });
    }
    return () => {
      if (socket) {
        socket.off('document.verified');
        socket.off('document.expired');
      }
    };
  }, [socket]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tableau de Bord Documents
      </Typography>

      <Grid container spacing={3}>
        {/* Vue d'ensemble des statistiques */}
        <Grid item xs={12}>
          <StatsOverview stats={stats} />
        </Grid>

        {/* Graphique des tendances */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Tendances de Vérification
            </Typography>
            <ResponsiveContainer>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="verified"
                  stroke="#4caf50"
                  name="Vérifiés"
                />
                <Line
                  type="monotone"
                  dataKey="rejected"
                  stroke="#f44336"
                  name="Rejetés"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Distribution des types de documents */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Types de Documents
            </Typography>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={Object.entries(stats.byType).map(([type, count]) => ({
                    name: type,
                    value: count,
                  }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Taux de conformité par chauffeur */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Conformité des Chauffeurs
            </Typography>
            <ResponsiveContainer>
              <BarChart data={compliance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="driverName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="complianceRate"
                  fill="#2196f3"
                  name="Taux de Conformité"
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Table des documents récents */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Documents Récents
            </Typography>
            <DocumentTable />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
