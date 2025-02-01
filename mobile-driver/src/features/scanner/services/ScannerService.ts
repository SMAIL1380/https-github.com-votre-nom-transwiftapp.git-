import { dataCompressor } from '../../../utils/performance/DataCompressor';
import { cacheManager } from '../../../utils/performance/CacheManager';

export interface Scan {
  id: string;
  type: 'qr' | 'barcode';
  content: string;
  timestamp: number;
  deliveryId?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status: 'pending' | 'valid' | 'invalid';
  validationMessage?: string;
}

class ScannerService {
  private scans: Scan[] = [];
  private readonly CACHE_KEY = 'scanner_data';
  private readonly RECENT_SCANS_LIMIT = 100;

  constructor() {
    this.loadFromCache();
  }

  private async loadFromCache() {
    try {
      const cachedData = await dataCompressor.retrieveCompressed(this.CACHE_KEY);
      if (cachedData) {
        this.scans = cachedData;
      }
    } catch (error) {
      console.error('Error loading scans from cache:', error);
    }
  }

  private async saveToCache() {
    try {
      await dataCompressor.storeCompressed(this.CACHE_KEY, this.scans);
    } catch (error) {
      console.error('Error saving scans to cache:', error);
    }
  }

  async addScan(
    type: 'qr' | 'barcode',
    content: string,
    deliveryId?: string,
    location?: { latitude: number; longitude: number; address?: string }
  ): Promise<Scan> {
    // Vérifier si le scan existe déjà récemment
    const recentDuplicate = this.scans.find(
      scan => scan.content === content && 
      Date.now() - scan.timestamp < 5 * 60 * 1000 // 5 minutes
    );

    if (recentDuplicate) {
      return recentDuplicate;
    }

    const scan: Scan = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: Date.now(),
      deliveryId,
      location,
      status: 'pending'
    };

    this.scans.unshift(scan);

    // Garder seulement les N scans les plus récents
    if (this.scans.length > this.RECENT_SCANS_LIMIT) {
      this.scans = this.scans.slice(0, this.RECENT_SCANS_LIMIT);
    }

    await this.saveToCache();
    return scan;
  }

  async getScanHistory(limit: number = 50): Promise<Scan[]> {
    return this.scans.slice(0, limit);
  }

  async getScansByDeliveryId(deliveryId: string): Promise<Scan[]> {
    return this.scans.filter(scan => scan.deliveryId === deliveryId);
  }

  async updateScanValidation(
    scanId: string,
    validation: { isValid: boolean; message?: string }
  ): Promise<void> {
    const scan = this.scans.find(s => s.id === scanId);
    if (scan) {
      scan.status = validation.isValid ? 'valid' : 'invalid';
      scan.validationMessage = validation.message;
      await this.saveToCache();
    }
  }

  async cleanupOldScans(maxAge: number = 7 * 24 * 60 * 60 * 1000) { // 7 jours par défaut
    const now = Date.now();
    this.scans = this.scans.filter(scan => now - scan.timestamp <= maxAge);
    await this.saveToCache();
  }

  getStats() {
    const now = Date.now();
    const last24h = now - 24 * 60 * 60 * 1000;
    const lastWeek = now - 7 * 24 * 60 * 60 * 1000;

    return {
      total: this.scans.length,
      last24h: this.scans.filter(scan => scan.timestamp > last24h).length,
      lastWeek: this.scans.filter(scan => scan.timestamp > lastWeek).length,
      valid: this.scans.filter(scan => scan.status === 'valid').length,
      invalid: this.scans.filter(scan => scan.status === 'invalid').length,
      pending: this.scans.filter(scan => scan.status === 'pending').length,
    };
  }

  async exportScans(startDate: Date, endDate: Date): Promise<Scan[]> {
    return this.scans.filter(
      scan => scan.timestamp >= startDate.getTime() && 
              scan.timestamp <= endDate.getTime()
    );
  }
}

export const scannerService = new ScannerService();
