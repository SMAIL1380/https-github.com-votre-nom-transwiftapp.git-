import { useState, useCallback } from 'react';
import { Schedule, ScheduleOptimizationResult } from '../types/schedule';
import { Driver } from '../types/driver';
import { Vehicle } from '../types/vehicle';
import {
  optimizeRoutes,
  getOptimizationMetrics,
  getOptimizationRecommendations,
  simulateOptimization,
} from '../services/optimizationService';

interface AIOptimizationState {
  optimizedRoutes: Schedule[] | null;
  metrics: ScheduleOptimizationResult['metrics'] | null;
  recommendations: ScheduleOptimizationResult['recommendations'] | null;
  isOptimizing: boolean;
  progress: number;
  currentPhase: string;
  error: string | null;
}

interface UseAIOptimization {
  optimizedRoutes: Schedule[] | null;
  metrics: ScheduleOptimizationResult['metrics'] | null;
  recommendations: ScheduleOptimizationResult['recommendations'] | null;
  isOptimizing: boolean;
  progress: number;
  currentPhase: string;
  error: string | null;
  startOptimization: (
    schedules: Schedule[],
    drivers: Driver[],
    vehicles: Vehicle[],
  ) => Promise<void>;
  applyRecommendation: (
    recommendation: ScheduleOptimizationResult['recommendations'][0],
  ) => Promise<void>;
  saveOptimization: () => Promise<void>;
}

export const useAIOptimization = (): UseAIOptimization => {
  const [state, setState] = useState<AIOptimizationState>({
    optimizedRoutes: null,
    metrics: null,
    recommendations: null,
    isOptimizing: false,
    progress: 0,
    currentPhase: '',
    error: null,
  });

  const updateState = (updates: Partial<AIOptimizationState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const startOptimization = useCallback(
    async (schedules: Schedule[], drivers: Driver[], vehicles: Vehicle[]) => {
      try {
        updateState({
          isOptimizing: true,
          progress: 0,
          currentPhase: 'Analyse des données...',
          error: null,
        });

        // Phase 1: Analyse initiale
        await new Promise((resolve) => setTimeout(resolve, 1000));
        updateState({
          progress: 20,
          currentPhase: 'Calcul des routes optimales...',
        });

        // Phase 2: Optimisation des routes
        const optimizedRoutes = await optimizeRoutes(schedules, drivers, vehicles);
        updateState({
          progress: 40,
          currentPhase: 'Calcul des métriques...',
        });

        // Phase 3: Calcul des métriques
        const metrics = await getOptimizationMetrics(optimizedRoutes);
        updateState({
          progress: 60,
          currentPhase: 'Génération des recommandations...',
        });

        // Phase 4: Génération des recommandations
        const recommendations = await getOptimizationRecommendations(optimizedRoutes);
        updateState({
          progress: 80,
          currentPhase: 'Simulation des résultats...',
        });

        // Phase 5: Simulation finale
        const simulationResult = await simulateOptimization(optimizedRoutes);
        updateState({
          optimizedRoutes,
          metrics: simulationResult.metrics,
          recommendations: simulationResult.recommendations,
          progress: 100,
          currentPhase: 'Optimisation terminée',
          isOptimizing: false,
        });
      } catch (error) {
        updateState({
          error: (error as Error).message,
          isOptimizing: false,
        });
      }
    },
    [],
  );

  const applyRecommendation = useCallback(
    async (recommendation: ScheduleOptimizationResult['recommendations'][0]) => {
      if (!state.optimizedRoutes) return;

      try {
        updateState({
          isOptimizing: true,
          progress: 0,
          currentPhase: 'Application de la recommandation...',
          error: null,
        });

        // Simuler l'application de la recommandation
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Recalculer les métriques
        const newMetrics = await getOptimizationMetrics(state.optimizedRoutes);
        const newRecommendations = await getOptimizationRecommendations(
          state.optimizedRoutes,
        );

        updateState({
          metrics: newMetrics,
          recommendations: newRecommendations,
          isOptimizing: false,
          progress: 100,
          currentPhase: 'Recommandation appliquée',
        });
      } catch (error) {
        updateState({
          error: (error as Error).message,
          isOptimizing: false,
        });
      }
    },
    [state.optimizedRoutes],
  );

  const saveOptimization = useCallback(async () => {
    if (!state.optimizedRoutes) return;

    try {
      // Sauvegarder l'optimisation
      // Implémenter la logique de sauvegarde ici
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      updateState({
        error: (error as Error).message,
      });
    }
  }, [state.optimizedRoutes]);

  return {
    ...state,
    startOptimization,
    applyRecommendation,
    saveOptimization,
  };
};

export default useAIOptimization;
