import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Chip,
  IconButton,
  Divider,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  ImageList,
  ImageListItem,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  DirectionsCar as VehicleIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { Incident, IncidentStatus, IncidentSeverity } from '../../types/incident';

interface IncidentDetailsProps {
  incident: Incident;
  onBack: () => void;
  onEdit: (incident: Incident) => void;
}

const IncidentDetails: React.FC<IncidentDetailsProps> = ({
  incident,
  onBack,
  onEdit,
}) => {
  const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case IncidentSeverity.CRITICAL:
        return 'error';
      case IncidentSeverity.HIGH:
        return 'warning';
      case IncidentSeverity.MEDIUM:
        return 'info';
      case IncidentSeverity.LOW:
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case IncidentStatus.OPEN:
        return 'error';
      case IncidentStatus.IN_PROGRESS:
        return 'warning';
      case IncidentStatus.RESOLVED:
        return 'success';
      case IncidentStatus.CLOSED:
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={onBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">Détails de l'incident</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => onEdit(incident)}
        >
          Modifier
        </Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title={incident.title}
              subheader={
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Chip
                    label={incident.severity}
                    color={getSeverityColor(incident.severity)}
                  />
                  <Chip
                    label={incident.status}
                    color={getStatusColor(incident.status)}
                  />
                </Box>
              }
            />
            <CardContent>
              <Typography variant="body1" paragraph>
                {incident.description}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {incident.location}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Signalé le {new Date(incident.reportedAt).toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Assignation" />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Chauffeur
                  </Typography>
                  <Typography variant="body1">
                    {incident.driver?.name || 'Non assigné'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <VehicleIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Véhicule
                  </Typography>
                  <Typography variant="body1">
                    {incident.vehicle?.registrationNumber || 'Non assigné'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {incident.evidence && incident.evidence.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Photos / Documents" />
              <CardContent>
                <ImageList sx={{ width: '100%' }} cols={3} rowHeight={200}>
                  {incident.evidence.map((image, index) => (
                    <ImageListItem key={index}>
                      <img src={image} alt={`Evidence ${index + 1}`} />
                    </ImageListItem>
                  ))}
                </ImageList>
              </CardContent>
            </Card>
          </Grid>
        )}

        {incident.status === IncidentStatus.RESOLVED && (
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="Résolution"
                avatar={
                  <TimelineDot color="success">
                    <CheckIcon />
                  </TimelineDot>
                }
              />
              <CardContent>
                <Typography variant="body1" paragraph>
                  {incident.resolution?.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ScheduleIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Résolu le{' '}
                    {incident.resolution?.date &&
                      new Date(incident.resolution.date).toLocaleString()}
                  </Typography>
                </Box>
                {incident.resolution?.resolvedBy && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <PersonIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Résolu par {incident.resolution.resolvedBy}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {incident.notes && (
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Notes additionnelles" />
              <CardContent>
                <Typography variant="body1">{incident.notes}</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default IncidentDetails;
