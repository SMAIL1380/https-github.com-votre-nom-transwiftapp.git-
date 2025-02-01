'use client';

import { useState, useEffect } from 'react';
import {
  TrophyIcon,
  StarIcon,
  FireIcon,
  GiftIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  total: number;
  unlockedAt?: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  total: number;
  expiresAt: string;
  type: 'daily' | 'weekly' | 'special';
}

interface Level {
  current: number;
  experience: number;
  nextLevelExperience: number;
  rewards: {
    id: string;
    name: string;
    description: string;
    unlockedAt: number;
  }[];
}

interface RewardsCenterProps {
  driverId: string;
}

export default function RewardsCenter({ driverId }: RewardsCenterProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [level, setLevel] = useState<Level | null>(null);
  const [selectedTab, setSelectedTab] = useState<'badges' | 'challenges' | 'level'>('badges');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRewardsData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/drivers/${driverId}/rewards`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des récompenses');
        }

        const data = await response.json();
        setBadges(data.badges);
        setChallenges(data.challenges);
        setLevel(data.level);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRewardsData();
  }, [driverId]);

  const formatTimeLeft = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* En-tête */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Centre de Récompenses</h2>
        <p className="text-gray-600 mt-2">
          Gagnez des récompenses en accomplissant des défis
        </p>
      </div>

      {/* Niveau actuel */}
      {level && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold">Niveau {level.current}</span>
            <span className="text-sm text-gray-600">
              {level.experience} / {level.nextLevelExperience} XP
            </span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(level.experience / level.nextLevelExperience) * 100}%`,
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-primary-600 rounded-full"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setSelectedTab('badges')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium ${
            selectedTab === 'badges'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Badges
        </button>
        <button
          onClick={() => setSelectedTab('challenges')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium ${
            selectedTab === 'challenges'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Défis
        </button>
        <button
          onClick={() => setSelectedTab('level')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium ${
            selectedTab === 'level'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Niveau
        </button>
      </div>

      {/* Contenu des onglets */}
      <div className="mt-6">
        {selectedTab === 'badges' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${
                  badge.unlockedAt
                    ? 'border-primary-200 bg-primary-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                      badge.unlockedAt
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {badge.icon === 'trophy' && <TrophyIcon className="w-8 h-8" />}
                    {badge.icon === 'star' && <StarIcon className="w-8 h-8" />}
                    {badge.icon === 'fire' && <FireIcon className="w-8 h-8" />}
                  </div>
                  <h3 className="font-medium">{badge.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {badge.description}
                  </p>
                  {!badge.unlockedAt && (
                    <div className="w-full mt-3">
                      <div className="text-xs text-gray-600 mb-1">
                        {badge.progress} / {badge.total}
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600 rounded-full"
                          style={{
                            width: `${(badge.progress / badge.total) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {badge.unlockedAt && (
                    <span className="text-xs text-primary-600 mt-2">
                      Débloqué le{' '}
                      {new Date(badge.unlockedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {selectedTab === 'challenges' && (
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-lg border border-gray-200 bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium flex items-center">
                      {challenge.type === 'daily' && (
                        <FireIcon className="w-5 h-5 text-orange-500 mr-2" />
                      )}
                      {challenge.type === 'weekly' && (
                        <SparklesIcon className="w-5 h-5 text-purple-500 mr-2" />
                      )}
                      {challenge.type === 'special' && (
                        <GiftIcon className="w-5 h-5 text-pink-500 mr-2" />
                      )}
                      {challenge.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {challenge.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-primary-600 font-medium">
                      +{challenge.reward} XP
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Expire dans {formatTimeLeft(challenge.expiresAt)}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progression</span>
                    <span>
                      {challenge.progress} / {challenge.total}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(challenge.progress / challenge.total) * 100}%`,
                      }}
                      className="h-full bg-primary-600 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {selectedTab === 'level' && level && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary-600 mb-2">
                {level.current}
              </div>
              <p className="text-gray-600">Niveau actuel</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">
                Récompenses débloquées
              </h3>
              {level.rewards.map((reward) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-primary-50 border border-primary-100"
                >
                  <div className="flex items-center">
                    <GiftIcon className="w-6 h-6 text-primary-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {reward.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {reward.description}
                      </p>
                      <p className="text-xs text-primary-600 mt-1">
                        Débloqué au niveau {reward.unlockedAt}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
