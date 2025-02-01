export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export type SyncableEntity = 'photo' | 'signature' | 'incident' | 'scan';

export interface SyncItem {
  id: string;
  entityType: SyncableEntity;
  entityId: string;
  status: SyncStatus;
  lastSyncAttempt?: number;
  errorMessage?: string;
  retryCount: number;
}

export interface SyncConfig {
  maxRetries: number;
  retryDelay: number; // en millisecondes
  batchSize: number;
  syncInterval: number; // en millisecondes
}

export interface SyncResult {
  success: boolean;
  error?: string;
  timestamp: number;
}
