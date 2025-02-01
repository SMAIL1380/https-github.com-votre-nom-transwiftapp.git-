import { io, Socket } from 'socket.io-client';
import {
  RealTimeMetrics,
  PerformanceMetrics,
  UserActivityMetrics,
  LocationMetrics,
  FinancialMetrics,
  RealTimeEvent,
  AnalyticsFilter,
} from '../types/analytics';

class AnalyticsService {
  private socket: Socket;
  private readonly API_URL = '/api/analytics';
  private eventListeners: Map<string, Set<(data: any) => void>>;
  private metricsBuffer: Map<string, any[]>;
  private readonly BUFFER_SIZE = 100;

  constructor() {
    this.socket = io('/analytics');
    this.eventListeners = new Map();
    this.metricsBuffer = new Map();
    this.initializeSocketListeners();
  }

  private initializeSocketListeners(): void {
    this.socket.on('metrics_update', (data: RealTimeMetrics) => {
      this.bufferMetrics('realtime', data);
      this.notifyListeners('metrics_update', data);
    });

    this.socket.on('performance_update', (data: PerformanceMetrics) => {
      this.bufferMetrics('performance', data);
      this.notifyListeners('performance_update', data);
    });

    this.socket.on('location_update', (data: LocationMetrics) => {
      this.bufferMetrics('location', data);
      this.notifyListeners('location_update', data);
    });

    this.socket.on('event', (event: RealTimeEvent) => {
      this.processRealTimeEvent(event);
    });

    this.socket.on('error', (error: any) => {
      console.error('Analytics Socket Error:', error);
      this.notifyListeners('error', error);
    });
  }

  private bufferMetrics(type: string, data: any): void {
    if (!this.metricsBuffer.has(type)) {
      this.metricsBuffer.set(type, []);
    }

    const buffer = this.metricsBuffer.get(type)!;
    buffer.push({ ...data, timestamp: Date.now() });

    if (buffer.length > this.BUFFER_SIZE) {
      buffer.shift();
    }
  }

  private processRealTimeEvent(event: RealTimeEvent): void {
    // Traiter les événements en fonction de leur priorité
    switch (event.priority) {
      case 'high':
        this.handleHighPriorityEvent(event);
        break;
      case 'medium':
        this.handleMediumPriorityEvent(event);
        break;
      case 'low':
        this.handleLowPriorityEvent(event);
        break;
    }

    this.notifyListeners('event', event);
  }

  private handleHighPriorityEvent(event: RealTimeEvent): void {
    // Traitement immédiat pour les événements critiques
    console.warn('High Priority Event:', event);
    // Envoyer des notifications si nécessaire
  }

  private handleMediumPriorityEvent(event: RealTimeEvent): void {
    // Traitement standard
    console.log('Medium Priority Event:', event);
  }

  private handleLowPriorityEvent(event: RealTimeEvent): void {
    // Mise en file d'attente pour traitement différé
    setTimeout(() => {
      console.log('Low Priority Event:', event);
    }, 1000);
  }

  public subscribeToMetrics(
    type: string,
    callback: (data: any) => void
  ): () => void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }

    const listeners = this.eventListeners.get(type)!;
    listeners.add(callback);

    return () => {
      listeners.delete(callback);
    };
  }

  private notifyListeners(type: string, data: any): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  public async getHistoricalMetrics(filter: AnalyticsFilter): Promise<any> {
    try {
      const response = await fetch(`${this.API_URL}/historical`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filter),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des métriques historiques');
      }

      return await response.json();
    } catch (error) {
      console.error('AnalyticsService Error:', error);
      throw error;
    }
  }

  public getBufferedMetrics(type: string): any[] {
    return this.metricsBuffer.get(type) || [];
  }

  public async generateReport(
    startDate: Date,
    endDate: Date,
    metrics: string[]
  ): Promise<Blob> {
    try {
      const response = await fetch(`${this.API_URL}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          metrics,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du rapport');
      }

      return await response.blob();
    } catch (error) {
      console.error('AnalyticsService Error:', error);
      throw error;
    }
  }

  public setAlertThreshold(
    metricName: string,
    threshold: number,
    callback: (data: any) => void
  ): void {
    this.subscribeToMetrics(metricName, (data: any) => {
      if (data.value > threshold) {
        callback(data);
      }
    });
  }

  public disconnect(): void {
    this.socket.disconnect();
    this.eventListeners.clear();
    this.metricsBuffer.clear();
  }
}

export const analyticsService = new AnalyticsService();
