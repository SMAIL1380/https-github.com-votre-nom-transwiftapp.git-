import { DriverStats, Challenge, Achievement, Reward, Level } from '../types/gamification';

class GamificationService {
  private readonly API_URL = '/api/gamification';

  async getDriverStats(driverId: string): Promise<DriverStats> {
    try {
      const response = await fetch(`${this.API_URL}/stats/${driverId}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }
      return await response.json();
    } catch (error) {
      console.error('GamificationService Error:', error);
      throw error;
    }
  }

  async completeChallenge(driverId: string, challengeId: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_URL}/challenges/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driverId, challengeId }),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la validation du défi');
      }
    } catch (error) {
      console.error('GamificationService Error:', error);
      throw error;
    }
  }

  async claimReward(driverId: string, rewardId: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_URL}/rewards/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driverId, rewardId }),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la réclamation de la récompense');
      }
    } catch (error) {
      console.error('GamificationService Error:', error);
      throw error;
    }
  }

  calculateProgress(currentPoints: number, level: Level): number {
    const totalLevelPoints = level.maxPoints - level.minPoints;
    const currentLevelPoints = currentPoints - level.minPoints;
    return Math.min(100, (currentLevelPoints / totalLevelPoints) * 100);
  }

  async updateDeliveryStats(
    driverId: string,
    deliveryId: string,
    stats: {
      distance: number;
      duration: number;
      rating?: number;
    }
  ): Promise<void> {
    try {
      const response = await fetch(`${this.API_URL}/delivery/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverId,
          deliveryId,
          stats,
        }),
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour des statistiques');
      }
    } catch (error) {
      console.error('GamificationService Error:', error);
      throw error;
    }
  }

  async getLeaderboard(timeframe: 'daily' | 'weekly' | 'monthly'): Promise<Array<{
    driverId: string;
    name: string;
    points: number;
    rank: number;
    avatar?: string;
  }>> {
    try {
      const response = await fetch(`${this.API_URL}/leaderboard/${timeframe}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du classement');
      }
      return await response.json();
    } catch (error) {
      console.error('GamificationService Error:', error);
      throw error;
    }
  }

  async getChallenges(): Promise<Challenge[]> {
    try {
      const response = await fetch(`${this.API_URL}/challenges`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des défis');
      }
      return await response.json();
    } catch (error) {
      console.error('GamificationService Error:', error);
      throw error;
    }
  }

  async updateChallengeProgress(
    driverId: string,
    challengeId: string,
    progress: {
      type: 'deliveries' | 'ratings' | 'time' | 'distance';
      value: number;
    }
  ): Promise<void> {
    try {
      const response = await fetch(`${this.API_URL}/challenges/${challengeId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverId,
          progress,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du progrès du défi');
      }
    } catch (error) {
      console.error('GamificationService Error:', error);
      throw error;
    }
  }

  async generateDailyChallenges(driverId: string): Promise<Challenge[]> {
    try {
      const response = await fetch(`${this.API_URL}/challenges/generate/daily`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driverId }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la génération des défis quotidiens');
      }
      
      return await response.json();
    } catch (error) {
      console.error('GamificationService Error:', error);
      throw error;
    }
  }

  async generateWeeklyChallenges(driverId: string): Promise<Challenge[]> {
    try {
      const response = await fetch(`${this.API_URL}/challenges/generate/weekly`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driverId }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la génération des défis hebdomadaires');
      }
      
      return await response.json();
    } catch (error) {
      console.error('GamificationService Error:', error);
      throw error;
    }
  }

  async claimChallengeReward(driverId: string, challengeId: string): Promise<{
    points: number;
    rewards: Reward[];
  }> {
    try {
      const response = await fetch(`${this.API_URL}/challenges/${challengeId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driverId }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la réclamation de la récompense');
      }
      
      return await response.json();
    } catch (error) {
      console.error('GamificationService Error:', error);
      throw error;
    }
  }
}

export const gamificationService = new GamificationService();
