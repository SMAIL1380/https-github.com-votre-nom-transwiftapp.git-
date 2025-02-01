import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Dialog,
  IconButton,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useIncidents } from '../../hooks/useIncidents';
import IncidentForm from './IncidentForm';
import IncidentDetails from './IncidentDetails';
import IncidentStats from './IncidentStats';
import IncidentFilters from './IncidentFilters';
import { Incident, IncidentStatus, IncidentSeverity } from '../../types/incident';

const IncidentManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openDialog, setOpenDialog] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [openStats, setOpenStats] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
  const [filters, setFilters] = useState({});

  const {
    incidents,
    loading,
    error,
    fetchIncidents,
    createIncident,
    updateIncident,
    deleteIncident,
  } = useIncidents();

  useEffect(() => {
    fetchIncidents(filters);
  }, [fetchIncidents, filters]);

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

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    {
      field: 'severity',
      headerName: 'Sévérité',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getSeverityColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Statut',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    { field: 'title', headerName: 'Titre', width: 250 },
    {
      field: 'driver',
      headerName: 'Chauffeur',
      width: 200,
      valueGetter: (params) => params.row.driver?.name || 'Non assigné',
    },
    {
      field: 'vehicle',
      headerName: 'Véhicule',
      width: 150,
      valueGetter: (params) =>
        params.row.vehicle?.registrationNumber || 'Non assigné',
    },
    {
      field: 'reportedAt',
      headerName: 'Date de signalement',
      width: 180,
      valueGetter: (params) =>
        new Date(params.row.reportedAt).toLocaleString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleEdit(params.row)}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row.id)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleCreate = () => {
    setSelectedIncident(null);
    setOpenDialog(true);
  };

  const handleEdit = (incident: Incident) => {
    setSelectedIncident(incident);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet incident ?')) {
      await deleteIncident(id);
      fetchIncidents(filters);
    }
  };

  const handleSave = async (incident: Incident) => {
    if (selectedIncident) {
      await updateIncident(incident);
    } else {
      await createIncident(incident);
    }
    setOpenDialog(false);
    fetchIncidents(filters);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setOpenFilters(false);
  };

  const getIncidentSummary = () => {
    const summary = {
      total: incidents.length,
      bySeverity: incidents.reduce(
        (acc, incident) => {
          acc[incident.severity] = (acc[incident.severity] || 0) + 1;
          return acc;
        },
        {} as Record<IncidentSeverity, number>,
      ),
      byStatus: incidents.reduce(
        (acc, incident) => {
          acc[incident.status] = (acc[incident.status] || 0) + 1;
          return acc;
        },
        {} as Record<IncidentStatus, number>,
      ),
    };

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h4">{summary.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        {Object.entries(summary.bySeverity).map(([severity, count]) => (
          <Grid item xs={6} sm={3} key={severity}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  <Chip
                    label={severity}
                    color={getSeverityColor(severity as IncidentSeverity)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                </Typography>
                <Typography variant="h4">{count}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  if (error) {
    return (
      <Typography color="error">
        Erreur lors du chargement des incidents: {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Signaler un incident
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchIncidents(filters)}
          >
            Actualiser
          </Button>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setOpenFilters(true)}
          >
            Filtres
          </Button>
          <Button
            variant="outlined"
            startIcon={<AssessmentIcon />}
            onClick={() => setOpenStats(true)}
          >
            Statistiques
          </Button>
        </Box>

        {getIncidentSummary()}

        {viewMode === 'list' && (
          <DataGrid
            rows={incidents}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            checkboxSelection
            disableSelectionOnClick
            loading={loading}
            autoHeight
            onRowClick={(params) => {
              setSelectedIncident(params.row);
              setViewMode('details');
            }}
          />
        )}

        {viewMode === 'details' && selectedIncident && (
          <IncidentDetails
            incident={selectedIncident}
            onBack={() => setViewMode('list')}
            onEdit={handleEdit}
          />
        )}

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <IncidentForm
            incident={selectedIncident}
            onSave={handleSave}
            onCancel={() => setOpenDialog(false)}
          />
        </Dialog>

        <Dialog
          open={openFilters}
          onClose={() => setOpenFilters(false)}
          maxWidth="sm"
          fullWidth
        >
          <IncidentFilters
            initialFilters={filters}
            onApply={handleFilterChange}
            onCancel={() => setOpenFilters(false)}
          />
        </Dialog>

        <Dialog
          open={openStats}
          onClose={() => setOpenStats(false)}
          maxWidth="lg"
          fullWidth
        >
          <IncidentStats incidents={incidents} />
        </Dialog>
      </Paper>
    </Box>
  );
};

export default IncidentManagement;
