import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Build as BuildIcon,
  AttachMoney as CostIcon,
  Schedule as ScheduleIcon,
  PhotoCamera as CameraIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MaintenanceStatus } from '../../../types/maintenance';

interface MaintenanceReportDetailProps {
  report: any;
  onUpdate: () => Promise<void>;
}

export const MaintenanceReportDetail: React.FC<MaintenanceReportDetailProps> = ({
  report,
  onUpdate,
}) => {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editedReport, setEditedReport] = useState(report);

  const handleStatusChange = async (newStatus: MaintenanceStatus) => {
    try {
      await fetch(`/api/maintenance-reports/${report.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      await onUpdate();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const handleSaveChanges = async () => {
    try {
      await fetch(`/api/maintenance-reports/${report.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedReport),
      });
      await onUpdate();
      setEditMode(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des modifications:', error);
    }
  };

  const renderStatusChip = (status: MaintenanceStatus) => {
    const statusConfig = {
      [MaintenanceStatus.PENDING]: { color: 'default', label: 'En attente' },
      [MaintenanceStatus.IN_PROGRESS]: { color: 'primary', label: 'En cours' },
      [MaintenanceStatus.COMPLETED]: { color: 'success', label: 'Terminé' },
      [MaintenanceStatus.DELAYED]: { color: 'error', label: 'Retardé' },
      [MaintenanceStatus.CANCELLED]: { color: 'error', label: 'Annulé' },
    };

    const config = statusConfig[status];
    return <Chip label={config.label} color={config.color as any} />;
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* En-tête */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">
                  {report.vehicle.registrationNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {report.maintenanceType}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                {renderStatusChip(report.status)}
                {!editMode && (
                  <Button
                    sx={{ ml: 1 }}
                    variant="outlined"
                    onClick={() => setEditMode(true)}
                  >
                    Modifier
                  </Button>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Informations principales */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Détails de la Maintenance
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <ScheduleIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Date Planifiée"
                  secondary={format(
                    new Date(report.scheduledDate),
                    'dd MMMM yyyy HH:mm',
                    { locale: fr }
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BuildIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Kilométrage"
                  secondary={`${report.kilometersAtMaintenance.toLocaleString()} km`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CostIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Coûts"
                  secondary={
                    <Box>
                      <Typography variant="body2">
                        Main d'œuvre: {report.costs.labor.toLocaleString()}€
                      </Typography>
                      <Typography variant="body2">
                        Pièces: {report.costs.parts.toLocaleString()}€
                      </Typography>
                      <Typography variant="body2">
                        Total: {report.costs.total.toLocaleString()}€
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Checklist */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Points de Contrôle
            </Typography>
            <List>
              {report.checklistResults.map((item: any, index: number) => (
                <React.Fragment key={item.itemId}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemIcon>
                      {item.completed ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <WarningIcon color="warning" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.description}
                      secondary={item.notes}
                    />
                    {item.images?.length > 0 && (
                      <Button
                        startIcon={<CameraIcon />}
                        onClick={() => {
                          setSelectedImage(item.images[0]);
                          setShowImageDialog(true);
                        }}
                      >
                        Photos
                      </Button>
                    )}
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Anomalies */}
        {report.anomalies?.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Anomalies Détectées
              </Typography>
              <List>
                {report.anomalies.map((anomaly: any, index: number) => (
                  <React.Fragment key={index}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemIcon>
                        <WarningIcon
                          color={
                            anomaly.severity === 'CRITICAL' ? 'error' : 'warning'
                          }
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={anomaly.description}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Sévérité: {anomaly.severity}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Action recommandée: {anomaly.recommendedAction}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        )}

        {/* Actions */}
        {editMode ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditedReport(report);
                    setEditMode(false);
                  }}
                >
                  Annuler
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveChanges}
                >
                  Enregistrer
                </Button>
              </Box>
            </Paper>
          </Grid>
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                {report.status === MaintenanceStatus.PENDING && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      handleStatusChange(MaintenanceStatus.IN_PROGRESS)
                    }
                  >
                    Démarrer
                  </Button>
                )}
                {report.status === MaintenanceStatus.IN_PROGRESS && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleStatusChange(MaintenanceStatus.COMPLETED)}
                  >
                    Terminer
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Dialog d'affichage des images */}
      <Dialog
        open={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Photo</DialogTitle>
        <DialogContent>
          <img
            src={selectedImage}
            alt="Maintenance"
            style={{ width: '100%', height: 'auto' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImageDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
