import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { BatteryManager, BatteryState } from 'react-native-battery';

interface BatteryInfo {
  level: number;
  isCharging: boolean;
  lowPowerMode: boolean;
}

interface PowerMode {
  syncInterval: number;
  locationInterval: number;
  backgroundTasks: boolean;
  screenBrightness: number;
}

class BatteryOptimizer {
  private batteryInfo: BatteryInfo = {
    level: 1,
    isCharging: false,
    lowPowerMode: false,
  };

  private readonly powerModes: { [key: string]: PowerMode } = {
    normal: {
      syncInterval: 5 * 60 * 1000, // 5 minutes
      locationInterval: 30 * 1000, // 30 secondes
      backgroundTasks: true,
      screenBrightness: 1,
    },
    lowBattery: {
      syncInterval: 15 * 60 * 1000, // 15 minutes
      locationInterval: 2 * 60 * 1000, // 2 minutes
      backgroundTasks: true,
      screenBrightness: 0.7,
    },
    critical: {
      syncInterval: 30 * 60 * 1000, // 30 minutes
      locationInterval: 5 * 60 * 1000, // 5 minutes
      backgroundTasks: false,
      screenBrightness: 0.5,
    },
  };

  private listeners: Set<(mode: PowerMode) => void> = new Set();

  constructor() {
    this.initializeBatteryMonitoring();
  }

  private async initializeBatteryMonitoring() {
    try {
      // Initialiser le monitoring de la batterie
      const batteryLevel = await BatteryManager.getBatteryLevel();
      const isCharging = await BatteryManager.isCharging();
      const lowPowerMode = await BatteryManager.isLowPowerMode();

      this.batteryInfo = {
        level: batteryLevel,
        isCharging,
        lowPowerMode,
      };

      // Configurer les listeners
      const eventEmitter = new NativeEventEmitter(NativeModules.BatteryManager);

      eventEmitter.addListener('BatteryStatusDidChange', (status) => {
        this.updateBatteryInfo({
          level: status.level,
          isCharging: status.isCharging,
          lowPowerMode: this.batteryInfo.lowPowerMode,
        });
      });

      eventEmitter.addListener('PowerModeDidChange', (state) => {
        this.updateBatteryInfo({
          ...this.batteryInfo,
          lowPowerMode: state.lowPowerMode,
        });
      });

    } catch (error) {
      console.error('Error initializing battery monitoring:', error);
    }
  }

  private updateBatteryInfo(info: BatteryInfo) {
    this.batteryInfo = info;
    this.notifyListeners();
  }

  private getCurrentPowerMode(): PowerMode {
    const { level, isCharging, lowPowerMode } = this.batteryInfo;

    if (isCharging) {
      return this.powerModes.normal;
    }

    if (lowPowerMode || level <= 0.15) {
      return this.powerModes.critical;
    }

    if (level <= 0.3) {
      return this.powerModes.lowBattery;
    }

    return this.powerModes.normal;
  }

  private notifyListeners() {
    const currentMode = this.getCurrentPowerMode();
    this.listeners.forEach(listener => listener(currentMode));
  }

  // API Publique

  public subscribe(listener: (mode: PowerMode) => void): () => void {
    this.listeners.add(listener);
    listener(this.getCurrentPowerMode());

    return () => {
      this.listeners.delete(listener);
    };
  }

  public getCurrentBatteryInfo(): BatteryInfo {
    return { ...this.batteryInfo };
  }

  public shouldExecuteBackgroundTask(): boolean {
    return this.getCurrentPowerMode().backgroundTasks;
  }

  public getRecommendedSyncInterval(): number {
    return this.getCurrentPowerMode().syncInterval;
  }

  public getRecommendedLocationInterval(): number {
    return this.getCurrentPowerMode().locationInterval;
  }

  public getRecommendedBrightness(): number {
    return this.getCurrentPowerMode().screenBrightness;
  }

  public async optimizeForCurrentState(): Promise<void> {
    const mode = this.getCurrentPowerMode();

    // Ajuster la luminosité si possible
    if (Platform.OS === 'android') {
      try {
        await NativeModules.Brightness.setBrightnessLevel(mode.screenBrightness);
      } catch (error) {
        console.error('Error setting brightness:', error);
      }
    }

    // Notifier les listeners des changements
    this.notifyListeners();
  }
}

export const batteryOptimizer = new BatteryOptimizer();
