import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Assessment as AssessmentIcon,
  LocationOn as LocationOnIcon,
  Timer as TimerIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { Driver, DriverType } from '../../types/driver';

interface DriverDetailsProps {
  driver: Driver;
  onBack: () => void;
  onEdit: (driver: Driver) => void;
  onViewPerformance: () => void;
}

const DriverDetails: React.FC<DriverDetailsProps> = ({
  driver,
  onBack,
  onEdit,
  onViewPerformance,
}) => {
  const isInternal = driver.type === DriverType.INTERNAL;

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={onBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">Détails du chauffeur</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => onEdit(driver)}
        >
          Modifier
        </Button>
        <Button
          variant="contained"
          startIcon={<AssessmentIcon />}
          onClick={onViewPerformance}
        >
          Performance
        </Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Informations personnelles"
              action={
                <Chip
                  label={driver.status}
                  color={driver.status === 'ACTIVE' ? 'success' : 'error'}
                />
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Nom
                  </Typography>
                  <Typography variant="body1">{driver.name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{driver.email}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Téléphone
                  </Typography>
                  <Typography variant="body1">{driver.phone}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Type
                  </Typography>
                  <Typography variant="body1">
                    {isInternal ? 'Interne' : 'Externe'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Permis de conduire" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Numéro
                  </Typography>
                  <Typography variant="body1">{driver.licenseNumber}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Date d'expiration
                  </Typography>
                  <Typography variant="body1">
                    {new Date(driver.licenseExpiry).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={
                isInternal ? 'Informations employé' : 'Informations contractuelles'
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                {isInternal ? (
                  <>
                    <Grid item xs={3}>
                      <Typography variant="subtitle2" color="textSecondary">
                        ID Employé
                      </Typography>
                      <Typography variant="body1">{driver.employeeId}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Département
                      </Typography>
                      <Typography variant="body1">{driver.department}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Type de contrat
                      </Typography>
                      <Typography variant="body1">
                        {driver.contractType}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Date de début
                      </Typography>
                      <Typography variant="body1">
                        {new Date(driver.startDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item xs={3}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Société
                      </Typography>
                      <Typography variant="body1">{driver.company}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Numéro de contrat
                      </Typography>
                      <Typography variant="body1">
                        {driver.contractNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Taux de commission
                      </Typography>
                      <Typography variant="body1">
                        {driver.commissionRate}%
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Zones de service
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {driver.serviceAreas?.map((area) => (
                          <Chip
                            key={area}
                            label={area}
                            size="small"
                            icon={<LocationOnIcon />}
                          />
                        ))}
                      </Box>
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Activité récente"
              icon={<TimerIcon />}
            />
            <CardContent>
              {driver.recentActivity?.map((activity, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(activity.timestamp).toLocaleString()}
                  </Typography>
                  <Typography variant="body1">{activity.description}</Typography>
                  {index < driver.recentActivity.length - 1 && (
                    <Divider sx={{ my: 1 }} />
                  )}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Documents"
              icon={<AssignmentIcon />}
            />
            <CardContent>
              {driver.documents?.map((doc, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">{doc.title}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={doc.status}
                      size="small"
                      color={
                        doc.status === 'VALID'
                          ? 'success'
                          : doc.status === 'EXPIRED'
                          ? 'error'
                          : 'warning'
                      }
                    />
                    <Typography variant="body2" color="textSecondary">
                      Expire le:{' '}
                      {new Date(doc.expiryDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  {index < driver.documents.length - 1 && (
                    <Divider sx={{ my: 1 }} />
                  )}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DriverDetails;
