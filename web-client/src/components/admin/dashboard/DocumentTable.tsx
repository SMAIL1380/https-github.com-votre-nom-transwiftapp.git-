import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Chip,
  TextField,
  Box,
  Tooltip,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  GetApp as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useDocuments } from '../../../hooks/useDocuments';
import { DocumentFilter } from './DocumentFilter';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const DocumentTable: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: '',
    dateRange: null,
  });

  const { documents, loading, refetch } = useDocuments(filters);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      VERIFIED: 'success',
      PENDING: 'warning',
      REJECTED: 'error',
      EXPIRED: 'error',
    };
    return colors[status] || 'default';
  };

  const handleViewDocument = (documentId: string) => {
    // Ouvrir la modal de visualisation
  };

  const handleDownloadDocument = (documentUrl: string) => {
    window.open(documentUrl, '_blank');
  };

  const handleRefreshVerification = async (documentId: string) => {
    // Relancer la vérification
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <DocumentFilter
          filters={filters}
          onFilterChange={setFilters}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Chauffeur</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Date d'Expiration</TableCell>
              <TableCell>Dernière Vérification</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.documentType}</TableCell>
                  <TableCell>
                    {doc.driver.firstName} {doc.driver.lastName}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={doc.status}
                      color={getStatusColor(doc.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(doc.expiryDate), 'dd MMMM yyyy', {
                      locale: fr,
                    })}
                  </TableCell>
                  <TableCell>
                    {doc.verificationDetails?.verificationDate
                      ? format(
                          new Date(doc.verificationDetails.verificationDate),
                          'dd/MM/yyyy HH:mm',
                          { locale: fr },
                        )
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Voir le document">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDocument(doc.id)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Télécharger">
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadDocument(doc.documentUrl)}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    {doc.status !== 'VERIFIED' && (
                      <Tooltip title="Relancer la vérification">
                        <IconButton
                          size="small"
                          onClick={() => handleRefreshVerification(doc.id)}
                        >
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={documents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page"
        />
      </TableContainer>
    </Box>
  );
};
