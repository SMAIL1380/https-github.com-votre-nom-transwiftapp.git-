export interface Level {
  id: number;
  name: string;
  minPoints: number;
  maxPoints: number;
  rewards: Reward[];
  icon: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  icon: string;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
  category: 'daily' | 'weekly' | 'special';
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  startDate: Date;
  endDate: Date;
  type: 'daily' | 'weekly' | 'special';
  requirements: {
    type: 'deliveries' | 'ratings' | 'time' | 'distance';
    target: number;
    current: number;
  };
  status: 'active' | 'completed' | 'failed';
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'badge' | 'bonus' | 'privilege';
  icon: string;
  isOwned: boolean;
}

export interface DriverStats {
  totalPoints: number;
  currentLevel: Level;
  weeklyPoints: number;
  monthlyPoints: number;
  totalDeliveries: number;
  averageRating: number;
  achievements: Achievement[];
  activeChallenges: Challenge[];
  completedChallenges: Challenge[];
  rewards: Reward[];
}
