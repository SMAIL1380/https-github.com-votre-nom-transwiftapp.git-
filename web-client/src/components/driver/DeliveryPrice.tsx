import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';

interface DeliveryPriceProps {
  orderId: string;
  driverId: string;
  isExternal: boolean;
}

interface PriceDetails {
  basePrice: number;
  commission: number;
  finalPrice: number;
}

export const DeliveryPrice: React.FC<DeliveryPriceProps> = ({
  orderId,
  driverId,
  isExternal,
}) => {
  const [priceDetails, setPriceDetails] = useState<PriceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPriceDetails();
  }, [orderId, driverId]);

  const fetchPriceDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/delivery/price?orderId=${orderId}&driverId=${driverId}`,
      );
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du prix');
      }

      const data = await response.json();
      setPriceDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box p={2}>
        <Typography>Chargement des informations de prix...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!isExternal) {
    return null; // Ne rien afficher pour les chauffeurs internes
  }

  return (
    <Paper elevation={2}>
      <Box p={2}>
        <Typography variant="h6" gutterBottom>
          Détails du Prix
        </Typography>
        <Divider />
        <List dense>
          <ListItem>
            <ListItemText
              primary="Prix de base"
              secondary={`${priceDetails?.basePrice.toFixed(2)}€`}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Commission Transwift (20%)"
              secondary={`-${priceDetails?.commission.toFixed(2)}€`}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary={
                <Typography variant="subtitle1" fontWeight="bold">
                  Prix final
                </Typography>
              }
              secondary={
                <Typography variant="h6" color="primary">
                  {priceDetails?.finalPrice.toFixed(2)}€
                </Typography>
              }
            />
          </ListItem>
        </List>
        <Box mt={2}>
          <Chip
            label="Prix après commission Transwift"
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>
      </Box>
    </Paper>
  );
};
