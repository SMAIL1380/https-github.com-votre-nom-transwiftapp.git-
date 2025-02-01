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
  FormHelperText,
  Autocomplete,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Incident, IncidentStatus, IncidentSeverity } from '../../types/incident';
import { useDrivers } from '../../hooks/useDrivers';
import { useVehicles } from '../../hooks/useVehicles';
import ImageUpload from '../common/ImageUpload';

interface IncidentFormProps {
  incident: Incident | null;
  onSave: (incident: Incident) => void;
  onCancel: () => void;
}

const validationSchema = Yup.object({
  title: Yup.string().required('Le titre est requis'),
  description: Yup.string().required('La description est requise'),
  severity: Yup.string().required('La sévérité est requise'),
  status: Yup.string().required('Le statut est requis'),
  location: Yup.string().required('La localisation est requise'),
});

const IncidentForm: React.FC<IncidentFormProps> = ({
  incident,
  onSave,
  onCancel,
}) => {
  const { drivers, loading: driversLoading } = useDrivers();
  const { vehicles, loading: vehiclesLoading } = useVehicles();
  const [images, setImages] = useState<string[]>(incident?.evidence || []);

  const formik = useFormik({
    initialValues: {
      title: incident?.title || '',
      description: incident?.description || '',
      severity: incident?.severity || IncidentSeverity.MEDIUM,
      status: incident?.status || IncidentStatus.OPEN,
      location: incident?.location || '',
      driver: incident?.driver || null,
      vehicle: incident?.vehicle || null,
      evidence: incident?.evidence || [],
      notes: incident?.notes || '',
      resolution: incident?.resolution || {
        description: '',
        date: null,
        resolvedBy: null,
      },
    },
    validationSchema,
    onSubmit: (values) => {
      onSave({
        id: incident?.id,
        ...values,
        evidence: images,
        reportedAt: incident?.reportedAt || new Date().toISOString(),
      } as Incident);
    },
  });

  return (
    <>
      <DialogTitle>
        {incident ? 'Modifier l\'incident' : 'Signaler un incident'}
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
                <InputLabel>Sévérité</InputLabel>
                <Select
                  name="severity"
                  value={formik.values.severity}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.severity && Boolean(formik.errors.severity)
                  }
                >
                  {Object.values(IncidentSeverity).map((severity) => (
                    <MenuItem key={severity} value={severity}>
                      {severity}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.severity && formik.errors.severity && (
                  <FormHelperText error>{formik.errors.severity}</FormHelperText>
                )}
              </FormControl>
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
                  {Object.values(IncidentStatus).map((status) => (
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
                name="description"
                label="Description"
                multiline
                rows={4}
                value={formik.values.description}
                onChange={formik.handleChange}
                error={
                  formik.touched.description &&
                  Boolean(formik.errors.description)
                }
                helperText={
                  formik.touched.description && formik.errors.description
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="location"
                label="Localisation"
                value={formik.values.location}
                onChange={formik.handleChange}
                error={
                  formik.touched.location && Boolean(formik.errors.location)
                }
                helperText={formik.touched.location && formik.errors.location}
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
              <Typography variant="subtitle1" gutterBottom>
                Photos / Documents
              </Typography>
              <ImageUpload
                images={images}
                onImagesChange={setImages}
                maxImages={5}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="notes"
                label="Notes additionnelles"
                multiline
                rows={3}
                value={formik.values.notes}
                onChange={formik.handleChange}
              />
            </Grid>

            {formik.values.status === IncidentStatus.RESOLVED && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Résolution
                </Typography>
                <TextField
                  fullWidth
                  name="resolution.description"
                  label="Description de la résolution"
                  multiline
                  rows={3}
                  value={formik.values.resolution.description}
                  onChange={formik.handleChange}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Annuler</Button>
          <Button type="submit" variant="contained" color="primary">
            {incident ? 'Modifier' : 'Signaler'}
          </Button>
        </DialogActions>
      </form>
    </>
  );
};

export default IncidentForm;
