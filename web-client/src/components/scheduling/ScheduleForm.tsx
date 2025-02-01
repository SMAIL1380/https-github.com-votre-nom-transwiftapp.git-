import React from 'react';
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
  Typography,
  Autocomplete,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Schedule, ScheduleType, SchedulePriority } from '../../types/schedule';
import { useDrivers } from '../../hooks/useDrivers';
import { useVehicles } from '../../hooks/useVehicles';
import { useDeliveries } from '../../hooks/useDeliveries';

interface ScheduleFormProps {
  schedule: Schedule | null;
  onSave: (schedule: Schedule) => void;
  onCancel: () => void;
}

const validationSchema = Yup.object({
  title: Yup.string().required('Le titre est requis'),
  type: Yup.string().required('Le type est requis'),
  priority: Yup.string().required('La priorité est requise'),
  startDate: Yup.date().required('La date de début est requise'),
  endDate: Yup.date()
    .required('La date de fin est requise')
    .min(Yup.ref('startDate'), 'La date de fin doit être après la date de début'),
  driverId: Yup.string().required('Le chauffeur est requis'),
  vehicleId: Yup.string().required('Le véhicule est requis'),
  deliveryIds: Yup.array().min(1, 'Au moins une livraison est requise'),
});

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  schedule,
  onSave,
  onCancel,
}) => {
  const { drivers } = useDrivers();
  const { vehicles } = useVehicles();
  const { deliveries } = useDeliveries();

  const formik = useFormik({
    initialValues: {
      title: schedule?.title || '',
      type: schedule?.type || ScheduleType.DELIVERY,
      priority: schedule?.priority || SchedulePriority.NORMAL,
      startDate: schedule?.startDate || new Date(),
      endDate: schedule?.endDate || new Date(),
      driverId: schedule?.driverId || '',
      vehicleId: schedule?.vehicleId || '',
      deliveryIds: schedule?.deliveryIds || [],
      notes: schedule?.notes || '',
      color: schedule?.color || '#1976d2',
    },
    validationSchema,
    onSubmit: (values) => {
      onSave({
        id: schedule?.id,
        ...values,
      } as Schedule);
    },
  });

  const getAvailableVehicles = () => {
    if (!formik.values.driverId) return vehicles;
    const driver = drivers.find(d => d.id === formik.values.driverId);
    if (!driver) return vehicles;
    return vehicles.filter(v => v.type === driver.vehicleType);
  };

  return (
    <>
      <DialogTitle>
        {schedule ? 'Modifier la planification' : 'Nouvelle planification'}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="title"
                label="Titre"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  error={formik.touched.type && Boolean(formik.errors.type)}
                >
                  {Object.values(ScheduleType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priorité</InputLabel>
                <Select
                  name="priority"
                  value={formik.values.priority}
                  onChange={formik.handleChange}
                  error={formik.touched.priority && Boolean(formik.errors.priority)}
                >
                  {Object.values(SchedulePriority).map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="Date de début"
                value={formik.values.startDate}
                onChange={(date) => formik.setFieldValue('startDate', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: formik.touched.startDate && Boolean(formik.errors.startDate),
                    helperText: formik.touched.startDate && formik.errors.startDate,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="Date de fin"
                value={formik.values.endDate}
                onChange={(date) => formik.setFieldValue('endDate', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: formik.touched.endDate && Boolean(formik.errors.endDate),
                    helperText: formik.touched.endDate && formik.errors.endDate,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={drivers}
                getOptionLabel={(option) => option.name}
                value={drivers.find(d => d.id === formik.values.driverId) || null}
                onChange={(event, newValue) => {
                  formik.setFieldValue('driverId', newValue?.id || '');
                  if (newValue?.vehicleType !== vehicles.find(v => v.id === formik.values.vehicleId)?.type) {
                    formik.setFieldValue('vehicleId', '');
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chauffeur"
                    error={formik.touched.driverId && Boolean(formik.errors.driverId)}
                    helperText={formik.touched.driverId && formik.errors.driverId}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={getAvailableVehicles()}
                getOptionLabel={(option) => option.registrationNumber}
                value={vehicles.find(v => v.id === formik.values.vehicleId) || null}
                onChange={(event, newValue) => {
                  formik.setFieldValue('vehicleId', newValue?.id || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Véhicule"
                    error={formik.touched.vehicleId && Boolean(formik.errors.vehicleId)}
                    helperText={formik.touched.vehicleId && formik.errors.vehicleId}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={deliveries}
                getOptionLabel={(option) => `${option.reference} - ${option.destination}`}
                value={deliveries.filter(d => formik.values.deliveryIds.includes(d.id))}
                onChange={(event, newValue) => {
                  formik.setFieldValue(
                    'deliveryIds',
                    newValue.map((delivery) => delivery.id)
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Livraisons"
                    error={formik.touched.deliveryIds && Boolean(formik.errors.deliveryIds)}
                    helperText={formik.touched.deliveryIds && formik.errors.deliveryIds}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="notes"
                label="Notes"
                multiline
                rows={4}
                value={formik.values.notes}
                onChange={formik.handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Annuler</Button>
          <Button type="submit" variant="contained" color="primary">
            {schedule ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </form>
    </>
  );
};

export default ScheduleForm;
