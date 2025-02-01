import React from 'react';
import { Achievement } from '../../types/gamification';
import './AchievementModal.css';

interface AchievementModalProps {
  achievement: Achievement;
  onClose: () => void;
  onShare?: () => void;
}

export default function AchievementModal({
  achievement,
  onClose,
  onShare
}: AchievementModalProps) {
  return (
    <div className="achievement-modal-overlay" onClick={onClose}>
      <div className="achievement-modal" onClick={e => e.stopPropagation()}>
        <div className="achievement-header">
          <div className="achievement-icon-large">{achievement.icon}</div>
          <h2>Succès Débloqué !</h2>
        </div>

        <div className="achievement-content">
          <h3>{achievement.name}</h3>
          <p className="achievement-description">{achievement.description}</p>
          
          <div className="achievement-rewards">
            <div className="points-reward">
              <span className="points-icon">🏆</span>
              <span className="points-value">+{achievement.points} points</span>
            </div>
          </div>

          <div className="achievement-progress">
            <div className="progress-text">
              {achievement.progress} / {achievement.maxProgress}
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{
                  width: `${(achievement.progress / achievement.maxProgress) * 100}%`
                }}
              />
            </div>
          </div>
        </div>

        <div className="achievement-actions">
          {onShare && (
            <button
              onClick={onShare}
              className="share-button"
            >
              Partager
            </button>
          )}
          <button
            onClick={onClose}
            className="close-button"
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}
