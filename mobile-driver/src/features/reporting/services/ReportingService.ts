import { batteryOptimizer } from '../../../services/battery/BatteryOptimizer';
import { locationOptimizer } from '../../../services/battery/LocationOptimizer';
import { syncManager } from '../../../core/sync/SyncManager';
import { storage } from '../../../utils/storage';

export interface DeliveryReport {
  id: string;
  deliveryId: string;
  timestamp: number;
  type: 'success' | 'failure' | 'incident';
  batteryLevel: number;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  details: {
    reason?: string;
    photos?: string[];
    signature?: string;
    notes?: string;
  };
  syncStatus: 'pending' | 'synced' | 'failed';
}

export interface ReportMetrics {
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  incidents: number;
  averageDeliveryTime: number;
  batteryConsumption: number;
}

class ReportingService {
  private readonly STORAGE_KEY = '@reporting';
  private reports: DeliveryReport[] = [];

  constructor() {
    this.loadReports();
    this.setupSyncListener();
  }

  private async loadReports() {
    try {
      const savedReports = await storage.get(this.STORAGE_KEY);
      if (savedReports) {
        this.reports = JSON.parse(savedReports);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  }

  private async saveReports() {
    try {
      await storage.set(this.STORAGE_KEY, JSON.stringify(this.reports));
    } catch (error) {
      console.error('Error saving reports:', error);
    }
  }

  private setupSyncListener() {
    syncManager.addListener('sync', async () => {
      await this.syncReports();
    });
  }

  async createReport(
    deliveryId: string,
    type: DeliveryReport['type'],
    details: DeliveryReport['details']
  ): Promise<DeliveryReport> {
    const batteryInfo = batteryOptimizer.getCurrentBatteryInfo();
    const location = await locationOptimizer.getCurrentLocation();

    const report: DeliveryReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      deliveryId,
      timestamp: Date.now(),
      type,
      batteryLevel: batteryInfo.level,
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      },
      details,
      syncStatus: 'pending',
    };

    this.reports.push(report);
    await this.saveReports();

    // Tenter une synchronisation immédiate si les conditions le permettent
    if (batteryOptimizer.shouldExecuteBackgroundTask({ priority: 'high' })) {
      await this.syncReports();
    }

    return report;
  }

  async getReport(reportId: string): Promise<DeliveryReport | null> {
    return this.reports.find(report => report.id === reportId) || null;
  }

  async getReportsByDelivery(deliveryId: string): Promise<DeliveryReport[]> {
    return this.reports.filter(report => report.deliveryId === deliveryId);
  }

  async getMetrics(startDate?: number, endDate?: number): Promise<ReportMetrics> {
    const filteredReports = this.reports.filter(report => {
      if (startDate && report.timestamp < startDate) return false;
      if (endDate && report.timestamp > endDate) return false;
      return true;
    });

    const successfulDeliveries = filteredReports.filter(
      report => report.type === 'success'
    ).length;

    const failedDeliveries = filteredReports.filter(
      report => report.type === 'failure'
    ).length;

    const incidents = filteredReports.filter(
      report => report.type === 'incident'
    ).length;

    // Calculer la consommation moyenne de batterie
    const batteryLevels = filteredReports.map(report => report.batteryLevel);
    const batteryConsumption =
      batteryLevels.length > 1
        ? batteryLevels[0] - batteryLevels[batteryLevels.length - 1]
        : 0;

    // Calculer le temps moyen de livraison
    const deliveryTimes = new Map<string, { start: number; end: number }>();
    filteredReports.forEach(report => {
      const delivery = deliveryTimes.get(report.deliveryId) || { start: report.timestamp, end: report.timestamp };
      if (report.timestamp < delivery.start) delivery.start = report.timestamp;
      if (report.timestamp > delivery.end) delivery.end = report.timestamp;
      deliveryTimes.set(report.deliveryId, delivery);
    });

    const averageDeliveryTime = Array.from(deliveryTimes.values()).reduce(
      (acc, { start, end }) => acc + (end - start),
      0
    ) / deliveryTimes.size;

    return {
      totalDeliveries: deliveryTimes.size,
      successfulDeliveries,
      failedDeliveries,
      incidents,
      averageDeliveryTime,
      batteryConsumption,
    };
  }

  private async syncReports(): Promise<void> {
    const pendingReports = this.reports.filter(
      report => report.syncStatus === 'pending'
    );

    for (const report of pendingReports) {
      try {
        // Simuler l'envoi au serveur
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        report.syncStatus = 'synced';
        await this.saveReports();
      } catch (error) {
        console.error(`Error syncing report ${report.id}:`, error);
        report.syncStatus = 'failed';
        await this.saveReports();
      }
    }
  }
}

export const reportingService = new ReportingService();
