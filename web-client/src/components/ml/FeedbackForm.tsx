import React, { useState } from 'react';
import { feedbackService } from '../../services/FeedbackService';
import { ModelFeedback } from '../../types/feedback';
import './FeedbackForm.css';

interface FeedbackFormProps {
  modelId: string;
  onSubmit?: (feedback: ModelFeedback) => void;
  onCancel?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ modelId, onSubmit, onCancel }) => {
  const [type, setType] = useState<ModelFeedback['type']>('prediction');
  const [severity, setSeverity] = useState<ModelFeedback['severity']>('medium');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const feedback: Omit<ModelFeedback, 'id'> = {
        modelId,
        timestamp: new Date(),
        type,
        severity,
        source: 'user',
        status: 'new'
      };

      const result = await feedbackService.submitFeedback(feedback);
      onSubmit?.(result as ModelFeedback);
    } catch (err) {
      setError('Erreur lors de la soumission du feedback');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-form">
      <h2>Soumettre un Feedback</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="type">Type de Feedback</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as ModelFeedback['type'])}
            disabled={loading}
          >
            <option value="prediction">Prédiction</option>
            <option value="performance">Performance</option>
            <option value="error">Erreur</option>
            <option value="suggestion">Suggestion</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="severity">Sévérité</label>
          <select
            id="severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as ModelFeedback['severity'])}
            disabled={loading}
          >
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Élevée</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            rows={4}
            placeholder="Décrivez votre feedback..."
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-button"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Envoi...' : 'Soumettre'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;
