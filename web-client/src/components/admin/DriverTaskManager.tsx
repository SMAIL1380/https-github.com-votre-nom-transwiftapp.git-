import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { TaskType, TaskPriority, TaskStatus } from '../../types/driver-task.types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const DriverTaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [taskForm, setTaskForm] = useState({
    type: TaskType.OTHER,
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM,
    dueDate: '',
    isBlocking: false,
    requiresValidation: false,
  });

  useEffect(() => {
    if (selectedDriver) {
      fetchDriverTasks();
    }
  }, [selectedDriver]);

  const fetchDriverTasks = async () => {
    try {
      const response = await fetch(`/api/drivers/${selectedDriver}/tasks`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches:', error);
    }
  };

  const handleCreateTask = async () => {
    try {
      await fetch(`/api/drivers/${selectedDriver}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskForm),
      });

      setShowTaskDialog(false);
      fetchDriverTasks();
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      await fetch(`/api/drivers/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      fetchDriverTasks();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const renderTaskDialog = () => (
    <Dialog
      open={showTaskDialog}
      onClose={() => setShowTaskDialog(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Créer une nouvelle tâche</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Type de tâche</InputLabel>
              <Select
                value={taskForm.type}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, type: e.target.value as TaskType })
                }
              >
                {Object.values(TaskType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Priorité</InputLabel>
              <Select
                value={taskForm.priority}
                onChange={(e) =>
                  setTaskForm({
                    ...taskForm,
                    priority: e.target.value as TaskPriority,
                  })
                }
              >
                {Object.values(TaskPriority).map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Titre"
              value={taskForm.title}
              onChange={(e) =>
                setTaskForm({ ...taskForm, title: e.target.value })
              }
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={taskForm.description}
              onChange={(e) =>
                setTaskForm({ ...taskForm, description: e.target.value })
              }
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Date d'échéance"
              value={taskForm.dueDate}
              onChange={(e) =>
                setTaskForm({ ...taskForm, dueDate: e.target.value })
              }
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowTaskDialog(false)}>Annuler</Button>
        <Button
          onClick={handleCreateTask}
          variant="contained"
          disabled={!taskForm.title || !taskForm.dueDate}
        >
          Créer
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderTaskList = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Titre</TableCell>
            <TableCell>Priorité</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell>Échéance</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <Chip label={task.type} size="small" />
              </TableCell>
              <TableCell>{task.title}</TableCell>
              <TableCell>
                <Chip
                  label={task.priority}
                  color={
                    task.priority === TaskPriority.HIGH ||
                    task.priority === TaskPriority.URGENT
                      ? 'error'
                      : task.priority === TaskPriority.MEDIUM
                      ? 'warning'
                      : 'default'
                  }
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={task.status}
                  color={
                    task.status === TaskStatus.COMPLETED
                      ? 'success'
                      : task.status === TaskStatus.OVERDUE
                      ? 'error'
                      : 'default'
                  }
                  size="small"
                />
              </TableCell>
              <TableCell>
                {format(new Date(task.dueDate), 'Pp', { locale: fr })}
              </TableCell>
              <TableCell>
                <IconButton
                  onClick={() =>
                    handleUpdateTaskStatus(task.id, TaskStatus.COMPLETED)
                  }
                  disabled={task.status === TaskStatus.COMPLETED}
                >
                  <CheckCircleIcon />
                </IconButton>
                <IconButton>
                  <EditIcon />
                </IconButton>
                <IconButton>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Gestion des Tâches</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowTaskDialog(true)}
        >
          Nouvelle Tâche
        </Button>
      </Box>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tâches en cours
              </Typography>
              <Typography variant="h4">
                {tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tâches en retard
              </Typography>
              <Typography variant="h4" color="error">
                {tasks.filter((t) => t.status === TaskStatus.OVERDUE).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tâches terminées
              </Typography>
              <Typography variant="h4" color="success">
                {tasks.filter((t) => t.status === TaskStatus.COMPLETED).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tâches bloquantes
              </Typography>
              <Typography variant="h4" color="warning">
                {tasks.filter((t) => t.isBlocking).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {renderTaskList()}
      {renderTaskDialog()}
    </Box>
  );
};
