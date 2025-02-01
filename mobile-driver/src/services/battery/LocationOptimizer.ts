import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { batteryOptimizer } from './BatteryOptimizer';

interface LocationConfig {
  accuracy: Location.Accuracy;
  distanceInterval: number;
  timeInterval: number;
}

class LocationOptimizer {
  private isTracking: boolean = false;
  private locationSubscription: Location.LocationSubscription | null = null;
  private currentConfig: LocationConfig | null = null;

  private readonly configProfiles: { [key: string]: LocationConfig } = {
    highAccuracy: {
      accuracy: Location.Accuracy.High,
      distanceInterval: 10, // 10 mètres
      timeInterval: 5000, // 5 secondes
    },
    balanced: {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 30, // 30 mètres
      timeInterval: 15000, // 15 secondes
    },
    lowPower: {
      accuracy: Location.Accuracy.Low,
      distanceInterval: 100, // 100 mètres
      timeInterval: 30000, // 30 secondes
    },
  };

  constructor() {
    this.initializeLocationServices();
    this.setupBatteryOptimization();
  }

  private async initializeLocationServices() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      if (Platform.OS === 'android') {
        await Location.enableNetworkProviderAsync();
      }
    } catch (error) {
      console.error('Error initializing location services:', error);
    }
  }

  private setupBatteryOptimization() {
    batteryOptimizer.subscribe(() => {
      if (this.isTracking) {
        this.updateLocationConfig();
      }
    });
  }

  private getOptimalConfig(): LocationConfig {
    const batteryInfo = batteryOptimizer.getCurrentBatteryInfo();

    if (batteryInfo.isCharging) {
      return this.configProfiles.highAccuracy;
    }

    if (batteryInfo.lowPowerMode || batteryInfo.level <= 0.15) {
      return this.configProfiles.lowPower;
    }

    return this.configProfiles.balanced;
  }

  private async updateLocationConfig() {
    const newConfig = this.getOptimalConfig();

    // Si la configuration n'a pas changé, ne rien faire
    if (
      this.currentConfig &&
      this.currentConfig.accuracy === newConfig.accuracy &&
      this.currentConfig.distanceInterval === newConfig.distanceInterval &&
      this.currentConfig.timeInterval === newConfig.timeInterval
    ) {
      return;
    }

    // Mettre à jour le tracking avec la nouvelle configuration
    await this.stopTracking();
    await this.startTracking();
  }

  // API Publique

  public async startTracking(onLocation?: (location: Location.LocationObject) => void): Promise<void> {
    if (this.isTracking) {
      return;
    }

    try {
      const config = this.getOptimalConfig();
      this.currentConfig = config;

      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: config.accuracy,
          distanceInterval: config.distanceInterval,
          timeInterval: config.timeInterval,
        },
        (location) => {
          if (onLocation) {
            onLocation(location);
          }
        }
      );

      this.isTracking = true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      throw error;
    }
  }

  public async stopTracking(): Promise<void> {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
    this.isTracking = false;
  }

  public async getCurrentLocation(): Promise<Location.LocationObject> {
    const config = this.getOptimalConfig();
    return await Location.getCurrentPositionAsync({
      accuracy: config.accuracy,
    });
  }

  public isLocationTracking(): boolean {
    return this.isTracking;
  }

  public getLocationConfig(): LocationConfig | null {
    return this.currentConfig;
  }
}

export const locationOptimizer = new LocationOptimizer();
