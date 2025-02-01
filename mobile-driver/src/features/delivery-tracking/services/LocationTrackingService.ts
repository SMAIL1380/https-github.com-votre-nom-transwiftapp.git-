import { locationOptimizer } from '../../../services/battery/LocationOptimizer';
import { batteryOptimizer } from '../../../services/battery/BatteryOptimizer';
import { backgroundTaskManager } from '../../../services/battery/BackgroundTaskManager';

interface LocationUpdate {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  deliveryId?: string;
  speed?: number;
}

class LocationTrackingService {
  private static instance: LocationTrackingService;
  private locationUpdates: LocationUpdate[] = [];
  private currentDeliveryId?: string;
  private readonly LOCATION_TASK = 'location_tracking_task';

  private constructor() {
    this.initialize();
  }

  public static getInstance(): LocationTrackingService {
    if (!LocationTrackingService.instance) {
      LocationTrackingService.instance = new LocationTrackingService();
    }
    return LocationTrackingService.instance;
  }

  private async initialize() {
    // Configurer la tâche de suivi en arrière-plan
    await backgroundTaskManager.registerTask({
      id: this.LOCATION_TASK,
      handler: async () => {
        await this.updateLocation();
      },
      interval: batteryOptimizer.getRecommendedLocationInterval(),
      priority: 'high',
      requiresNetwork: false,
    });

    // S'abonner aux changements de batterie
    batteryOptimizer.subscribe(() => {
      this.updateTrackingConfig();
    });
  }

  private async updateTrackingConfig() {
    if (locationOptimizer.isLocationTracking()) {
      await locationOptimizer.stopTracking();
      await this.startTracking(this.currentDeliveryId);
    }
  }

  private async updateLocation() {
    try {
      const location = await locationOptimizer.getCurrentLocation();
      
      const locationUpdate: LocationUpdate = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
        accuracy: location.coords.accuracy,
        deliveryId: this.currentDeliveryId,
        speed: location.coords.speed || undefined,
      };

      this.locationUpdates.push(locationUpdate);

      // Nettoyer les anciennes mises à jour
      this.cleanOldUpdates();

      // Synchroniser si nécessaire
      await this.syncLocationUpdates();
    } catch (error) {
      console.error('Error updating location:', error);
    }
  }

  private cleanOldUpdates(maxAge: number = 24 * 60 * 60 * 1000) { // 24 heures
    const now = Date.now();
    this.locationUpdates = this.locationUpdates.filter(
      update => now - update.timestamp <= maxAge
    );
  }

  private async syncLocationUpdates() {
    // TODO: Implémenter la synchronisation avec le backend
  }

  // API Publique

  public async startTracking(deliveryId?: string): Promise<void> {
    this.currentDeliveryId = deliveryId;

    await locationOptimizer.startTracking(async (location) => {
      const update: LocationUpdate = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
        accuracy: location.coords.accuracy,
        deliveryId: this.currentDeliveryId,
        speed: location.coords.speed || undefined,
      };

      this.locationUpdates.push(update);
    });
  }

  public async stopTracking(): Promise<void> {
    await locationOptimizer.stopTracking();
    this.currentDeliveryId = undefined;
  }

  public getLocationUpdates(deliveryId?: string): LocationUpdate[] {
    if (deliveryId) {
      return this.locationUpdates.filter(
        update => update.deliveryId === deliveryId
      );
    }
    return [...this.locationUpdates];
  }

  public async getCurrentLocation(): Promise<LocationUpdate> {
    const location = await locationOptimizer.getCurrentLocation();
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: location.timestamp,
      accuracy: location.coords.accuracy,
      deliveryId: this.currentDeliveryId,
      speed: location.coords.speed || undefined,
    };
  }

  public isTracking(): boolean {
    return locationOptimizer.isLocationTracking();
  }

  public getTrackingConfig() {
    return locationOptimizer.getLocationConfig();
  }
}

export const locationTrackingService = LocationTrackingService.getInstance();
