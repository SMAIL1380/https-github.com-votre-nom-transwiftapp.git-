import { batteryOptimizer } from '../../../services/battery/BatteryOptimizer';
import { locationTrackingService } from '../../delivery-tracking/services/LocationTrackingService';
import { backgroundTaskManager } from '../../../services/battery/BackgroundTaskManager';

interface DeliveryLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface Delivery {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startTime?: number;
  endTime?: number;
  customerInfo: {
    name: string;
    address: string;
    phone?: string;
  };
  items: {
    id: string;
    name: string;
    quantity: number;
  }[];
  route?: {
    points: DeliveryLocation[];
    distance?: number;
    estimatedDuration?: number;
  };
}

class DeliveryService {
  private static instance: DeliveryService;
  private deliveries: Delivery[] = [];
  private currentDelivery?: Delivery;
  private readonly DELIVERY_UPDATE_TASK = 'delivery_update_task';

  private constructor() {
    this.initialize();
  }

  public static getInstance(): DeliveryService {
    if (!DeliveryService.instance) {
      DeliveryService.instance = new DeliveryService();
    }
    return DeliveryService.instance;
  }

  private async initialize() {
    // Configurer la tâche de mise à jour des livraisons
    await backgroundTaskManager.registerTask({
      id: this.DELIVERY_UPDATE_TASK,
      handler: async () => {
        await this.updateCurrentDelivery();
      },
      interval: batteryOptimizer.getRecommendedSyncInterval(),
      priority: 'normal',
      requiresNetwork: true,
    });

    // S'abonner aux changements de batterie
    batteryOptimizer.subscribe(async () => {
      await this.updateTaskInterval();
    });
  }

  private async updateTaskInterval() {
    const interval = batteryOptimizer.getRecommendedSyncInterval();
    await backgroundTaskManager.unregisterTask(this.DELIVERY_UPDATE_TASK);
    await backgroundTaskManager.registerTask({
      id: this.DELIVERY_UPDATE_TASK,
      handler: async () => {
        await this.updateCurrentDelivery();
      },
      interval,
      priority: 'normal',
      requiresNetwork: true,
    });
  }

  private async updateCurrentDelivery() {
    if (!this.currentDelivery) return;

    try {
      // Obtenir les mises à jour de localisation
      const locationUpdates = locationTrackingService.getLocationUpdates(
        this.currentDelivery.id
      );

      if (locationUpdates.length > 0) {
        // Mettre à jour la route
        if (!this.currentDelivery.route) {
          this.currentDelivery.route = {
            points: [],
            distance: 0,
          };
        }

        // Ajouter les nouveaux points
        this.currentDelivery.route.points = [
          ...this.currentDelivery.route.points,
          ...locationUpdates.map(update => ({
            latitude: update.latitude,
            longitude: update.longitude,
            timestamp: update.timestamp,
          })),
        ];

        // Calculer la distance (simplifié)
        this.currentDelivery.route.distance = this.calculateTotalDistance(
          this.currentDelivery.route.points
        );
      }

      // TODO: Synchroniser avec le backend
    } catch (error) {
      console.error('Error updating current delivery:', error);
    }
  }

  private calculateTotalDistance(points: DeliveryLocation[]): number {
    let distance = 0;
    for (let i = 1; i < points.length; i++) {
      distance += this.calculateDistance(points[i - 1], points[i]);
    }
    return distance;
  }

  private calculateDistance(point1: DeliveryLocation, point2: DeliveryLocation): number {
    // Formule de Haversine pour calculer la distance entre deux points GPS
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // API Publique

  public async startDelivery(deliveryId: string): Promise<void> {
    const delivery = this.deliveries.find(d => d.id === deliveryId);
    if (!delivery) {
      throw new Error('Delivery not found');
    }

    // Arrêter la livraison en cours si elle existe
    if (this.currentDelivery) {
      await this.stopDelivery();
    }

    // Démarrer le suivi de localisation
    await locationTrackingService.startTracking(deliveryId);

    delivery.status = 'in_progress';
    delivery.startTime = Date.now();
    this.currentDelivery = delivery;
  }

  public async stopDelivery(status: 'completed' | 'failed' = 'completed'): Promise<void> {
    if (!this.currentDelivery) return;

    // Arrêter le suivi de localisation
    await locationTrackingService.stopTracking();

    this.currentDelivery.status = status;
    this.currentDelivery.endTime = Date.now();
    this.currentDelivery = undefined;
  }

  public async pauseDelivery(): Promise<void> {
    if (!this.currentDelivery) return;

    // Arrêter temporairement le suivi de localisation
    await locationTrackingService.stopTracking();
  }

  public async resumeDelivery(): Promise<void> {
    if (!this.currentDelivery) return;

    // Reprendre le suivi de localisation
    await locationTrackingService.startTracking(this.currentDelivery.id);
  }

  public getCurrentDelivery(): Delivery | undefined {
    return this.currentDelivery;
  }

  public getDeliveries(): Delivery[] {
    return [...this.deliveries];
  }

  public getDeliveryById(id: string): Delivery | undefined {
    return this.deliveries.find(d => d.id === id);
  }
}

export const deliveryService = DeliveryService.getInstance();
