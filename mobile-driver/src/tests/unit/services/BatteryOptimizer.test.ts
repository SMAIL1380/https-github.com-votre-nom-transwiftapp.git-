import { batteryOptimizer } from '../../../services/battery/BatteryOptimizer';
import { BatteryManager } from 'react-native-battery';

jest.mock('react-native-battery', () => ({
  BatteryManager: {
    getBatteryLevel: jest.fn(),
    isCharging: jest.fn(),
    isLowPowerMode: jest.fn(),
  },
}));

describe('BatteryOptimizer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Battery State Management', () => {
    it('should correctly detect low battery state', async () => {
      // Mock battery level at 15%
      (BatteryManager.getBatteryLevel as jest.Mock).mockResolvedValue(0.15);
      (BatteryManager.isCharging as jest.Mock).mockResolvedValue(false);
      (BatteryManager.isLowPowerMode as jest.Mock).mockResolvedValue(false);

      const info = await batteryOptimizer.getCurrentBatteryInfo();
      expect(info.level).toBe(0.15);
      expect(info.isCharging).toBe(false);
      expect(batteryOptimizer.shouldExecuteBackgroundTask()).toBe(false);
    });

    it('should allow background tasks when charging', async () => {
      (BatteryManager.getBatteryLevel as jest.Mock).mockResolvedValue(0.15);
      (BatteryManager.isCharging as jest.Mock).mockResolvedValue(true);
      
      expect(batteryOptimizer.shouldExecuteBackgroundTask()).toBe(true);
    });

    it('should adjust sync interval based on battery level', async () => {
      // Test normal battery level
      (BatteryManager.getBatteryLevel as jest.Mock).mockResolvedValue(0.8);
      (BatteryManager.isCharging as jest.Mock).mockResolvedValue(false);
      let interval = batteryOptimizer.getRecommendedSyncInterval();
      expect(interval).toBe(5 * 60 * 1000); // 5 minutes

      // Test low battery level
      (BatteryManager.getBatteryLevel as jest.Mock).mockResolvedValue(0.2);
      interval = batteryOptimizer.getRecommendedSyncInterval();
      expect(interval).toBe(15 * 60 * 1000); // 15 minutes
    });
  });

  describe('Power Mode Management', () => {
    it('should recommend appropriate location interval', async () => {
      // Normal mode
      (BatteryManager.getBatteryLevel as jest.Mock).mockResolvedValue(0.8);
      (BatteryManager.isCharging as jest.Mock).mockResolvedValue(false);
      let interval = batteryOptimizer.getRecommendedLocationInterval();
      expect(interval).toBe(30 * 1000); // 30 seconds

      // Low battery mode
      (BatteryManager.getBatteryLevel as jest.Mock).mockResolvedValue(0.2);
      interval = batteryOptimizer.getRecommendedLocationInterval();
      expect(interval).toBe(2 * 60 * 1000); // 2 minutes
    });

    it('should adjust screen brightness based on power mode', async () => {
      // Normal mode
      (BatteryManager.getBatteryLevel as jest.Mock).mockResolvedValue(0.8);
      let brightness = batteryOptimizer.getRecommendedBrightness();
      expect(brightness).toBe(1);

      // Low battery mode
      (BatteryManager.getBatteryLevel as jest.Mock).mockResolvedValue(0.2);
      brightness = batteryOptimizer.getRecommendedBrightness();
      expect(brightness).toBe(0.7);
    });
  });

  describe('Event Handling', () => {
    it('should notify subscribers of power mode changes', (done) => {
      const listener = jest.fn();
      const unsubscribe = batteryOptimizer.subscribe(listener);

      // Simuler un changement de batterie
      (BatteryManager.getBatteryLevel as jest.Mock).mockResolvedValue(0.1);
      
      // Vérifier que le listener a été appelé
      setTimeout(() => {
        expect(listener).toHaveBeenCalled();
        unsubscribe();
        done();
      }, 0);
    });
  });
});
