import React from 'react';
import { Level, Reward } from '../../types/gamification';
import './LevelUpModal.css';

interface LevelUpModalProps {
  previousLevel: Level;
  newLevel: Level;
  rewards: Reward[];
  onClose: () => void;
  onClaim: () => void;
}

export default function LevelUpModal({
  previousLevel,
  newLevel,
  rewards,
  onClose,
  onClaim
}: LevelUpModalProps) {
  return (
    <div className="level-up-modal-overlay" onClick={onClose}>
      <div className="level-up-modal" onClick={e => e.stopPropagation()}>
        <div className="level-up-header">
          <div className="level-transition">
            <div className="previous-level">
              <span className="level-icon">{previousLevel.icon}</span>
              <span className="level-name">{previousLevel.name}</span>
            </div>
            <div className="level-arrow">➜</div>
            <div className="new-level">
              <span className="level-icon">{newLevel.icon}</span>
              <span className="level-name">{newLevel.name}</span>
            </div>
          </div>
          <h2>Niveau Supérieur !</h2>
        </div>

        <div className="level-up-content">
          <div className="level-benefits">
            <h3>Nouveaux Avantages</h3>
            <ul className="benefits-list">
              {newLevel.rewards.map((reward, index) => (
                <li key={reward.id} className="benefit-item">
                  <span className="benefit-icon">{reward.icon}</span>
                  <div className="benefit-details">
                    <h4>{reward.name}</h4>
                    <p>{reward.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {rewards.length > 0 && (
            <div className="level-rewards">
              <h3>Récompenses Débloquées</h3>
              <div className="rewards-grid">
                {rewards.map(reward => (
                  <div key={reward.id} className="reward-card">
                    <div className="reward-icon">{reward.icon}</div>
                    <h4>{reward.name}</h4>
                    <p>{reward.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="next-level-info">
            <h3>Prochain Niveau</h3>
            <div className="next-level-progress">
              <div className="progress-text">
                {newLevel.minPoints} / {newLevel.maxPoints} points
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{
                    width: '0%'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="level-up-actions">
          {rewards.length > 0 && (
            <button
              onClick={onClaim}
              className="claim-button"
            >
              Réclamer les Récompenses
            </button>
          )}
          <button
            onClick={onClose}
            className="continue-button"
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}
