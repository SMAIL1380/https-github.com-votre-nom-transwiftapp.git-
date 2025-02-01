import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { SyncItem, SyncStatus, SyncConfig, SyncResult } from './types';
import { batteryOptimizer } from '../../services/battery/BatteryOptimizer';
import { backgroundTaskManager } from '../../services/battery/BackgroundTaskManager';

const DEFAULT_CONFIG: SyncConfig = {
  maxRetries: 3,
  retryDelay: 5000, // 5 secondes
  batchSize: 5,
  syncInterval: 300000, // 5 minutes
};

class SyncManager {
  private static instance: SyncManager;
  private syncQueue: SyncItem[] = [];
  private config: SyncConfig;
  private isSyncing: boolean = false;
  private syncInterval?: NodeJS.Timeout;
  private syncTask: string = 'sync_background_task';

  private constructor(config: Partial<SyncConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initialize();
  }

  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  private async initialize() {
    // Configurer la tâche de synchronisation en arrière-plan
    await backgroundTaskManager.registerTask({
      id: this.syncTask,
      handler: async () => {
        await this.syncPendingItems();
      },
      interval: batteryOptimizer.getRecommendedSyncInterval(),
      priority: 'normal',
      requiresNetwork: true,
    });

    // S'abonner aux changements de batterie pour ajuster les intervalles
    batteryOptimizer.subscribe(async () => {
      await this.updateSyncInterval();
    });

    await this.loadQueue();
    this.startAutoSync();
  }

  private async updateSyncInterval() {
    const interval = batteryOptimizer.getRecommendedSyncInterval();
    await backgroundTaskManager.unregisterTask(this.syncTask);
    await backgroundTaskManager.registerTask({
      id: this.syncTask,
      handler: async () => {
        await this.syncPendingItems();
      },
      interval,
      priority: 'normal',
      requiresNetwork: true,
    });
  }

  private async loadQueue() {
    try {
      const queueData = await AsyncStorage.getItem('@sync_queue');
      if (queueData) {
        this.syncQueue = JSON.parse(queueData);
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  }

  private async saveQueue() {
    try {
      await AsyncStorage.setItem('@sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }

  private startAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.syncInterval = setInterval(() => {
      this.syncPendingItems();
    }, this.config.syncInterval);
  }

  public async addToQueue(item: Omit<SyncItem, 'status' | 'retryCount'>) {
    const syncItem: SyncItem = {
      ...item,
      status: 'pending',
      retryCount: 0,
    };
    this.syncQueue.push(syncItem);
    await this.saveQueue();
    this.syncPendingItems();
  }

  async syncPendingItems(): Promise<void> {
    // Vérifier si on peut synchroniser selon l'état de la batterie
    if (!batteryOptimizer.shouldExecuteBackgroundTask()) {
      console.log('Skipping sync due to battery optimization');
      return;
    }

    if (this.isSyncing) return;

    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) return;

    this.isSyncing = true;
    const itemsToSync = this.syncQueue
      .filter(item => item.status === 'pending' || (item.status === 'failed' && item.retryCount < this.config.maxRetries))
      .slice(0, this.config.batchSize);

    for (const item of itemsToSync) {
      try {
        item.status = 'syncing';
        await this.saveQueue();

        const result = await this.syncItem(item);

        if (result.success) {
          this.syncQueue = this.syncQueue.filter(i => i.id !== item.id);
        } else {
          item.status = 'failed';
          item.errorMessage = result.error;
          item.retryCount++;
          item.lastSyncAttempt = Date.now();
        }
      } catch (error) {
        item.status = 'failed';
        item.errorMessage = error.message;
        item.retryCount++;
        item.lastSyncAttempt = Date.now();
      }
    }

    await this.saveQueue();
    this.isSyncing = false;
  }

  private async syncItem(item: SyncItem): Promise<SyncResult> {
    // Cette méthode sera implémentée par les gestionnaires de synchronisation spécifiques
    throw new Error('syncItem must be implemented by specific sync handlers');
  }

  public getQueueStatus() {
    return {
      total: this.syncQueue.length,
      pending: this.syncQueue.filter(item => item.status === 'pending').length,
      syncing: this.syncQueue.filter(item => item.status === 'syncing').length,
      failed: this.syncQueue.filter(item => item.status === 'failed').length,
    };
  }

  public async clearFailedItems() {
    this.syncQueue = this.syncQueue.filter(item => item.status !== 'failed');
    await this.saveQueue();
  }

  public async retryFailedItems() {
    this.syncQueue = this.syncQueue.map(item => {
      if (item.status === 'failed') {
        return { ...item, status: 'pending', retryCount: 0 };
      }
      return item;
    });
    await this.saveQueue();
    this.syncPendingItems();
  }

  public destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

export const syncManager = SyncManager.getInstance();
