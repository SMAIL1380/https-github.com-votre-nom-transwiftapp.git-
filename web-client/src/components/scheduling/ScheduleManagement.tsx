import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  IconButton,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  CalendarMonth as CalendarIcon,
  ViewList as ListIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { ViewState, EditingState, IntegratedEditing } from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  DayView,
  WeekView,
  MonthView,
  Toolbar,
  DateNavigator,
  TodayButton,
  Appointments,
  AppointmentTooltip,
  AppointmentForm,
  DragDropProvider,
  Resources,
} from '@devexpress/dx-react-scheduler-material-ui';
import { useSchedule } from '../../hooks/useSchedule';
import { useDrivers } from '../../hooks/useDrivers';
import { useVehicles } from '../../hooks/useVehicles';
import ScheduleForm from './ScheduleForm';
import ScheduleFilters from './ScheduleFilters';
import ScheduleOptimization from './ScheduleOptimization';
import { Schedule, ScheduleView } from '../../types/schedule';

const ScheduleManagement = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<ScheduleView>('week');
  const [openDialog, setOpenDialog] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [openOptimization, setOpenOptimization] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [filters, setFilters] = useState({});

  const { schedules, loading, error, fetchSchedules, createSchedule, updateSchedule, deleteSchedule } = useSchedule();
  const { drivers } = useDrivers();
  const { vehicles } = useVehicles();

  useEffect(() => {
    fetchSchedules(filters);
  }, [fetchSchedules, filters]);

  const resources = [
    {
      fieldName: 'driverId',
      title: 'Chauffeur',
      instances: drivers.map(driver => ({
        id: driver.id,
        text: driver.name,
        color: driver.type === 'INTERNAL' ? '#4caf50' : '#ff9800',
      })),
    },
    {
      fieldName: 'vehicleId',
      title: 'Véhicule',
      instances: vehicles.map(vehicle => ({
        id: vehicle.id,
        text: vehicle.registrationNumber,
        color: '#2196f3',
      })),
    },
  ];

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  const handleViewChange = (view: ScheduleView) => {
    setCurrentView(view);
  };

  const handleScheduleChange = ({ added, changed, deleted }: any) => {
    if (added) {
      createSchedule(added);
    }
    if (changed) {
      const scheduleId = Object.keys(changed)[0];
      updateSchedule({ id: scheduleId, ...changed[scheduleId] });
    }
    if (deleted) {
      deleteSchedule(deleted);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setOpenFilters(false);
  };

  if (error) {
    return (
      <Typography color="error">
        Erreur lors du chargement du planning: {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Nouvelle planification
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchSchedules(filters)}
          >
            Actualiser
          </Button>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setOpenFilters(true)}
          >
            Filtres
          </Button>
          <Button
            variant="outlined"
            startIcon={<TimelineIcon />}
            onClick={() => setOpenOptimization(true)}
          >
            Optimisation
          </Button>
        </Box>

        <Scheduler
          data={schedules}
          height={660}
        >
          <ViewState
            currentDate={currentDate}
            currentViewName={currentView}
            onCurrentDateChange={handleDateChange}
            onCurrentViewNameChange={handleViewChange}
          />
          <EditingState
            onCommitChanges={handleScheduleChange}
          />
          <IntegratedEditing />

          <DayView startDayHour={6} endDayHour={22} />
          <WeekView startDayHour={6} endDayHour={22} />
          <MonthView />

          <Toolbar />
          <DateNavigator />
          <TodayButton />
          <Appointments />
          <AppointmentTooltip
            showCloseButton
            showDeleteButton
            showOpenButton
          />
          <AppointmentForm />
          <DragDropProvider />
          <Resources
            data={resources}
            mainResourceName="driverId"
          />
        </Scheduler>

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <ScheduleForm
            schedule={selectedSchedule}
            onSave={(schedule) => {
              if (selectedSchedule) {
                updateSchedule(schedule);
              } else {
                createSchedule(schedule);
              }
              setOpenDialog(false);
            }}
            onCancel={() => setOpenDialog(false)}
          />
        </Dialog>

        <Dialog
          open={openFilters}
          onClose={() => setOpenFilters(false)}
          maxWidth="sm"
          fullWidth
        >
          <ScheduleFilters
            initialFilters={filters}
            onApply={handleFilterChange}
            onCancel={() => setOpenFilters(false)}
          />
        </Dialog>

        <Dialog
          open={openOptimization}
          onClose={() => setOpenOptimization(false)}
          maxWidth="lg"
          fullWidth
        >
          <ScheduleOptimization
            schedules={schedules}
            drivers={drivers}
            vehicles={vehicles}
            onOptimize={(optimizedSchedules) => {
              optimizedSchedules.forEach(schedule => updateSchedule(schedule));
              setOpenOptimization(false);
            }}
            onCancel={() => setOpenOptimization(false)}
          />
        </Dialog>
      </Paper>
    </Box>
  );
};

export default ScheduleManagement;
