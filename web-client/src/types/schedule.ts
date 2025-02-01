export enum ScheduleType {
  DELIVERY = 'DELIVERY',
  MAINTENANCE = 'MAINTENANCE',
  TRAINING = 'TRAINING',
  MEETING = 'MEETING',
  OTHER = 'OTHER',
}

export enum SchedulePriority {
  HIGH = 'HIGH',
  NORMAL = 'NORMAL',
  LOW = 'LOW',
}

export enum ScheduleStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Schedule {
  id?: string;
  title: string;
  type: ScheduleType;
  priority: SchedulePriority;
  status: ScheduleStatus;
  startDate: string | Date;
  endDate: string | Date;
  driverId: string;
  vehicleId: string;
  deliveryIds: string[];
  notes?: string;
  color?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  createdBy?: string;
  updatedBy?: string;
  recurrence?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string | Date;
    daysOfWeek?: number[];
  };
  constraints?: {
    maxDuration?: number;
    requiredBreaks?: {
      after: number;
      duration: number;
    }[];
    restrictions?: {
      type: string;
      value: any;
    }[];
  };
  statistics?: {
    distance?: number;
    duration?: number;
    fuelConsumption?: number;
    co2Emissions?: number;
    completionRate?: number;
    delayRate?: number;
  };
}

export interface ScheduleFilters {
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  types?: ScheduleType[];
  priorities?: SchedulePriority[];
  status?: ScheduleStatus[];
  driverIds?: string[];
  vehicleIds?: string[];
  showCompleted?: boolean;
  showCancelled?: boolean;
  minDuration?: number;
  maxDuration?: number;
  keywords?: string;
}

export interface ScheduleOptimizationResult {
  schedules: Schedule[];
  metrics: {
    totalDistance: number;
    totalDuration: number;
    fuelConsumption: number;
    co2Emissions: number;
    driverUtilization: { [key: string]: number };
    vehicleUtilization: { [key: string]: number };
    savings: {
      distance: number;
      duration: number;
      fuel: number;
      co2: number;
    };
  };
  recommendations: {
    type: string;
    description: string;
    impact: {
      metric: string;
      value: number;
      unit: string;
    };
  }[];
}
