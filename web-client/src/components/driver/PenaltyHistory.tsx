import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Penalty {
  id: string;
  amount: number;
  type: string;
  reason: string;
  duration: number;
  startTime: Date;
  endTime: Date;
  isPaid: boolean;
  orderId?: string;
  appeal?: {
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    reason: string;
    timestamp: Date;
    decision?: {
      by: string;
      reason: string;
      timestamp: Date;
    };
  };
}

export const PenaltyHistory: React.FC = () => {
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [selectedPenalty, setSelectedPenalty] = useState<Penalty | null>(null);
  const [showAppealDialog, setShowAppealDialog] = useState(false);
  const [appealReason, setAppealReason] = useState('');

  useEffect(() => {
    fetchPenalties();
  }, []);

  const fetchPenalties = async () => {
    try {
      const response = await fetch('/api/drivers/me/penalties');
      const data = await response.json();
      setPenalties(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des pénalités:', error);
    }
  };

  const handleAppealSubmit = async () => {
    if (!selectedPenalty) return;

    try {
      await fetch(`/api/drivers/penalties/${selectedPenalty.id}/appeal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: appealReason,
        }),
      });

      // Rafraîchir les données
      await fetchPenalties();
      setShowAppealDialog(false);
      setAppealReason('');
      setSelectedPenalty(null);
    } catch (error) {
      console.error('Erreur lors de la soumission du recours:', error);
    }
  };

  const getStatusColor = (penalty: Penalty) => {
    if (penalty.isPaid) return 'success';
    if (new Date() > new Date(penalty.endTime)) return 'error';
    return 'warning';
  };

  const getAppealStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'warning';
    }
  };

  const renderAppealDialog = () => (
    <Dialog
      open={showAppealDialog}
      onClose={() => setShowAppealDialog(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Faire un recours</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" paragraph>
          Pénalité du{' '}
          {selectedPenalty &&
            format(new Date(selectedPenalty.startTime), 'Pp', { locale: fr })}
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Montant: {selectedPenalty?.amount}€
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          label="Motif du recours"
          fullWidth
          multiline
          rows={4}
          value={appealReason}
          onChange={(e) => setAppealReason(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowAppealDialog(false)}>Annuler</Button>
        <Button
          onClick={handleAppealSubmit}
          variant="contained"
          disabled={!appealReason.trim()}
        >
          Soumettre
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Historique des Pénalités
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Raison</TableCell>
              <TableCell>Montant</TableCell>
              <TableCell>Durée</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Recours</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {penalties.map((penalty) => (
              <TableRow key={penalty.id}>
                <TableCell>
                  {format(new Date(penalty.startTime), 'Pp', { locale: fr })}
                </TableCell>
                <TableCell>{penalty.type}</TableCell>
                <TableCell>{penalty.reason}</TableCell>
                <TableCell>{penalty.amount}€</TableCell>
                <TableCell>{penalty.duration}h</TableCell>
                <TableCell>
                  <Chip
                    label={penalty.isPaid ? 'Payée' : 'En attente'}
                    color={getStatusColor(penalty)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {penalty.appeal ? (
                    <Chip
                      label={penalty.appeal.status}
                      color={getAppealStatusColor(penalty.appeal.status)}
                      size="small"
                    />
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {!penalty.appeal && !penalty.isPaid && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setSelectedPenalty(penalty);
                        setShowAppealDialog(true);
                      }}
                    >
                      Faire un recours
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {renderAppealDialog()}
    </Box>
  );
};
