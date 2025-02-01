import React, { useEffect } from 'react';
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
  Autocomplete,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Delivery, DeliveryStatus } from '../../types/delivery';
import { useDrivers } from '../../hooks/useDrivers';
import { useVehicles } from '../../hooks/useVehicles';

interface DeliveryFormProps {
  delivery: Delivery | null;
  onSave: (delivery: Delivery) => void;
  onCancel: () => void;
}

const validationSchema = Yup.object({
  trackingNumber: Yup.string().required('Le numéro de suivi est requis'),
  pickupAddress: Yup.string().required('L\'adresse de ramassage est requise'),
  deliveryAddress: Yup.string().required('L\'adresse de livraison est requise'),
  scheduledDate: Yup.date().required('La date prévue est requise'),
  status: Yup.string().required('Le statut est requis'),
  packageDetails: Yup.object({
    weight: Yup.number()
      .required('Le poids est requis')
      .min(0, 'Le poids doit être positif'),
    dimensions: Yup.object({
      length: Yup.number().required('La longueur est requise'),
      width: Yup.number().required('La largeur est requise'),
      height: Yup.number().required('La hauteur est requise'),
    }),
  }),
});

const DeliveryForm: React.FC<DeliveryFormProps> = ({
  delivery,
  onSave,
  onCancel,
}) => {
  const { drivers, loading: driversLoading } = useDrivers();
  const { vehicles, loading: vehiclesLoading } = useVehicles();

  const formik = useFormik({
    initialValues: {
      trackingNumber: delivery?.trackingNumber || '',
      pickupAddress: delivery?.pickupAddress || '',
      deliveryAddress: delivery?.deliveryAddress || '',
      scheduledDate: delivery?.scheduledDate || new Date().toISOString(),
      status: delivery?.status || DeliveryStatus.PENDING,
      driver: delivery?.driver || null,
      vehicle: delivery?.vehicle || null,
      packageDetails: delivery?.packageDetails || {
        weight: 0,
        dimensions: {
          length: 0,
          width: 0,
          height: 0,
        },
        description: '',
      },
      notes: delivery?.notes || '',
    },
    validationSchema,
    onSubmit: (values) => {
      onSave({
        id: delivery?.id,
        ...values,
      } as Delivery);
    },
  });

  return (
    <>
      <DialogTitle>
        {delivery ? 'Modifier la livraison' : 'Nouvelle livraison'}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="trackingNumber"
                label="Numéro de suivi"
                value={formik.values.trackingNumber}
                onChange={formik.handleChange}
                error={
                  formik.touched.trackingNumber &&
                  Boolean(formik.errors.trackingNumber)
                }
                helperText={
                  formik.touched.trackingNumber && formik.errors.trackingNumber
                }
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
                  {Object.values(DeliveryStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <FormHelperText error>{formik.errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="pickupAddress"
                label="Adresse de ramassage"
                value={formik.values.pickupAddress}
                onChange={formik.handleChange}
                error={
                  formik.touched.pickupAddress &&
                  Boolean(formik.errors.pickupAddress)
                }
                helperText={
                  formik.touched.pickupAddress && formik.errors.pickupAddress
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="deliveryAddress"
                label="Adresse de livraison"
                value={formik.values.deliveryAddress}
                onChange={formik.handleChange}
                error={
                  formik.touched.deliveryAddress &&
                  Boolean(formik.errors.deliveryAddress)
                }
                helperText={
                  formik.touched.deliveryAddress && formik.errors.deliveryAddress
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="scheduledDate"
                label="Date prévue"
                type="datetime-local"
                value={formik.values.scheduledDate.split('.')[0]}
                onChange={formik.handleChange}
                error={
                  formik.touched.scheduledDate &&
                  Boolean(formik.errors.scheduledDate)
                }
                helperText={
                  formik.touched.scheduledDate && formik.errors.scheduledDate
                }
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={drivers}
                getOptionLabel={(option) => option.name}
                value={formik.values.driver}
                onChange={(event, newValue) => {
                  formik.setFieldValue('driver', newValue);
                }}
                loading={driversLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chauffeur"
                    error={
                      formik.touched.driver && Boolean(formik.errors.driver)
                    }
                    helperText={formik.touched.driver && formik.errors.driver}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={vehicles}
                getOptionLabel={(option) => option.registrationNumber}
                value={formik.values.vehicle}
                onChange={(event, newValue) => {
                  formik.setFieldValue('vehicle', newValue);
                }}
                loading={vehiclesLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Véhicule"
                    error={
                      formik.touched.vehicle && Boolean(formik.errors.vehicle)
                    }
                    helperText={formik.touched.vehicle && formik.errors.vehicle}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Détails du colis
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="packageDetails.weight"
                    label="Poids (kg)"
                    type="number"
                    value={formik.values.packageDetails.weight}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="packageDetails.description"
                    label="Description"
                    multiline
                    rows={2}
                    value={formik.values.packageDetails.description}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    name="packageDetails.dimensions.length"
                    label="Longueur (cm)"
                    type="number"
                    value={formik.values.packageDetails.dimensions.length}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    name="packageDetails.dimensions.width"
                    label="Largeur (cm)"
                    type="number"
                    value={formik.values.packageDetails.dimensions.width}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    name="packageDetails.dimensions.height"
                    label="Hauteur (cm)"
                    type="number"
                    value={formik.values.packageDetails.dimensions.height}
                    onChange={formik.handleChange}
                  />
                </Grid>
              </Grid>
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
            {delivery ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </form>
    </>
  );
};

export default DeliveryForm;
