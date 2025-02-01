import React, { useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Assessment as AssessmentIcon,
  NotificationsActive as AlertIcon,
} from '@mui/icons-material';
import { DriverList } from './DriverList';
import { DriverStats } from './DriverStats';
import { DriverMap } from './DriverMap';
import { DocumentVerification } from './DocumentVerification';
import { PerformanceMetrics } from './PerformanceMetrics';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const DriverDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {/* En-tête */}
        <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Gestion des Chauffeurs</Typography>
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ mr: 2 }}
            >
              Nouveau Chauffeur
            </Button>
            <Button
              variant="outlined"
              startIcon={<AssessmentIcon />}
              sx={{ mr: 2 }}
            >
              Générer Rapport
            </Button>
          </Box>
        </Grid>

        {/* Statistiques rapides */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Total Chauffeurs</Typography>
                <Typography variant="h4">127</Typography>
                <Chip label="+12% ce mois" color="success" size="small" sx={{ mt: 1 }} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Chauffeurs Actifs</Typography>
                <Typography variant="h4">98</Typography>
                <Chip label="77% du total" color="primary" size="small" sx={{ mt: 1 }} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Documents Expirés</Typography>
                <Typography variant="h4">8</Typography>
                <Chip label="Action requise" color="error" size="small" sx={{ mt: 1 }} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Score Moyen</Typography>
                <Typography variant="h4">4.5/5</Typography>
                <Chip label="Excellent" color="success" size="small" sx={{ mt: 1 }} />
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Navigation principale */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Liste des Chauffeurs" />
              <Tab label="Carte en Direct" />
              <Tab label="Documents" />
              <Tab label="Performance" />
              <Tab label="Statistiques" />
            </Tabs>
          </Paper>

          <TabPanel value={tabValue} index={0}>
            <DriverList />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <DriverMap />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <DocumentVerification />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <PerformanceMetrics />
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <DriverStats />
          </TabPanel>
        </Grid>
      </Grid>
    </Box>
  );
};
