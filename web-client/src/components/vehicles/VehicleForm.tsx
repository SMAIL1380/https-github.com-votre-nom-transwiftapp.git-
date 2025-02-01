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
  FormHelperText,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Vehicle, VehicleStatus, FuelType } from '../../types/vehicle';

interface VehicleFormProps {
  vehicle: Vehicle | null;
  onSave: (vehicle: Vehicle) => void;
  onCancel: () => void;
}

const validationSchema = Yup.object({
  registrationNumber: Yup.string().required('L\'immatriculation est requise'),
  model: Yup.string().required('Le modèle est requis'),
  brand: Yup.string().required('La marque est requise'),
  year: Yup.number()
    .required('L\'année est requise')
    .min(1900)
    .max(new Date().getFullYear() + 1),
  status: Yup.string().required('Le statut est requis'),
  fuelType: Yup.string().required('Le type de carburant est requis'),
  capacity: Yup.number()
    .required('La capacité est requise')
    .min(0, 'La capacité doit être positive'),
});

const VehicleForm: React.FC<VehicleFormProps> = ({
  vehicle,
  onSave,
  onCancel,
}) => {
  const formik = useFormik({
    initialValues: {
      registrationNumber: vehicle?.registrationNumber || '',
      model: vehicle?.model || '',
      brand: vehicle?.brand || '',
      year: vehicle?.year || new Date().getFullYear(),
      status: vehicle?.status || VehicleStatus.ACTIVE,
      fuelType: vehicle?.fuelType || FuelType.DIESEL,
      capacity: vehicle?.capacity || 0,
      mileage: vehicle?.mileage || 0,
      fuelLevel: vehicle?.fuelLevel || 100,
      specifications: vehicle?.specifications || {
        length: 0,
        width: 0,
        height: 0,
        maxWeight: 0,
      },
      tracking: vehicle?.tracking || {
        deviceId: '',
        lastLocation: null,
      },
    },
    validationSchema,
    onSubmit: (values) => {
      onSave({
        id: vehicle?.id,
        ...values,
      } as Vehicle);
    },
  });

  return (
    <>
      <DialogTitle>
        {vehicle ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="registrationNumber"
                label="Immatriculation"
                value={formik.values.registrationNumber}
                onChange={formik.handleChange}
                error={
                  formik.touched.registrationNumber &&
                  Boolean(formik.errors.registrationNumber)
                }
                helperText={
                  formik.touched.registrationNumber &&
                  formik.errors.registrationNumber
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="brand"
                label="Marque"
                value={formik.values.brand}
                onChange={formik.handleChange}
                error={formik.touched.brand && Boolean(formik.errors.brand)}
                helperText={formik.touched.brand && formik.errors.brand}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="model"
                label="Modèle"
                value={formik.values.model}
                onChange={formik.handleChange}
                error={formik.touched.model && Boolean(formik.errors.model)}
                helperText={formik.touched.model && formik.errors.model}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="year"
                label="Année"
                type="number"
                value={formik.values.year}
                onChange={formik.handleChange}
                error={formik.touched.year && Boolean(formik.errors.year)}
                helperText={formik.touched.year && formik.errors.year}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  error={formik.touched.status && Boolean(formik.errors.status)}
                >
                  <MenuItem value={VehicleStatus.ACTIVE}>Actif</MenuItem>
                  <MenuItem value={VehicleStatus.MAINTENANCE}>
                    En maintenance
                  </MenuItem>
                  <MenuItem value={VehicleStatus.OUT_OF_SERVICE}>
                    Hors service
                  </MenuItem>
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <FormHelperText error>{formik.errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type de carburant</InputLabel>
                <Select
                  name="fuelType"
                  value={formik.values.fuelType}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.fuelType && Boolean(formik.errors.fuelType)
                  }
                >
                  <MenuItem value={FuelType.DIESEL}>Diesel</MenuItem>
                  <MenuItem value={FuelType.GASOLINE}>Essence</MenuItem>
                  <MenuItem value={FuelType.ELECTRIC}>Électrique</MenuItem>
                  <MenuItem value={FuelType.HYBRID}>Hybride</MenuItem>
                </Select>
                {formik.touched.fuelType && formik.errors.fuelType && (
                  <FormHelperText error>{formik.errors.fuelType}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="capacity"
                label="Capacité (kg)"
                type="number"
                value={formik.values.capacity}
                onChange={formik.handleChange}
                error={formik.touched.capacity && Boolean(formik.errors.capacity)}
                helperText={formik.touched.capacity && formik.errors.capacity}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="mileage"
                label="Kilométrage"
                type="number"
                value={formik.values.mileage}
                onChange={formik.handleChange}
                error={formik.touched.mileage && Boolean(formik.errors.mileage)}
                helperText={formik.touched.mileage && formik.errors.mileage}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Spécifications
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    name="specifications.length"
                    label="Longueur (m)"
                    type="number"
                    value={formik.values.specifications.length}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    name="specifications.width"
                    label="Largeur (m)"
                    type="number"
                    value={formik.values.specifications.width}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    name="specifications.height"
                    label="Hauteur (m)"
                    type="number"
                    value={formik.values.specifications.height}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    name="specifications.maxWeight"
                    label="Poids max (kg)"
                    type="number"
                    value={formik.values.specifications.maxWeight}
                    onChange={formik.handleChange}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Suivi GPS
              </Typography>
              <TextField
                fullWidth
                name="tracking.deviceId"
                label="ID du dispositif GPS"
                value={formik.values.tracking.deviceId}
                onChange={formik.handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Annuler</Button>
          <Button type="submit" variant="contained" color="primary">
            {vehicle ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </form>
    </>
  );
};

export default VehicleForm;
