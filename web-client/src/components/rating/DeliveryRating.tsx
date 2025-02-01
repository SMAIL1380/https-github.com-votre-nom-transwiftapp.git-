'use client';

import { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface RatingCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
}

const RATING_CRITERIA: RatingCriteria[] = [
  {
    id: 'punctuality',
    name: 'Ponctualité',
    description: 'Le livreur est-il arrivé dans les temps ?',
    weight: 0.35,
  },
  {
    id: 'professionalism',
    name: 'Professionnalisme',
    description: 'Le livreur était-il professionnel et courtois ?',
    weight: 0.25,
  },
  {
    id: 'package_condition',
    name: 'État du colis',
    description: 'Le colis est-il arrivé en bon état ?',
    weight: 0.25,
  },
  {
    id: 'communication',
    name: 'Communication',
    description: 'La communication était-elle claire et efficace ?',
    weight: 0.15,
  },
];

interface DeliveryRatingProps {
  deliveryId: string;
  driverId: string;
  onComplete: () => void;
}

export default function DeliveryRating({ deliveryId, driverId, onComplete }: DeliveryRatingProps) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(0);

  const calculateWeightedAverage = () => {
    let totalWeight = 0;
    let weightedSum = 0;

    RATING_CRITERIA.forEach((criteria) => {
      if (ratings[criteria.id]) {
        weightedSum += ratings[criteria.id] * criteria.weight;
        totalWeight += criteria.weight;
      }
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  };

  const handleRating = (criteriaId: string, value: number) => {
    setRatings((prev) => ({
      ...prev,
      [criteriaId]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const overallRating = calculateWeightedAverage();

    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          deliveryId,
          driverId,
          ratings,
          overallRating,
          comment,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de la notation');
      }

      onComplete();
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCriteria = RATING_CRITERIA[step];
  const isLastStep = step === RATING_CRITERIA.length;
  const canProceed = isLastStep ? true : !!ratings[currentCriteria?.id];

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">
          Évaluez votre livraison
        </h2>
        <p className="text-gray-600 mt-2">
          Votre avis nous aide à améliorer notre service
        </p>
      </div>

      {!isLastStep ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">
              Question {step + 1}/{RATING_CRITERIA.length}
            </span>
            <span className="text-sm font-medium text-primary-600">
              {Math.round(((step + 1) / RATING_CRITERIA.length) * 100)}%
            </span>
          </div>

          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-primary-600 rounded-full transition-all duration-300"
              style={{
                width: `${((step + 1) / RATING_CRITERIA.length) * 100}%`,
              }}
            />
          </div>

          <div className="py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {currentCriteria.name}
            </h3>
            <p className="text-gray-600 mb-4">{currentCriteria.description}</p>

            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleRating(currentCriteria.id, value)}
                  className="p-2 focus:outline-none transition-transform hover:scale-110"
                >
                  {value <= (ratings[currentCriteria.id] || 0) ? (
                    <StarIconSolid className="h-8 w-8 text-yellow-400" />
                  ) : (
                    <StarIcon className="h-8 w-8 text-gray-300" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-4">
              {calculateWeightedAverage().toFixed(1)} / 5
            </div>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <StarIconSolid
                  key={value}
                  className={`h-6 w-6 ${
                    value <= calculateWeightedAverage()
                      ? 'text-yellow-400'
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Commentaire (optionnel)
            </label>
            <textarea
              id="comment"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="Partagez votre expérience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Retour
          </button>
        )}
        <button
          onClick={() => {
            if (isLastStep) {
              handleSubmit();
            } else {
              setStep((s) => s + 1);
            }
          }}
          disabled={!canProceed || isSubmitting}
          className={`px-6 py-2 rounded-md text-white ${
            canProceed && !isSubmitting
              ? 'bg-primary-600 hover:bg-primary-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isLastStep
            ? isSubmitting
              ? 'Envoi en cours...'
              : 'Terminer'
            : 'Suivant'}
        </button>
      </div>
    </div>
  );
}
