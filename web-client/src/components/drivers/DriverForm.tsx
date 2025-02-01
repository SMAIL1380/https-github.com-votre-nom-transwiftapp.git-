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
import { Driver, DriverType } from '../../types/driver';

interface DriverFormProps {
  driver: Driver | null;
  onSave: (driver: Driver) => void;
  onCancel: () => void;
  type: DriverType;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Le nom est requis'),
  email: Yup.string()
    .email('Email invalide')
    .required('L\'email est requis'),
  phone: Yup.string().required('Le téléphone est requis'),
  licenseNumber: Yup.string().required('Le numéro de permis est requis'),
  licenseExpiry: Yup.date().required('La date d\'expiration est requise'),
  status: Yup.string().required('Le statut est requis'),
});

const DriverForm: React.FC<DriverFormProps> = ({
  driver,
  onSave,
  onCancel,
  type,
}) => {
  const formik = useFormik({
    initialValues: {
      name: driver?.name || '',
      email: driver?.email || '',
      phone: driver?.phone || '',
      licenseNumber: driver?.licenseNumber || '',
      licenseExpiry: driver?.licenseExpiry || '',
      status: driver?.status || 'ACTIVE',
      type: type,
      ...(type === DriverType.INTERNAL
        ? {
            employeeId: driver?.employeeId || '',
            department: driver?.department || '',
            contractType: driver?.contractType || '',
            startDate: driver?.startDate || '',
          }
        : {
            company: driver?.company || '',
            contractNumber: driver?.contractNumber || '',
            commissionRate: driver?.commissionRate || '',
            serviceAreas: driver?.serviceAreas || [],
          }),
    },
    validationSchema,
    onSubmit: (values) => {
      onSave({
        id: driver?.id,
        ...values,
      } as Driver);
    },
  });

  return (
    <>
      <DialogTitle>
        {driver ? 'Modifier le chauffeur' : 'Ajouter un chauffeur'}
      </DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="name"
                label="Nom"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="email"
                label="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="phone"
                label="Téléphone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="licenseNumber"
                label="Numéro de permis"
                value={formik.values.licenseNumber}
                onChange={formik.handleChange}
                error={
                  formik.touched.licenseNumber &&
                  Boolean(formik.errors.licenseNumber)
                }
                helperText={
                  formik.touched.licenseNumber && formik.errors.licenseNumber
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="licenseExpiry"
                label="Date d'expiration du permis"
                type="date"
                value={formik.values.licenseExpiry}
                onChange={formik.handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                error={
                  formik.touched.licenseExpiry &&
                  Boolean(formik.errors.licenseExpiry)
                }
                helperText={
                  formik.touched.licenseExpiry && formik.errors.licenseExpiry
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
                  <MenuItem value="ACTIVE">Actif</MenuItem>
                  <MenuItem value="INACTIVE">Inactif</MenuItem>
                  <MenuItem value="SUSPENDED">Suspendu</MenuItem>
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <FormHelperText error>{formik.errors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {type === DriverType.INTERNAL ? (
              // Champs spécifiques aux chauffeurs internes
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="employeeId"
                    label="ID Employé"
                    value={formik.values.employeeId}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="department"
                    label="Département"
                    value={formik.values.department}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Type de contrat</InputLabel>
                    <Select
                      name="contractType"
                      value={formik.values.contractType}
                      onChange={formik.handleChange}
                    >
                      <MenuItem value="CDI">CDI</MenuItem>
                      <MenuItem value="CDD">CDD</MenuItem>
                      <MenuItem value="INTERIM">Intérim</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="startDate"
                    label="Date de début"
                    type="date"
                    value={formik.values.startDate}
                    onChange={formik.handleChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
              </>
            ) : (
              // Champs spécifiques aux chauffeurs externes
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="company"
                    label="Société"
                    value={formik.values.company}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="contractNumber"
                    label="Numéro de contrat"
                    value={formik.values.contractNumber}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="commissionRate"
                    label="Taux de commission (%)"
                    type="number"
                    value={formik.values.commissionRate}
                    onChange={formik.handleChange}
                    InputProps={{
                      inputProps: { min: 0, max: 100 },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Zones de service</InputLabel>
                    <Select
                      multiple
                      name="serviceAreas"
                      value={formik.values.serviceAreas}
                      onChange={formik.handleChange}
                    >
                      <MenuItem value="NORTH">Nord</MenuItem>
                      <MenuItem value="SOUTH">Sud</MenuItem>
                      <MenuItem value="EAST">Est</MenuItem>
                      <MenuItem value="WEST">Ouest</MenuItem>
                      <MenuItem value="CENTER">Centre</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Annuler</Button>
          <Button type="submit" variant="contained" color="primary">
            {driver ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </form>
    </>
  );
};

export default DriverForm;
