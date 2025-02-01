import React from 'react';
import { Challenge } from '../../types/gamification';
import './ChallengeModal.css';

interface ChallengeModalProps {
  challenge: Challenge;
  onAccept: () => void;
  onDecline: () => void;
  onClose: () => void;
}

export default function ChallengeModal({
  challenge,
  onAccept,
  onDecline,
  onClose
}: ChallengeModalProps) {
  const timeLeft = () => {
    const now = new Date();
    const end = new Date(challenge.endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expiré';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''}`;
    }
    
    return `${hours}h ${minutes}m restantes`;
  };

  const renderRequirements = () => {
    const { type, target } = challenge.requirements;
    
    switch (type) {
      case 'deliveries':
        return `Effectuer ${target} livraison${target > 1 ? 's' : ''}`;
      case 'ratings':
        return `Obtenir ${target} étoile${target > 1 ? 's' : ''} de notation`;
      case 'time':
        return `Maintenir un temps de livraison sous ${target} minutes`;
      case 'distance':
        return `Parcourir ${target} km`;
      default:
        return 'Conditions spéciales';
    }
  };

  return (
    <div className="challenge-modal-overlay" onClick={onClose}>
      <div className="challenge-modal" onClick={e => e.stopPropagation()}>
        <div className="challenge-header">
          <div className="challenge-type-badge">
            {challenge.type === 'daily' ? '📅 Défi Quotidien' : 
             challenge.type === 'weekly' ? '📆 Défi Hebdomadaire' : 
             '🌟 Défi Spécial'}
          </div>
          <h2>{challenge.title}</h2>
          <div className="time-remaining">{timeLeft()}</div>
        </div>

        <div className="challenge-content">
          <div className="challenge-description">
            <p>{challenge.description}</p>
          </div>

          <div className="challenge-requirements">
            <h3>Objectifs</h3>
            <div className="requirements-card">
              <div className="requirement-text">
                {renderRequirements()}
              </div>
              <div className="requirement-progress">
                <div className="progress-text">
                  {challenge.requirements.current} / {challenge.requirements.target}
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${(challenge.requirements.current / challenge.requirements.target) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="challenge-rewards">
            <h3>Récompenses</h3>
            <div className="rewards-list">
              <div className="reward-item">
                <span className="reward-icon">🏆</span>
                <span className="reward-value">{challenge.points} points</span>
              </div>
            </div>
          </div>
        </div>

        <div className="challenge-actions">
          <button
            onClick={onDecline}
            className="decline-button"
          >
            Décliner
          </button>
          <button
            onClick={onAccept}
            className="accept-button"
          >
            Accepter le Défi
          </button>
        </div>
      </div>
    </div>
  );
}
