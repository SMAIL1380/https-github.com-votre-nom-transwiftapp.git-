import React from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  Box,
  Button,
} from '@mui/material';
import { DateRangePicker } from '@mui/lab';
import { DocumentType } from '../../../types/document';

interface DocumentFilterProps {
  filters: {
    status: string;
    type: string;
    search: string;
    dateRange: [Date | null, Date | null] | null;
  };
  onFilterChange: (filters: any) => void;
}

export const DocumentFilter: React.FC<DocumentFilterProps> = ({
  filters,
  onFilterChange,
}) => {
  const handleChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onFilterChange({
      ...filters,
      [field]: event.target.value,
    });
  };

  const handleDateRangeChange = (newValue: [Date | null, Date | null]) => {
    onFilterChange({
      ...filters,
      dateRange: newValue,
    });
  };

  const handleReset = () => {
    onFilterChange({
      status: '',
      type: '',
      search: '',
      dateRange: null,
    });
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Rechercher"
            variant="outlined"
            size="small"
            value={filters.search}
            onChange={handleChange('search')}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            select
            label="Type"
            variant="outlined"
            size="small"
            value={filters.type}
            onChange={handleChange('type')}
          >
            <MenuItem value="">Tous</MenuItem>
            {Object.values(DocumentType).map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            select
            label="Statut"
            variant="outlined"
            size="small"
            value={filters.status}
            onChange={handleChange('status')}
          >
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="VERIFIED">Vérifié</MenuItem>
            <MenuItem value="PENDING">En attente</MenuItem>
            <MenuItem value="REJECTED">Rejeté</MenuItem>
            <MenuItem value="EXPIRED">Expiré</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={3}>
          <DateRangePicker
            startText="Date début"
            endText="Date fin"
            value={filters.dateRange}
            onChange={handleDateRangeChange}
            renderInput={(startProps, endProps) => (
              <>
                <TextField {...startProps} size="small" />
                <Box sx={{ mx: 1 }}> à </Box>
                <TextField {...endProps} size="small" />
              </>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleReset}
            fullWidth
          >
            Réinitialiser
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
