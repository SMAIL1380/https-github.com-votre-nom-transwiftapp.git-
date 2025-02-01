import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Button,
  Dialog,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useDrivers } from '../../hooks/useDrivers';
import DriverForm from './DriverForm';
import DriverDetails from './DriverDetails';
import DriverPerformance from './DriverPerformance';
import { Driver, DriverType } from '../../types/driver';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`driver-tabpanel-${index}`}
      aria-labelledby={`driver-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const DriverManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'details' | 'performance'>(
    'list',
  );

  const {
    internalDrivers,
    externalDrivers,
    loading,
    error,
    fetchDrivers,
    createDriver,
    updateDriver,
    deleteDriver,
  } = useDrivers();

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'Nom', width: 150 },
    { field: 'phone', headerName: 'Téléphone', width: 130 },
    { field: 'email', headerName: 'Email', width: 200 },
    {
      field: 'status',
      headerName: 'Statut',
      width: 130,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            color: params.value === 'ACTIVE' ? 'success.main' : 'error.main',
          }}
        >
          {params.value}
        </Typography>
      ),
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
    setSelectedDriver(null);
    setOpenDialog(true);
  };

  const handleEdit = (driver: Driver) => {
    setSelectedDriver(driver);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce chauffeur ?')) {
      await deleteDriver(id);
      fetchDrivers();
    }
  };

  const handleSave = async (driver: Driver) => {
    if (selectedDriver) {
      await updateDriver(driver);
    } else {
      await createDriver(driver);
    }
    setOpenDialog(false);
    fetchDrivers();
  };

  const handleViewDetails = (driver: Driver) => {
    setSelectedDriver(driver);
    setViewMode('details');
  };

  const handleViewPerformance = (driver: Driver) => {
    setSelectedDriver(driver);
    setViewMode('performance');
  };

  if (error) {
    return (
      <Typography color="error">
        Erreur lors du chargement des chauffeurs: {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="driver tabs"
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : false}
          >
            <Tab label="Chauffeurs Internes" />
            <Tab label="Chauffeurs Externes" />
          </Tabs>
        </Box>

        <Box sx={{ p: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{ mb: 2 }}
          >
            Ajouter un chauffeur
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchDrivers}
            sx={{ mb: 2, ml: 2 }}
          >
            Actualiser
          </Button>
        </Box>

        {viewMode === 'list' && (
          <>
            <TabPanel value={tabValue} index={0}>
              <DataGrid
                rows={internalDrivers}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                checkboxSelection
                disableSelectionOnClick
                loading={loading}
                autoHeight
                onRowClick={(params) => handleViewDetails(params.row)}
              />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <DataGrid
                rows={externalDrivers}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                checkboxSelection
                disableSelectionOnClick
                loading={loading}
                autoHeight
                onRowClick={(params) => handleViewDetails(params.row)}
              />
            </TabPanel>
          </>
        )}

        {viewMode === 'details' && selectedDriver && (
          <DriverDetails
            driver={selectedDriver}
            onBack={() => setViewMode('list')}
            onEdit={handleEdit}
            onViewPerformance={() => handleViewPerformance(selectedDriver)}
          />
        )}

        {viewMode === 'performance' && selectedDriver && (
          <DriverPerformance
            driver={selectedDriver}
            onBack={() => setViewMode('details')}
          />
        )}

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DriverForm
            driver={selectedDriver}
            onSave={handleSave}
            onCancel={() => setOpenDialog(false)}
            type={tabValue === 0 ? DriverType.INTERNAL : DriverType.EXTERNAL}
          />
        </Dialog>
      </Paper>
    </Box>
  );
};

export default DriverManagement;
