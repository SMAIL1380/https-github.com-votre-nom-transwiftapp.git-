import { reportingService } from '../../../../features/reporting/services/ReportingService';
import { batteryOptimizer } from '../../../../services/battery/BatteryOptimizer';
import { locationOptimizer } from '../../../../services/battery/LocationOptimizer';
import { storage } from '../../../../utils/storage';

jest.mock('../../../../services/battery/BatteryOptimizer');
jest.mock('../../../../services/battery/LocationOptimizer');
jest.mock('../../../../utils/storage');

describe('ReportingService', () => {
  const mockLocation = {
    coords: {
      latitude: 48.8566,
      longitude: 2.3522,
      accuracy: 10,
    },
    timestamp: Date.now(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (storage.get as jest.Mock).mockResolvedValue(null);
    (batteryOptimizer.getCurrentBatteryInfo as jest.Mock).mockReturnValue({
      level: 0.8,
      isCharging: false,
      lowPowerMode: false,
    });
    (locationOptimizer.getCurrentLocation as jest.Mock).mockResolvedValue(mockLocation);
  });

  describe('createReport', () => {
    it('should create a report with correct data', async () => {
      const report = await reportingService.createReport(
        'delivery_123',
        'success',
        { notes: 'Test report' }
      );

      expect(report).toMatchObject({
        deliveryId: 'delivery_123',
        type: 'success',
        batteryLevel: 0.8,
        location: {
          latitude: 48.8566,
          longitude: 2.3522,
          accuracy: 10,
        },
        details: { notes: 'Test report' },
        syncStatus: 'pending',
      });
    });

    it('should save report to storage', async () => {
      await reportingService.createReport(
        'delivery_123',
        'success',
        { notes: 'Test report' }
      );

      expect(storage.set).toHaveBeenCalledWith(
        '@reporting',
        expect.any(String)
      );
    });

    it('should attempt sync if battery conditions allow', async () => {
      (batteryOptimizer.shouldExecuteBackgroundTask as jest.Mock).mockReturnValue(true);

      await reportingService.createReport(
        'delivery_123',
        'success',
        { notes: 'Test report' }
      );

      // Vérifier que la synchronisation a été tentée
      expect(storage.set).toHaveBeenCalledTimes(2); // Une fois pour la sauvegarde, une fois pour la sync
    });
  });

  describe('getMetrics', () => {
    beforeEach(() => {
      const mockReports = [
        {
          id: '1',
          deliveryId: 'delivery_1',
          type: 'success',
          timestamp: Date.now() - 86400000, // 1 jour avant
          batteryLevel: 0.9,
        },
        {
          id: '2',
          deliveryId: 'delivery_1',
          type: 'success',
          timestamp: Date.now(),
          batteryLevel: 0.8,
        },
        {
          id: '3',
          deliveryId: 'delivery_2',
          type: 'failure',
          timestamp: Date.now(),
          batteryLevel: 0.7,
        },
      ];
      (storage.get as jest.Mock).mockResolvedValue(JSON.stringify(mockReports));
    });

    it('should calculate metrics correctly', async () => {
      const metrics = await reportingService.getMetrics();

      expect(metrics).toMatchObject({
        totalDeliveries: 2,
        successfulDeliveries: 2,
        failedDeliveries: 1,
        incidents: 0,
        batteryConsumption: expect.any(Number),
      });
    });

    it('should filter metrics by date range', async () => {
      const startDate = Date.now() - 43200000; // 12 heures avant
      const metrics = await reportingService.getMetrics(startDate, Date.now());

      expect(metrics.totalDeliveries).toBe(1);
    });
  });

  describe('getReportsByDelivery', () => {
    beforeEach(() => {
      const mockReports = [
        {
          id: '1',
          deliveryId: 'delivery_1',
          type: 'success',
          timestamp: Date.now(),
        },
        {
          id: '2',
          deliveryId: 'delivery_2',
          type: 'failure',
          timestamp: Date.now(),
        },
      ];
      (storage.get as jest.Mock).mockResolvedValue(JSON.stringify(mockReports));
    });

    it('should return reports for specific delivery', async () => {
      const reports = await reportingService.getReportsByDelivery('delivery_1');

      expect(reports).toHaveLength(1);
      expect(reports[0].deliveryId).toBe('delivery_1');
    });
  });

  describe('syncReports', () => {
    beforeEach(() => {
      const mockReports = [
        {
          id: '1',
          deliveryId: 'delivery_1',
          syncStatus: 'pending',
        },
        {
          id: '2',
          deliveryId: 'delivery_2',
          syncStatus: 'synced',
        },
      ];
      (storage.get as jest.Mock).mockResolvedValue(JSON.stringify(mockReports));
    });

    it('should sync pending reports', async () => {
      await (reportingService as any).syncReports();

      expect(storage.set).toHaveBeenCalledWith(
        '@reporting',
        expect.stringContaining('"syncStatus":"synced"')
      );
    });
  });
});
