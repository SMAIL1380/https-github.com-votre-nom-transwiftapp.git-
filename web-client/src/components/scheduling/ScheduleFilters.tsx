import React, { useState } from 'react';
import {
  Box,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Typography,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ScheduleType, SchedulePriority } from '../../types/schedule';
import { useDrivers } from '../../hooks/useDrivers';
import { useVehicles } from '../../hooks/useVehicles';

interface ScheduleFiltersProps {
  initialFilters: any;
  onApply: (filters: any) => void;
  onCancel: () => void;
}

const ScheduleFilters: React.FC<ScheduleFiltersProps> = ({
  initialFilters,
  onApply,
  onCancel,
}) => {
  const [filters, setFilters] = useState(initialFilters);
  const { drivers } = useDrivers();
  const { vehicles } = useVehicles();

  const handleChange = (field: string, value: any) => {
    setFilters((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (field: string, date: Date | null) => {
    setFilters((prev: any) => ({
      ...prev,
      [field]: date,
    }));
  };

  const handleReset = () => {
    setFilters({
      dateRange: {
        start: null,
        end: null,
      },
      types: [],
      priorities: [],
      driverIds: [],
      vehicleIds: [],
      status: [],
      showCompleted: true,
      showCancelled: false,
      minDuration: '',
      maxDuration: '',
      keywords: '',
    });
  };

  return (
    <>
      <DialogTitle>Filtres de planification</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Période
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <DatePicker
                  label="Date de début"
                  value={filters.dateRange?.start || null}
                  onChange={(date) =>
                    handleDateChange('dateRange', {
                      ...filters.dateRange,
                      start: date,
                    })
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label="Date de fin"
                  value={filters.dateRange?.end || null}
                  onChange={(date) =>
                    handleDateChange('dateRange', {
                      ...filters.dateRange,
                      end: date,
                    })
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Autocomplete
              multiple
              options={Object.values(ScheduleType)}
              value={filters.types || []}
              onChange={(event, newValue) => handleChange('types', newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Types" size="small" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    size="small"
                  />
                ))
              }
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Autocomplete
              multiple
              options={Object.values(SchedulePriority)}
              value={filters.priorities || []}
              onChange={(event, newValue) => handleChange('priorities', newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Priorités" size="small" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    size="small"
                  />
                ))
              }
            />
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={drivers}
              getOptionLabel={(option) => option.name}
              value={drivers.filter((d) => filters.driverIds?.includes(d.id)) || []}
              onChange={(event, newValue) =>
                handleChange(
                  'driverIds',
                  newValue.map((d) => d.id)
                )
              }
              renderInput={(params) => (
                <TextField {...params} label="Chauffeurs" size="small" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.name}
                    {...getTagProps({ index })}
                    size="small"
                  />
                ))
              }
            />
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={vehicles}
              getOptionLabel={(option) => option.registrationNumber}
              value={vehicles.filter((v) => filters.vehicleIds?.includes(v.id)) || []}
              onChange={(event, newValue) =>
                handleChange(
                  'vehicleIds',
                  newValue.map((v) => v.id)
                )
              }
              renderInput={(params) => (
                <TextField {...params} label="Véhicules" size="small" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.registrationNumber}
                    {...getTagProps({ index })}
                    size="small"
                  />
                ))
              }
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Durée minimum (heures)"
              type="number"
              size="small"
              value={filters.minDuration || ''}
              onChange={(e) => handleChange('minDuration', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Durée maximum (heures)"
              type="number"
              size="small"
              value={filters.maxDuration || ''}
              onChange={(e) => handleChange('maxDuration', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mots-clés"
              size="small"
              value={filters.keywords || ''}
              onChange={(e) => handleChange('keywords', e.target.value)}
              placeholder="Rechercher dans les titres et descriptions"
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.showCompleted}
                    onChange={(e) =>
                      handleChange('showCompleted', e.target.checked)
                    }
                  />
                }
                label="Afficher les terminés"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.showCancelled}
                    onChange={(e) =>
                      handleChange('showCancelled', e.target.checked)
                    }
                  />
                }
                label="Afficher les annulés"
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset}>Réinitialiser</Button>
        <Button onClick={onCancel}>Annuler</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onApply(filters)}
        >
          Appliquer
        </Button>
      </DialogActions>
    </>
  );
};

export default ScheduleFilters;
