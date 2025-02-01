import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { MaintenanceRecord, MaintenanceType } from '../../types/vehicle';
import { useMaintenanceRecords } from '../../hooks/useMaintenanceRecords';

interface MaintenanceHistoryProps {
  maintenanceHistory: MaintenanceRecord[];
  vehicleId: string;
}

const MaintenanceHistory: React.FC<MaintenanceHistoryProps> = ({
  maintenanceHistory,
  vehicleId,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(
    null,
  );

  const {
    createMaintenanceRecord,
    updateMaintenanceRecord,
    deleteMaintenanceRecord,
  } = useMaintenanceRecords(vehicleId);

  const handleAdd = () => {
    setSelectedRecord(null);
    setOpenDialog(true);
  };

  const handleEdit = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setOpenDialog(true);
  };

  const handleDelete = async (recordId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) {
      await deleteMaintenanceRecord(recordId);
    }
  };

  const handleSave = async (record: MaintenanceRecord) => {
    if (selectedRecord) {
      await updateMaintenanceRecord(record);
    } else {
      await createMaintenanceRecord(record);
    }
    setOpenDialog(false);
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Ajouter une maintenance
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Coût</TableCell>
              <TableCell>Kilométrage</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {maintenanceHistory.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  {new Date(record.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{record.type}</TableCell>
                <TableCell>{record.description}</TableCell>
                <TableCell>{record.cost} €</TableCell>
                <TableCell>{record.mileage} km</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(record)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(record.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedRecord ? 'Modifier la maintenance' : 'Ajouter une maintenance'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={selectedRecord?.type || ''}
                onChange={(e) =>
                  setSelectedRecord((prev) => ({
                    ...prev,
                    type: e.target.value as MaintenanceType,
                  }))
                }
              >
                {Object.values(MaintenanceType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={selectedRecord?.description || ''}
              onChange={(e) =>
                setSelectedRecord((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Coût"
              type="number"
              value={selectedRecord?.cost || ''}
              onChange={(e) =>
                setSelectedRecord((prev) => ({
                  ...prev,
                  cost: parseFloat(e.target.value),
                }))
              }
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Kilométrage"
              type="number"
              value={selectedRecord?.mileage || ''}
              onChange={(e) =>
                setSelectedRecord((prev) => ({
                  ...prev,
                  mileage: parseInt(e.target.value),
                }))
              }
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Date"
              type="date"
              value={
                selectedRecord?.date
                  ? new Date(selectedRecord.date).toISOString().split('T')[0]
                  : ''
              }
              onChange={(e) =>
                setSelectedRecord((prev) => ({
                  ...prev,
                  date: new Date(e.target.value),
                }))
              }
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button
            onClick={() => handleSave(selectedRecord as MaintenanceRecord)}
            variant="contained"
            color="primary"
          >
            {selectedRecord ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaintenanceHistory;
