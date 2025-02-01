import { batteryOptimizer } from '../battery/BatteryOptimizer';
import { storage } from '../../utils/storage';
import { notificationService } from '../notifications/NotificationService';

export interface ErrorLog {
  id: string;
  timestamp: number;
  type: 'error' | 'warning' | 'critical';
  message: string;
  stack?: string;
  metadata?: Record<string, any>;
  batteryLevel?: number;
  isHandled: boolean;
}

class ErrorService {
  private readonly STORAGE_KEY = '@error_logs';
  private errorLogs: ErrorLog[] = [];
  private errorHandlers: Set<(error: Error) => void> = new Set();

  constructor() {
    this.loadErrorLogs();
    this.setupGlobalErrorHandler();
  }

  private async loadErrorLogs() {
    try {
      const savedLogs = await storage.get(this.STORAGE_KEY);
      if (savedLogs) {
        this.errorLogs = JSON.parse(savedLogs);
      }
    } catch (error) {
      console.error('Error loading error logs:', error);
    }
  }

  private async saveErrorLogs() {
    try {
      await storage.set(this.STORAGE_KEY, JSON.stringify(this.errorLogs));
    } catch (error) {
      console.error('Error saving error logs:', error);
    }
  }

  private setupGlobalErrorHandler() {
    const originalErrorHandler = ErrorUtils.getGlobalHandler();

    ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      this.handleError(error, { isFatal });
      originalErrorHandler(error, isFatal);
    });
  }

  async handleError(
    error: Error,
    options: {
      type?: ErrorLog['type'];
      metadata?: Record<string, any>;
      isFatal?: boolean;
    } = {}
  ) {
    const batteryInfo = batteryOptimizer.getCurrentBatteryInfo();
    const errorLog: ErrorLog = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: options.type || 'error',
      message: error.message,
      stack: error.stack,
      metadata: options.metadata,
      batteryLevel: batteryInfo.level,
      isHandled: false,
    };

    this.errorLogs.push(errorLog);
    await this.saveErrorLogs();

    // Notifier les gestionnaires d'erreurs
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    });

    // Envoyer une notification si l'erreur est critique
    if (options.isFatal || options.type === 'critical') {
      await notificationService.showNotification({
        title: 'Erreur critique',
        body: error.message,
        priority: 'high',
        data: { errorId: errorLog.id },
      });
    }

    return errorLog;
  }

  async getErrorLogs(
    options: {
      type?: ErrorLog['type'];
      startDate?: number;
      endDate?: number;
      limit?: number;
    } = {}
  ): Promise<ErrorLog[]> {
    let filteredLogs = this.errorLogs;

    if (options.type) {
      filteredLogs = filteredLogs.filter(log => log.type === options.type);
    }

    if (options.startDate) {
      filteredLogs = filteredLogs.filter(
        log => log.timestamp >= options.startDate!
      );
    }

    if (options.endDate) {
      filteredLogs = filteredLogs.filter(
        log => log.timestamp <= options.endDate!
      );
    }

    filteredLogs.sort((a, b) => b.timestamp - a.timestamp);

    if (options.limit) {
      filteredLogs = filteredLogs.slice(0, options.limit);
    }

    return filteredLogs;
  }

  async markErrorAsHandled(errorId: string) {
    const errorLog = this.errorLogs.find(log => log.id === errorId);
    if (errorLog) {
      errorLog.isHandled = true;
      await this.saveErrorLogs();
    }
  }

  async clearErrorLogs() {
    this.errorLogs = [];
    await this.saveErrorLogs();
  }

  addErrorHandler(handler: (error: Error) => void) {
    this.errorHandlers.add(handler);
    return () => {
      this.errorHandlers.delete(handler);
    };
  }

  // Méthodes utilitaires pour les erreurs courantes
  handleNetworkError(error: Error, endpoint: string) {
    return this.handleError(error, {
      type: 'warning',
      metadata: { endpoint },
    });
  }

  handleLocationError(error: Error) {
    return this.handleError(error, {
      type: 'warning',
      metadata: { service: 'location' },
    });
  }

  handleSyncError(error: Error, details: any) {
    return this.handleError(error, {
      type: 'warning',
      metadata: { service: 'sync', details },
    });
  }
}

export const errorService = new ErrorService();
