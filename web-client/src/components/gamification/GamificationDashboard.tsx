import React, { useState, useEffect } from 'react';
import { DriverStats, Challenge, Achievement } from '../../types/gamification';
import Leaderboard from './Leaderboard';
import './GamificationDashboard.css';

const GamificationDashboard: React.FC = () => {
  const [driverStats, setDriverStats] = useState<DriverStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch driver stats from API
    loadDriverStats();
  }, []);

  const loadDriverStats = async () => {
    try {
      // Simuler un appel API
      const mockStats: DriverStats = {
        totalPoints: 1250,
        currentLevel: {
          id: 3,
          name: "Expert",
          minPoints: 1000,
          maxPoints: 2000,
          rewards: [],
          icon: "🌟"
        },
        weeklyPoints: 250,
        monthlyPoints: 850,
        totalDeliveries: 145,
        averageRating: 4.8,
        achievements: [],
        activeChallenges: [],
        completedChallenges: [],
        rewards: []
      };
      setDriverStats(mockStats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    return (
      <div className="progress-bar-container">
        <div 
          className="progress-bar" 
          style={{ width: `${percentage}%` }}
        />
        <span className="progress-text">{current} / {max} points</span>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (!driverStats) {
    return <div className="error">Erreur de chargement des données</div>;
  }

  return (
    <div className="gamification-dashboard">
      <div className="dashboard-grid">
        <div className="main-content">
          <div className="header-section">
            <h1>Tableau de Bord Performance</h1>
            <div className="level-info">
              <span className="level-icon">{driverStats.currentLevel.icon}</span>
              <span className="level-name">Niveau {driverStats.currentLevel.name}</span>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Points Totaux</h3>
              <div className="stat-value">{driverStats.totalPoints}</div>
              {renderProgressBar(
                driverStats.totalPoints - driverStats.currentLevel.minPoints,
                driverStats.currentLevel.maxPoints - driverStats.currentLevel.minPoints
              )}
            </div>

            <div className="stat-card">
              <h3>Cette Semaine</h3>
              <div className="stat-value">{driverStats.weeklyPoints}</div>
            </div>

            <div className="stat-card">
              <h3>Ce Mois</h3>
              <div className="stat-value">{driverStats.monthlyPoints}</div>
            </div>

            <div className="stat-card">
              <h3>Livraisons Totales</h3>
              <div className="stat-value">{driverStats.totalDeliveries}</div>
            </div>
          </div>

          <div className="challenges-section">
            <h2>Défis Actifs</h2>
            <div className="challenges-grid">
              {driverStats.activeChallenges.map(challenge => (
                <div key={challenge.id} className="challenge-card">
                  <h3>{challenge.title}</h3>
                  <p>{challenge.description}</p>
                  {renderProgressBar(
                    challenge.requirements.current,
                    challenge.requirements.target
                  )}
                  <div className="challenge-reward">
                    Récompense: {challenge.points} points
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="achievements-section">
            <h2>Succès Débloqués</h2>
            <div className="achievements-grid">
              {driverStats.achievements
                .filter(achievement => achievement.isUnlocked)
                .map(achievement => (
                  <div key={achievement.id} className="achievement-card">
                    <div className="achievement-icon">{achievement.icon}</div>
                    <h3>{achievement.name}</h3>
                    <p>{achievement.description}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="sidebar">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
};

export default GamificationDashboard;
