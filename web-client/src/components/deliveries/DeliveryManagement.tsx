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
  Map as MapIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useDeliveries } from '../../hooks/useDeliveries';
import DeliveryForm from './DeliveryForm';
import DeliveryDetails from './DeliveryDetails';
import DeliveryMap from './DeliveryMap';
import DeliveryFilters from './DeliveryFilters';
import { Delivery, DeliveryStatus } from '../../types/delivery';

const DeliveryManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openDialog, setOpenDialog] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'details' | 'map'>('list');
  const [filters, setFilters] = useState({});

  const {
    deliveries,
    loading,
    error,
    fetchDeliveries,
    createDelivery,
    updateDelivery,
    deleteDelivery,
  } = useDeliveries();

  useEffect(() => {
    fetchDeliveries(filters);
  }, [fetchDeliveries, filters]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'trackingNumber', headerName: 'N° de suivi', width: 150 },
    {
      field: 'status',
      headerName: 'Statut',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === DeliveryStatus.COMPLETED
              ? 'success'
              : params.value === DeliveryStatus.IN_PROGRESS
              ? 'primary'
              : params.value === DeliveryStatus.PENDING
              ? 'warning'
              : 'error'
          }
          size="small"
        />
      ),
    },
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
      field: 'pickupAddress',
      headerName: 'Adresse de ramassage',
      width: 250,
    },
    {
      field: 'deliveryAddress',
      headerName: 'Adresse de livraison',
      width: 250,
    },
    {
      field: 'scheduledDate',
      headerName: 'Date prévue',
      width: 180,
      valueGetter: (params) =>
        new Date(params.row.scheduledDate).toLocaleDateString(),
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
    setSelectedDelivery(null);
    setOpenDialog(true);
  };

  const handleEdit = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette livraison ?')) {
      await deleteDelivery(id);
      fetchDeliveries(filters);
    }
  };

  const handleSave = async (delivery: Delivery) => {
    if (selectedDelivery) {
      await updateDelivery(delivery);
    } else {
      await createDelivery(delivery);
    }
    setOpenDialog(false);
    fetchDeliveries(filters);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setOpenFilters(false);
  };

  const getDeliveryStatusSummary = () => {
    const summary = deliveries.reduce(
      (acc, delivery) => {
        acc[delivery.status] = (acc[delivery.status] || 0) + 1;
        return acc;
      },
      {} as Record<DeliveryStatus, number>,
    );

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Object.entries(summary).map(([status, count]) => (
          <Grid item xs={12} sm={3} key={status}>
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
        Erreur lors du chargement des livraisons: {error}
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
            Nouvelle livraison
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchDeliveries(filters)}
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

        {getDeliveryStatusSummary()}

        {viewMode === 'list' && (
          <DataGrid
            rows={deliveries}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            checkboxSelection
            disableSelectionOnClick
            loading={loading}
            autoHeight
            onRowClick={(params) => {
              setSelectedDelivery(params.row);
              setViewMode('details');
            }}
          />
        )}

        {viewMode === 'details' && selectedDelivery && (
          <DeliveryDetails
            delivery={selectedDelivery}
            onBack={() => setViewMode('list')}
            onEdit={handleEdit}
          />
        )}

        {viewMode === 'map' && (
          <DeliveryMap
            deliveries={deliveries}
            onDeliverySelect={(delivery) => {
              setSelectedDelivery(delivery);
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
          <DeliveryForm
            delivery={selectedDelivery}
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
          <DeliveryFilters
            initialFilters={filters}
            onApply={handleFilterChange}
            onCancel={() => setOpenFilters(false)}
          />
        </Dialog>
      </Paper>
    </Box>
  );
};

export default DeliveryManagement;
