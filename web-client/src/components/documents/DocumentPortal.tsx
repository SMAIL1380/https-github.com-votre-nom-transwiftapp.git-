import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Document {
  id: string;
  type: string;
  number: string;
  date: Date;
  status: string;
  totalAmount: number;
  downloadUrl: string;
  canShare: boolean;
}

export const DocumentPortal: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, [tabValue]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/documents?type=${getDocumentType(tabValue)}`,
      );
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/documents/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    }
  };

  const getDocumentType = (tab: number): string => {
    switch (tab) {
      case 0:
        return 'MONTHLY_INVOICE';
      case 1:
        return 'TRANSPORT_DOCUMENT';
      case 2:
        return 'ARCHIVED';
      default:
        return 'ALL';
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const response = await fetch(document.downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${document.type}_${document.number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  const handleShare = async () => {
    if (!selectedDocument || !shareEmail) return;

    try {
      await fetch('/api/documents/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: selectedDocument.id,
          email: shareEmail,
        }),
      });

      setShowShareDialog(false);
      setShareEmail('');
      setSelectedDocument(null);
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  };

  const renderStats = () => (
    <Grid container spacing={3} mb={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Documents ce mois
            </Typography>
            <Typography variant="h4">{stats?.monthlyCount}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total facturé
            </Typography>
            <Typography variant="h4">{stats?.monthlyAmount}€</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Documents archivés
            </Typography>
            <Typography variant="h4">{stats?.archivedCount}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Espace utilisé
            </Typography>
            <Typography variant="h4">{stats?.storageUsed}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderDocumentsTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Numéro</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Montant</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>{doc.number}</TableCell>
              <TableCell>
                {format(new Date(doc.date), 'Pp', { locale: fr })}
              </TableCell>
              <TableCell>{doc.type}</TableCell>
              <TableCell>{doc.totalAmount}€</TableCell>
              <TableCell>
                <Chip
                  label={doc.status}
                  color={
                    doc.status === 'PAID'
                      ? 'success'
                      : doc.status === 'PENDING'
                      ? 'warning'
                      : 'default'
                  }
                  size="small"
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleDownload(doc)}>
                  <DownloadIcon />
                </IconButton>
                <IconButton>
                  <ViewIcon />
                </IconButton>
                <IconButton>
                  <PrintIcon />
                </IconButton>
                {doc.canShare && (
                  <IconButton
                    onClick={() => {
                      setSelectedDocument(doc);
                      setShowShareDialog(true);
                    }}
                  >
                    <ShareIcon />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderShareDialog = () => (
    <Dialog
      open={showShareDialog}
      onClose={() => setShowShareDialog(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Partager le document</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Adresse email"
          type="email"
          fullWidth
          value={shareEmail}
          onChange={(e) => setShareEmail(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowShareDialog(false)}>Annuler</Button>
        <Button onClick={handleShare} variant="contained" disabled={!shareEmail}>
          Partager
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Portail Documents
      </Typography>

      {stats && renderStats()}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab label="Factures Mensuelles" />
          <Tab label="Documents de Transport" />
          <Tab label="Archives" />
        </Tabs>
      </Paper>

      {loading ? (
        <Typography>Chargement des documents...</Typography>
      ) : (
        renderDocumentsTable()
      )}

      {renderShareDialog()}
    </Box>
  );
};
