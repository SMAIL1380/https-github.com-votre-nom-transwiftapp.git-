import { Schedule, ScheduleOptimizationResult } from '../types/schedule';
import { Driver } from '../types/driver';
import { Vehicle } from '../types/vehicle';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const optimizeRoutes = async (
  schedules: Schedule[],
  drivers: Driver[],
  vehicles: Vehicle[],
): Promise<Schedule[]> => {
  try {
    const response = await axios.post(`${API_URL}/schedules/optimize`, {
      schedules,
      drivers,
      vehicles,
      constraints: {
        maxWorkingHours: 8,
        requiredBreaks: [
          {
            after: 4,
            duration: 0.5,
          },
        ],
        vehicleCapacity: true,
        driverQualifications: true,
        timeWindows: true,
      },
      objectives: {
        minimizeDistance: true,
        minimizeDuration: true,
        minimizeFuel: true,
        balanceWorkload: true,
      },
    });

    return response.data.schedules;
  } catch (error) {
    console.error('Erreur lors de l\'optimisation des routes:', error);
    throw new Error('Impossible d\'optimiser les routes');
  }
};

export const getOptimizationMetrics = async (
  schedules: Schedule[],
): Promise<ScheduleOptimizationResult['metrics']> => {
  try {
    const response = await axios.post(`${API_URL}/schedules/metrics`, {
      schedules,
    });

    return response.data;
  } catch (error) {
    console.error('Erreur lors du calcul des métriques:', error);
    throw new Error('Impossible de calculer les métriques');
  }
};

export const getOptimizationRecommendations = async (
  schedules: Schedule[],
): Promise<ScheduleOptimizationResult['recommendations']> => {
  try {
    const response = await axios.post(`${API_URL}/schedules/recommendations`, {
      schedules,
    });

    return response.data;
  } catch (error) {
    console.error('Erreur lors de la génération des recommandations:', error);
    throw new Error('Impossible de générer les recommandations');
  }
};

export const simulateOptimization = async (
  schedules: Schedule[],
): Promise<ScheduleOptimizationResult> => {
  try {
    const response = await axios.post(`${API_URL}/schedules/simulate`, {
      schedules,
    });

    return response.data;
  } catch (error) {
    console.error('Erreur lors de la simulation:', error);
    throw new Error('Impossible de simuler l\'optimisation');
  }
};

export const exportOptimizationReport = async (
  result: ScheduleOptimizationResult,
  format: 'pdf' | 'excel' = 'pdf',
): Promise<Blob> => {
  try {
    const response = await axios.post(
      `${API_URL}/schedules/export`,
      {
        result,
        format,
      },
      {
        responseType: 'blob',
      },
    );

    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'export du rapport:', error);
    throw new Error('Impossible d\'exporter le rapport');
  }
};
