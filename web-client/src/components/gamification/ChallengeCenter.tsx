import React, { useState, useEffect } from 'react';
import { Challenge } from '../../types/gamification';
import { gamificationService } from '../../services/GamificationService';
import './ChallengeCenter.css';

interface ChallengeCategoryProps {
  title: string;
  challenges: Challenge[];
  onChallengeClick: (challenge: Challenge) => void;
}

const ChallengeCategory: React.FC<ChallengeCategoryProps> = ({
  title,
  challenges,
  onChallengeClick
}) => (
  <div className="challenge-category">
    <h3>{title}</h3>
    <div className="challenges-list">
      {challenges.map(challenge => (
        <div
          key={challenge.id}
          className={`challenge-item ${challenge.status}`}
          onClick={() => onChallengeClick(challenge)}
        >
          <div className="challenge-header">
            <h4>{challenge.title}</h4>
            <span className="points">{challenge.points} pts</span>
          </div>
          <p>{challenge.description}</p>
          <div className="challenge-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(challenge.requirements.current / challenge.requirements.target) * 100}%`
                }}
              />
            </div>
            <span className="progress-text">
              {challenge.requirements.current} / {challenge.requirements.target}
              {challenge.requirements.type === 'deliveries' && ' livraisons'}
              {challenge.requirements.type === 'ratings' && ' étoiles'}
              {challenge.requirements.type === 'time' && ' minutes'}
              {challenge.requirements.type === 'distance' && ' km'}
            </span>
          </div>
          <div className="challenge-footer">
            <span className="time-remaining">
              {new Date(challenge.endDate).toLocaleDateString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            {challenge.status === 'completed' && (
              <span className="status-badge completed">Complété ✓</span>
            )}
            {challenge.status === 'failed' && (
              <span className="status-badge failed">Échoué ✗</span>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ChallengeCenter: React.FC = () => {
  const [dailyChallenges, setDailyChallenges] = useState<Challenge[]>([]);
  const [weeklyChallenges, setWeeklyChallenges] = useState<Challenge[]>([]);
  const [specialChallenges, setSpecialChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  useEffect(() => {
    loadChallenges();
    const interval = setInterval(loadChallenges, 60000); // Rafraîchir toutes les minutes
    return () => clearInterval(interval);
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const challenges = await gamificationService.getChallenges();
      
      setDailyChallenges(challenges.filter(c => c.type === 'daily'));
      setWeeklyChallenges(challenges.filter(c => c.type === 'weekly'));
      setSpecialChallenges(challenges.filter(c => c.type === 'special'));
      
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des défis');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
  };

  const handleCloseModal = () => {
    setSelectedChallenge(null);
  };

  if (loading) {
    return <div className="loading-state">Chargement des défis...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  return (
    <div className="challenge-center">
      <div className="challenge-center-header">
        <h2>Centre des Défis</h2>
        <div className="challenge-stats">
          <div className="stat">
            <span className="label">Défis Complétés</span>
            <span className="value">
              {[...dailyChallenges, ...weeklyChallenges, ...specialChallenges].filter(
                c => c.status === 'completed'
              ).length}
            </span>
          </div>
          <div className="stat">
            <span className="label">Points Gagnés</span>
            <span className="value">
              {[...dailyChallenges, ...weeklyChallenges, ...specialChallenges]
                .filter(c => c.status === 'completed')
                .reduce((sum, c) => sum + c.points, 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="challenges-container">
        {dailyChallenges.length > 0 && (
          <ChallengeCategory
            title="Défis Quotidiens"
            challenges={dailyChallenges}
            onChallengeClick={handleChallengeClick}
          />
        )}

        {weeklyChallenges.length > 0 && (
          <ChallengeCategory
            title="Défis Hebdomadaires"
            challenges={weeklyChallenges}
            onChallengeClick={handleChallengeClick}
          />
        )}

        {specialChallenges.length > 0 && (
          <ChallengeCategory
            title="Défis Spéciaux"
            challenges={specialChallenges}
            onChallengeClick={handleChallengeClick}
          />
        )}
      </div>

      {selectedChallenge && (
        <div className="challenge-modal">
          <div className="modal-content">
            <h3>{selectedChallenge.title}</h3>
            <p>{selectedChallenge.description}</p>
            <div className="modal-details">
              <div className="detail">
                <span className="label">Points :</span>
                <span className="value">{selectedChallenge.points}</span>
              </div>
              <div className="detail">
                <span className="label">Progression :</span>
                <span className="value">
                  {selectedChallenge.requirements.current} / {selectedChallenge.requirements.target}
                </span>
              </div>
              <div className="detail">
                <span className="label">Expire le :</span>
                <span className="value">
                  {new Date(selectedChallenge.endDate).toLocaleDateString('fr-FR', {
                    dateStyle: 'full',
                    timeStyle: 'short'
                  })}
                </span>
              </div>
            </div>
            <button className="close-button" onClick={handleCloseModal}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeCenter;
