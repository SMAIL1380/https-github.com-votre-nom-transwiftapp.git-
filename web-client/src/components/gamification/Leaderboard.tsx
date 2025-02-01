import React, { useState, useEffect } from 'react';
import { gamificationService } from '../../services/GamificationService';
import './Leaderboard.css';

interface LeaderboardEntry {
  driverId: string;
  name: string;
  points: number;
  rank: number;
  avatar?: string;
}

type TimeFrame = 'daily' | 'weekly' | 'monthly';

const Leaderboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<TimeFrame>('weekly');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDriverId, setCurrentDriverId] = useState<string>(''); // À récupérer depuis le contexte d'auth

  useEffect(() => {
    loadLeaderboard();
  }, [timeframe]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await gamificationService.getLeaderboard(timeframe);
      setLeaderboard(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement du classement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getOrdinalSuffix = (rank: number): string => {
    if (rank === 1) return 'er';
    return 'ème';
  };

  const getRankStyle = (rank: number): string => {
    switch (rank) {
      case 1:
        return 'rank-gold';
      case 2:
        return 'rank-silver';
      case 3:
        return 'rank-bronze';
      default:
        return '';
    }
  };

  const getTimeframeLabel = (timeframe: TimeFrame): string => {
    switch (timeframe) {
      case 'daily':
        return 'Aujourd\'hui';
      case 'weekly':
        return 'Cette Semaine';
      case 'monthly':
        return 'Ce Mois';
      default:
        return '';
    }
  };

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h2>Classement des Chauffeurs</h2>
        <div className="timeframe-selector">
          <button
            className={timeframe === 'daily' ? 'active' : ''}
            onClick={() => setTimeframe('daily')}
          >
            Journalier
          </button>
          <button
            className={timeframe === 'weekly' ? 'active' : ''}
            onClick={() => setTimeframe('weekly')}
          >
            Hebdomadaire
          </button>
          <button
            className={timeframe === 'monthly' ? 'active' : ''}
            onClick={() => setTimeframe('monthly')}
          >
            Mensuel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Chargement du classement...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : (
        <>
          <div className="timeframe-label">
            {getTimeframeLabel(timeframe)}
          </div>

          <div className="leaderboard-content">
            {leaderboard.map((entry) => (
              <div
                key={entry.driverId}
                className={`leaderboard-entry ${
                  entry.driverId === currentDriverId ? 'current-driver' : ''
                } ${getRankStyle(entry.rank)}`}
              >
                <div className="rank">
                  {entry.rank}
                  <sup>{getOrdinalSuffix(entry.rank)}</sup>
                </div>
                <div className="driver-info">
                  {entry.avatar ? (
                    <img
                      src={entry.avatar}
                      alt={`Avatar de ${entry.name}`}
                      className="avatar"
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {entry.name.charAt(0)}
                    </div>
                  )}
                  <span className="name">{entry.name}</span>
                </div>
                <div className="points">
                  {entry.points} pts
                </div>
              </div>
            ))}
          </div>

          {leaderboard.length === 0 && (
            <div className="empty-state">
              Aucune donnée disponible pour cette période
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Leaderboard;
