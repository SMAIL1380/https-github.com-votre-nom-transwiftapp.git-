import React from 'react';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Autocomplete,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { MaintenanceType, MaintenancePriority } from '../../../types/maintenance';
import { useVehicles } from '../../../hooks/useVehicles';

interface MaintenanceScheduleFormProps {
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
}

export const MaintenanceScheduleForm: React.FC<MaintenanceScheduleFormProps> = ({
  onSubmit,
  initialData,
}) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {
      vehicleId: '',
      maintenanceType: '',
      priority: MaintenancePriority.MEDIUM,
      scheduledDate: '',
      estimatedDuration: '',
      description: '',
      checklistItems: [],
    },
  });

  const { vehicles, loading } = useVehicles({ internalOnly: true });

  const maintenanceTypes = Object.values(MaintenanceType);
  const priorities = Object.values(MaintenancePriority);

  const commonChecklistItems = {
    [MaintenanceType.ROUTINE]: [
      'Vérification des niveaux',
      'Contrôle des pneus',
      'Contrôle des freins',
      'Vérification de l\'éclairage',
    ],
    [MaintenanceType.TECHNICAL]: [
      'Diagnostic électronique',
      'Test des systèmes de sécurité',
      'Vérification des émissions',
      'Contrôle de la direction',
    ],
    [MaintenanceType.SAFETY]: [
      'Inspection des freins',
      'Contrôle des airbags',
      'Test des ceintures de sécurité',
      'Vérification des systèmes d\'assistance',
    ],
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Controller
            name="vehicleId"
            control={control}
            rules={{ required: 'Véhicule requis' }}
            render={({ field }) => (
              <Autocomplete
                {...field}
                options={vehicles || []}
                getOptionLabel={(option) => 
                  `${option.registrationNumber} - ${option.type.name}`
                }
                loading={loading}
                onChange={(_, value) => field.onChange(value?.id)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Véhicule"
                    error={!!errors.vehicleId}
                    helperText={errors.vehicleId?.message}
                  />
                )}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="maintenanceType"
            control={control}
            rules={{ required: 'Type de maintenance requis' }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.maintenanceType}>
                <InputLabel>Type de Maintenance</InputLabel>
                <Select {...field} label="Type de Maintenance">
                  {maintenanceTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.maintenanceType?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="priority"
            control={control}
            rules={{ required: 'Priorité requise' }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.priority}>
                <InputLabel>Priorité</InputLabel>
                <Select {...field} label="Priorité">
                  {priorities.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.priority?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="scheduledDate"
            control={control}
            rules={{ required: 'Date planifiée requise' }}
            render={({ field }) => (
              <TextField
                {...field}
                type="datetime-local"
                label="Date Planifiée"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.scheduledDate}
                helperText={errors.scheduledDate?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="estimatedDuration"
            control={control}
            rules={{ required: 'Durée estimée requise' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Durée Estimée (heures)"
                type="number"
                fullWidth
                error={!!errors.estimatedDuration}
                helperText={errors.estimatedDuration?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="description"
            control={control}
            rules={{ required: 'Description requise' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                multiline
                rows={4}
                fullWidth
                error={!!errors.description}
                helperText={errors.description?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="checklistItems"
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                multiple
                options={commonChecklistItems[field.value?.maintenanceType] || []}
                freeSolo
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Points de Contrôle"
                    helperText="Ajoutez ou sélectionnez des points de contrôle"
                  />
                )}
                onChange={(_, value) => field.onChange(value)}
              />
            )}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained" color="primary">
          Planifier la Maintenance
        </Button>
      </Box>
    </form>
  );
};
