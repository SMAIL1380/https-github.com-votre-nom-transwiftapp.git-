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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useVehicles } from '../../hooks/useVehicles';
import VehicleForm from './VehicleForm';
import VehicleDetails from './VehicleDetails';
import VehicleMap from './VehicleMap';
import VehicleFilters from './VehicleFilters';
import { Vehicle, VehicleStatus } from '../../types/vehicle';

const VehicleManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openDialog, setOpenDialog] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'details' | 'map'>('list');
  const [filters, setFilters] = useState({});

  const {
    vehicles,
    loading,
    error,
    fetchVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
  } = useVehicles();

  useEffect(() => {
    fetchVehicles(filters);
  }, [fetchVehicles, filters]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'registrationNumber', headerName: 'Immatriculation', width: 150 },
    { field: 'model', headerName: 'Modèle', width: 150 },
    {
      field: 'status',
      headerName: 'Statut',
      width: 130,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            color:
              params.value === VehicleStatus.ACTIVE
                ? 'success.main'
                : params.value === VehicleStatus.MAINTENANCE
                ? 'warning.main'
                : 'error.main',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'currentDriver',
      headerName: 'Chauffeur',
      width: 200,
      valueGetter: (params) => params.row.currentDriver?.name || 'Non assigné',
    },
    {
      field: 'lastMaintenance',
      headerName: 'Dernière maintenance',
      width: 180,
      valueGetter: (params) =>
        params.row.maintenanceHistory?.length > 0
          ? new Date(
              params.row.maintenanceHistory[
                params.row.maintenanceHistory.length - 1
              ].date,
            ).toLocaleDateString()
          : 'Aucune',
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
    setSelectedVehicle(null);
    setOpenDialog(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      await deleteVehicle(id);
      fetchVehicles(filters);
    }
  };

  const handleSave = async (vehicle: Vehicle) => {
    if (selectedVehicle) {
      await updateVehicle(vehicle);
    } else {
      await createVehicle(vehicle);
    }
    setOpenDialog(false);
    fetchVehicles(filters);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setOpenFilters(false);
  };

  const getVehicleStatusSummary = () => {
    const summary = vehicles.reduce(
      (acc, vehicle) => {
        acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
        return acc;
      },
      {} as Record<VehicleStatus, number>,
    );

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Object.entries(summary).map(([status, count]) => (
          <Grid item xs={12} sm={4} key={status}>
            <Card>
              <CardContent>
                <Typography variant="h6">{status}</Typography>
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
        Erreur lors du chargement des véhicules: {error}
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
            Ajouter un véhicule
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchVehicles(filters)}
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
            startIcon={<MapIcon />}
            onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
          >
            {viewMode === 'map' ? 'Liste' : 'Carte'}
          </Button>
        </Box>

        {getVehicleStatusSummary()}

        {viewMode === 'list' && (
          <DataGrid
            rows={vehicles}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            checkboxSelection
            disableSelectionOnClick
            loading={loading}
            autoHeight
            onRowClick={(params) => {
              setSelectedVehicle(params.row);
              setViewMode('details');
            }}
          />
        )}

        {viewMode === 'details' && selectedVehicle && (
          <VehicleDetails
            vehicle={selectedVehicle}
            onBack={() => setViewMode('list')}
            onEdit={handleEdit}
          />
        )}

        {viewMode === 'map' && (
          <VehicleMap
            vehicles={vehicles}
            onVehicleSelect={(vehicle) => {
              setSelectedVehicle(vehicle);
              setViewMode('details');
            }}
          />
        )}

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <VehicleForm
            vehicle={selectedVehicle}
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
          <VehicleFilters
            initialFilters={filters}
            onApply={handleFilterChange}
            onCancel={() => setOpenFilters(false)}
          />
        </Dialog>
      </Paper>
    </Box>
  );
};

export default VehicleManagement;
