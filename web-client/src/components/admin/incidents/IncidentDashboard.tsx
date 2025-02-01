import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface Incident {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  impact: {
    estimatedDelay: number;
    affectedOrders: string[];
    customerNotified: boolean;
    financialImpact?: number;
  };
  timeline: {
    reported: Date;
    acknowledged?: Date;
    resolutionStarted?: Date;
    resolved?: Date;
    closed?: Date;
  };
  resolution: {
    steps: {
      action: string;
      status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
      timestamp?: Date;
    }[];
  };
}

const severityColors = {
  LOW: '#4caf50',
  MEDIUM: '#ff9800',
  HIGH: '#f44336',
  CRITICAL: '#d32f2f',
};

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

export const IncidentDashboard: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [statisticsData, setStatisticsData] = useState<any>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    fetchIncidents();
    fetchStatistics();
    const interval = setInterval(fetchIncidents, 30000); // Rafraîchir toutes les 30 secondes
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchIncidents = async () => {
    try {
      const response = await fetch(`/api/incidents?timeRange=${timeRange}`);
      const data = await response.json();
      setIncidents(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des incidents:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`/api/incidents/statistics?timeRange=${timeRange}`);
      const data = await response.json();
      setStatisticsData(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    }
  };

  const renderSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <ErrorIcon sx={{ color: severityColors.CRITICAL }} />;
      case 'HIGH':
        return <WarningIcon sx={{ color: severityColors.HIGH }} />;
      case 'MEDIUM':
        return <WarningIcon sx={{ color: severityColors.MEDIUM }} />;
      case 'LOW':
        return <CheckCircleIcon sx={{ color: severityColors.LOW }} />;
      default:
        return null;
    }
  };

  const renderStatistics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Incidents par Type
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statisticsData?.byType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2196f3" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Distribution par Sévérité
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statisticsData?.bySeverity}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {statisticsData?.bySeverity.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={severityColors[entry.name as keyof typeof severityColors]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderIncidentDetails = (incident: Incident) => (
    <Dialog
      open={Boolean(selectedIncident)}
      onClose={() => setSelectedIncident(null)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            Incident #{incident.id} - {incident.type}
          </Typography>
          <Chip
            label={incident.severity}
            color={
              incident.severity === 'CRITICAL'
                ? 'error'
                : incident.severity === 'HIGH'
                ? 'warning'
                : 'default'
            }
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {incident.description}
            </Typography>

            <Typography variant="subtitle1" gutterBottom>
              Impact
            </Typography>
            <Box mb={2}>
              <Typography variant="body2">
                Retard estimé: {incident.impact.estimatedDelay} minutes
              </Typography>
              <Typography variant="body2">
                Commandes affectées: {incident.impact.affectedOrders.length}
              </Typography>
              {incident.impact.financialImpact && (
                <Typography variant="body2">
                  Impact financier: {incident.impact.financialImpact}€
                </Typography>
              )}
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              Chronologie
            </Typography>
            <Timeline>
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="body2">
                    Signalé: {format(new Date(incident.timeline.reported), 'PPpp', { locale: fr })}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
              {incident.timeline.acknowledged && (
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="body2">
                      Pris en charge: {format(new Date(incident.timeline.acknowledged), 'PPpp', { locale: fr })}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              )}
              {incident.timeline.resolved && (
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot color="success" />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="body2">
                      Résolu: {format(new Date(incident.timeline.resolved), 'PPpp', { locale: fr })}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              )}
            </Timeline>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Étapes de Résolution
            </Typography>
            <Box mb={3}>
              {incident.resolution.steps.map((step, index) => (
                <Box key={index} mb={1}>
                  <Typography variant="body2" display="flex" alignItems="center">
                    <Chip
                      size="small"
                      label={step.status}
                      color={
                        step.status === 'COMPLETED'
                          ? 'success'
                          : step.status === 'IN_PROGRESS'
                          ? 'warning'
                          : 'default'
                      }
                      sx={{ mr: 1 }}
                    />
                    {step.action}
                  </Typography>
                  {step.timestamp && (
                    <Typography variant="caption" color="textSecondary">
                      {format(new Date(step.timestamp), 'PPpp', { locale: fr })}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              Localisation
            </Typography>
            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '200px' }}
                center={{
                  lat: incident.location.latitude,
                  lng: incident.location.longitude,
                }}
                zoom={14}
              >
                <Marker
                  position={{
                    lat: incident.location.latitude,
                    lng: incident.location.longitude,
                  }}
                />
              </GoogleMap>
            </LoadScript>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Tableau de Bord des Incidents</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<MapIcon />}
            onClick={() => setShowMap(!showMap)}
            sx={{ mr: 1 }}
          >
            {showMap ? 'Masquer la carte' : 'Afficher la carte'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<TimelineIcon />}
            onClick={() => setTimeRange(timeRange === '24h' ? '7d' : '24h')}
            sx={{ mr: 1 }}
          >
            {timeRange === '24h' ? '7 derniers jours' : '24 dernières heures'}
          </Button>
          <IconButton onClick={fetchIncidents}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {showMap && (
        <Box mb={3}>
          <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={{ lat: 48.8566, lng: 2.3522 }}
              zoom={11}
            >
              {incidents.map((incident) => (
                <Marker
                  key={incident.id}
                  position={{
                    lat: incident.location.latitude,
                    lng: incident.location.longitude,
                  }}
                  onClick={() => setSelectedIncident(incident)}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: severityColors[incident.severity],
                    fillOpacity: 1,
                    strokeWeight: 1,
                    scale: 8,
                  }}
                />
              ))}
            </GoogleMap>
          </LoadScript>
        </Box>
      )}

      {statisticsData && renderStatistics()}

      <Box mt={3}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sévérité</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Impact</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incidents.map((incident) => (
                <TableRow
                  key={incident.id}
                  sx={{
                    '&:hover': { backgroundColor: 'action.hover' },
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedIncident(incident)}
                >
                  <TableCell>
                    {renderSeverityIcon(incident.severity)}
                    {incident.severity}
                  </TableCell>
                  <TableCell>{incident.type}</TableCell>
                  <TableCell>{incident.description}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {incident.impact.affectedOrders.length} commandes
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {incident.impact.estimatedDelay} min de retard
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={incident.status}
                      color={
                        incident.status === 'RESOLVED'
                          ? 'success'
                          : incident.status === 'IN_PROGRESS'
                          ? 'warning'
                          : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIncident(incident);
                      }}
                    >
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {selectedIncident && renderIncidentDetails(selectedIncident)}
    </Box>
  );
};
