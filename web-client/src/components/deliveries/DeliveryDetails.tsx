import React, { useState } from 'react';
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
  Stepper,
  Step,
  StepLabel,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  LocalShipping as ShippingIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  DirectionsCar as VehicleIcon,
} from '@mui/icons-material';
import { Delivery, DeliveryStatus } from '../../types/delivery';
import DeliveryMap from './DeliveryMap';

interface DeliveryDetailsProps {
  delivery: Delivery;
  onBack: () => void;
  onEdit: (delivery: Delivery) => void;
}

const DeliveryDetails: React.FC<DeliveryDetailsProps> = ({
  delivery,
  onBack,
  onEdit,
}) => {
  const [showMap, setShowMap] = useState(false);

  const getStatusSteps = () => {
    const steps = [
      'En attente',
      'En cours de ramassage',
      'En transit',
      'En cours de livraison',
      'Livré',
    ];

    const currentStep = steps.indexOf(delivery.status);

    return (
      <Stepper
        activeStep={currentStep}
        alternativeLabel
        sx={{ width: '100%', mb: 3 }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={onBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">Détails de la livraison</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => onEdit(delivery)}
        >
          Modifier
        </Button>
      </Box>

      {getStatusSteps()}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Informations générales"
              action={
                <Chip
                  label={delivery.status}
                  color={
                    delivery.status === DeliveryStatus.COMPLETED
                      ? 'success'
                      : delivery.status === DeliveryStatus.IN_PROGRESS
                      ? 'primary'
                      : delivery.status === DeliveryStatus.PENDING
                      ? 'warning'
                      : 'error'
                  }
                />
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    N° de suivi
                  </Typography>
                  <Typography variant="body1">
                    {delivery.trackingNumber}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Date prévue
                  </Typography>
                  <Typography variant="body1">
                    {new Date(delivery.scheduledDate).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Assignation" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Chauffeur
                      </Typography>
                      <Typography variant="body1">
                        {delivery.driver?.name || 'Non assigné'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VehicleIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Véhicule
                      </Typography>
                      <Typography variant="body1">
                        {delivery.vehicle?.registrationNumber || 'Non assigné'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardHeader title="Adresses" />
            <CardContent>
              <Timeline>
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot color="primary">
                      <LocationIcon />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="subtitle2" color="textSecondary">
                      Adresse de ramassage
                    </Typography>
                    <Typography variant="body1">
                      {delivery.pickupAddress}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot color="primary">
                      <LocationIcon />
                    </TimelineDot>
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="subtitle2" color="textSecondary">
                      Adresse de livraison
                    </Typography>
                    <Typography variant="body1">
                      {delivery.deliveryAddress}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              </Timeline>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setShowMap(!showMap)}
              >
                {showMap ? 'Masquer la carte' : 'Afficher sur la carte'}
              </Button>
              {showMap && (
                <Box sx={{ mt: 2, height: 400 }}>
                  <DeliveryMap
                    deliveries={[delivery]}
                    onDeliverySelect={() => {}}
                    showRoute
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Détails du colis" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Poids
                  </Typography>
                  <Typography variant="body1">
                    {delivery.packageDetails.weight} kg
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Dimensions
                  </Typography>
                  <Typography variant="body1">
                    {delivery.packageDetails.dimensions.length} x{' '}
                    {delivery.packageDetails.dimensions.width} x{' '}
                    {delivery.packageDetails.dimensions.height} cm
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {delivery.packageDetails.description}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Notes" />
            <CardContent>
              <Typography variant="body1">{delivery.notes}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DeliveryDetails;
