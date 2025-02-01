import { useState, useEffect, useCallback } from 'react';
import { Challenge } from '../types/gamification';
import { gamificationService } from '../services/GamificationService';

export const useChallenges = (driverId: string) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const data = await gamificationService.getChallenges();
      setChallenges(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des défis');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProgress = useCallback(async (
    challengeId: string,
    progress: {
      type: 'deliveries' | 'ratings' | 'time' | 'distance';
      value: number;
    }
  ) => {
    try {
      await gamificationService.updateChallengeProgress(driverId, challengeId, progress);
      await loadChallenges(); // Recharger les défis pour avoir les dernières données
    } catch (err) {
      console.error('Erreur lors de la mise à jour du progrès:', err);
      throw err;
    }
  }, [driverId, loadChallenges]);

  const generateDailyChallenges = useCallback(async () => {
    try {
      const newChallenges = await gamificationService.generateDailyChallenges(driverId);
      setChallenges(current => [
        ...current.filter(c => c.type !== 'daily'),
        ...newChallenges
      ]);
    } catch (err) {
      console.error('Erreur lors de la génération des défis quotidiens:', err);
      throw err;
    }
  }, [driverId]);

  const generateWeeklyChallenges = useCallback(async () => {
    try {
      const newChallenges = await gamificationService.generateWeeklyChallenges(driverId);
      setChallenges(current => [
        ...current.filter(c => c.type !== 'weekly'),
        ...newChallenges
      ]);
    } catch (err) {
      console.error('Erreur lors de la génération des défis hebdomadaires:', err);
      throw err;
    }
  }, [driverId]);

  const claimReward = useCallback(async (challengeId: string) => {
    try {
      const reward = await gamificationService.claimChallengeReward(driverId, challengeId);
      await loadChallenges(); // Recharger les défis après avoir réclamé la récompense
      return reward;
    } catch (err) {
      console.error('Erreur lors de la réclamation de la récompense:', err);
      throw err;
    }
  }, [driverId, loadChallenges]);

  // Charger les défis au montage du composant
  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  // Vérifier et générer de nouveaux défis quotidiens à minuit
  useEffect(() => {
    const checkDailyChallenges = async () => {
      const now = new Date();
      const dailies = challenges.filter(c => c.type === 'daily');
      
      if (dailies.length === 0 || 
          dailies.some(c => new Date(c.endDate) < now)) {
        await generateDailyChallenges();
      }
    };

    const interval = setInterval(checkDailyChallenges, 60000); // Vérifier toutes les minutes
    checkDailyChallenges();

    return () => clearInterval(interval);
  }, [challenges, generateDailyChallenges]);

  // Vérifier et générer de nouveaux défis hebdomadaires le lundi à minuit
  useEffect(() => {
    const checkWeeklyChallenges = async () => {
      const now = new Date();
      const weeklies = challenges.filter(c => c.type === 'weekly');
      
      if (weeklies.length === 0 || 
          weeklies.some(c => new Date(c.endDate) < now)) {
        await generateWeeklyChallenges();
      }
    };

    const interval = setInterval(checkWeeklyChallenges, 3600000); // Vérifier toutes les heures
    checkWeeklyChallenges();

    return () => clearInterval(interval);
  }, [challenges, generateWeeklyChallenges]);

  return {
    challenges,
    loading,
    error,
    updateProgress,
    generateDailyChallenges,
    generateWeeklyChallenges,
    claimReward,
    loadChallenges
  };
};

export default useChallenges;
