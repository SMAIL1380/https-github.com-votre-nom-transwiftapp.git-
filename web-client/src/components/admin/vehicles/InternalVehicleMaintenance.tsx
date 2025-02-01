import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Build as BuildIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Print as PrintIcon,
  GetApp as DownloadIcon,
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
} from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MaintenanceStatus } from '../../../types/maintenance';
import { useMaintenanceReports } from '../../../hooks/useMaintenanceReports';
import { MaintenanceScheduleForm } from './MaintenanceScheduleForm';
import { MaintenanceReportDetail } from './MaintenanceReportDetail';
import { exportToPDF } from '../../../utils/pdfExport';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const InternalVehicleMaintenance: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showReportDetail, setShowReportDetail] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const { reports, statistics, loading, error, refetch } = useMaintenanceReports();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleExportPDF = async () => {
    await exportToPDF('maintenance-report', {
      title: 'Rapport de Maintenance des Véhicules Internes',
      data: reports,
      statistics,
    });
  };

  const renderDashboard = () => (
    <Grid container spacing={3}>
      {/* Statistiques Globales */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Vue d'ensemble
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Maintenances planifiées
              </Typography>
              <Typography variant="h4">
                {statistics?.planned || 0}
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                En cours
              </Typography>
              <Typography variant="h4" color="primary">
                {statistics?.inProgress || 0}
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Coût total ce mois
              </Typography>
              <Typography variant="h4" color="secondary">
                {statistics?.monthlyTotalCost?.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Graphique d'évolution */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Évolution des Maintenances
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statistics?.timeline || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) =>
                    format(new Date(date), 'dd MMMM yyyy', { locale: fr })
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Terminées"
                  stroke="#00C49F"
                />
                <Line
                  type="monotone"
                  dataKey="planned"
                  name="Planifiées"
                  stroke="#0088FE"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Distribution des types de maintenance */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Types de Maintenance
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statistics?.maintenanceTypes || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {statistics?.maintenanceTypes?.map((entry, index) => (
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
          </CardContent>
        </Card>
      </Grid>

      {/* Alertes et Notifications */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Alertes Récentes
            </Typography>
            <Timeline>
              {statistics?.recentAlerts?.map((alert, index) => (
                <TimelineItem key={index}>
                  <TimelineSeparator>
                    <TimelineDot color={alert.severity as any}>
                      <WarningIcon />
                    </TimelineDot>
                    {index < statistics.recentAlerts.length - 1 && (
                      <TimelineConnector />
                    )}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="subtitle2">{alert.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {alert.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(alert.date), 'dd/MM/yyyy HH:mm')}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderMaintenanceList = () => (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<BuildIcon />}
          onClick={() => setShowScheduleForm(true)}
          sx={{ mr: 1 }}
        >
          Planifier une Maintenance
        </Button>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handleExportPDF}
        >
          Exporter en PDF
        </Button>
      </Box>

      <Grid container spacing={2}>
        {reports?.map((report) => (
          <Grid item xs={12} key={report.id}>
            <Paper sx={{ p: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle1">
                    {report.vehicle.registrationNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {report.maintenanceType}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Chip
                    label={report.status}
                    color={
                      report.status === MaintenanceStatus.COMPLETED
                        ? 'success'
                        : report.status === MaintenanceStatus.IN_PROGRESS
                        ? 'primary'
                        : 'default'
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2">
                    {format(new Date(report.scheduledDate), 'dd/MM/yyyy')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setSelectedReport(report);
                      setShowReportDetail(true);
                    }}
                  >
                    Détails
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Maintenance des Véhicules Internes
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Tableau de Bord" />
        <Tab label="Liste des Maintenances" />
      </Tabs>

      {loading ? (
        <Typography>Chargement...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box>
          {tabValue === 0 && renderDashboard()}
          {tabValue === 1 && renderMaintenanceList()}
        </Box>
      )}

      {/* Formulaire de planification */}
      <Dialog
        open={showScheduleForm}
        onClose={() => setShowScheduleForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Planifier une Maintenance</DialogTitle>
        <DialogContent>
          <MaintenanceScheduleForm
            onSubmit={async (data) => {
              // Logique de soumission
              await refetch();
              setShowScheduleForm(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Détails du rapport */}
      <Dialog
        open={showReportDetail}
        onClose={() => setShowReportDetail(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Détails de la Maintenance</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <MaintenanceReportDetail
              report={selectedReport}
              onUpdate={async () => {
                await refetch();
                setShowReportDetail(false);
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReportDetail(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
