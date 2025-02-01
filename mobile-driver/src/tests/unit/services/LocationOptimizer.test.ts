import { locationOptimizer } from '../../../services/battery/LocationOptimizer';
import * as Location from 'expo-location';
import { batteryOptimizer } from '../../../services/battery/BatteryOptimizer';

jest.mock('expo-location');
jest.mock('../../../services/battery/BatteryOptimizer');

describe('LocationOptimizer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock les permissions de localisation
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
  });

  describe('Location Tracking', () => {
    it('should start tracking with correct configuration', async () => {
      // Mock batterie normale
      (batteryOptimizer.getCurrentBatteryInfo as jest.Mock).mockReturnValue({
        level: 0.8,
        isCharging: false,
        lowPowerMode: false,
      });

      await locationOptimizer.startTracking();

      expect(Location.watchPositionAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
          timeInterval: 5000,
        }),
        expect.any(Function)
      );
    });

    it('should adjust tracking parameters in low battery mode', async () => {
      // Mock batterie faible
      (batteryOptimizer.getCurrentBatteryInfo as jest.Mock).mockReturnValue({
        level: 0.15,
        isCharging: false,
        lowPowerMode: true,
      });

      await locationOptimizer.startTracking();

      expect(Location.watchPositionAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          accuracy: Location.Accuracy.Low,
          distanceInterval: 100,
          timeInterval: 30000,
        }),
        expect.any(Function)
      );
    });

    it('should stop tracking correctly', async () => {
      const mockRemove = jest.fn();
      (Location.watchPositionAsync as jest.Mock).mockResolvedValue({
        remove: mockRemove,
      });

      await locationOptimizer.startTracking();
      await locationOptimizer.stopTracking();

      expect(mockRemove).toHaveBeenCalled();
    });
  });

  describe('Location Updates', () => {
    it('should get current location with appropriate accuracy', async () => {
      // Mock position response
      const mockPosition = {
        coords: {
          latitude: 48.8566,
          longitude: 2.3522,
          accuracy: 10,
          speed: 0,
        },
        timestamp: Date.now(),
      };

      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockPosition);

      const location = await locationOptimizer.getCurrentLocation();

      expect(location).toEqual(mockPosition);
      expect(Location.getCurrentPositionAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          accuracy: expect.any(Number),
        })
      );
    });
  });

  describe('Configuration Management', () => {
    it('should return correct tracking status', async () => {
      expect(locationOptimizer.isLocationTracking()).toBe(false);

      await locationOptimizer.startTracking();
      expect(locationOptimizer.isLocationTracking()).toBe(true);

      await locationOptimizer.stopTracking();
      expect(locationOptimizer.isLocationTracking()).toBe(false);
    });

    it('should provide current configuration', async () => {
      // Mock batterie normale
      (batteryOptimizer.getCurrentBatteryInfo as jest.Mock).mockReturnValue({
        level: 0.8,
        isCharging: false,
        lowPowerMode: false,
      });

      await locationOptimizer.startTracking();
      const config = locationOptimizer.getLocationConfig();

      expect(config).toEqual(
        expect.objectContaining({
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
          timeInterval: 5000,
        })
      );
    });
  });
});
