import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

interface CacheConfig {
  maxSize: number; // en bytes
  maxAge: number; // en millisecondes
  cleanupInterval: number; // en millisecondes
}

interface CacheItem {
  key: string;
  size: number;
  timestamp: number;
  type: 'data' | 'file';
  path?: string;
}

class CacheManager {
  private config: CacheConfig;
  private cacheItems: Map<string, CacheItem> = new Map();
  private cleanupInterval?: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 100 * 1024 * 1024, // 100 MB par défaut
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours par défaut
      cleanupInterval: 60 * 60 * 1000, // 1 heure par défaut
      ...config,
    };

    this.initialize();
  }

  private async initialize() {
    await this.loadCacheMetadata();
    this.startCleanupInterval();
  }

  private async loadCacheMetadata() {
    try {
      const metadata = await AsyncStorage.getItem('@cache_metadata');
      if (metadata) {
        const items = JSON.parse(metadata);
        items.forEach((item: CacheItem) => {
          this.cacheItems.set(item.key, item);
        });
      }
    } catch (error) {
      console.error('Error loading cache metadata:', error);
    }
  }

  private async saveCacheMetadata() {
    try {
      const metadata = Array.from(this.cacheItems.values());
      await AsyncStorage.setItem('@cache_metadata', JSON.stringify(metadata));
    } catch (error) {
      console.error('Error saving cache metadata:', error);
    }
  }

  private startCleanupInterval() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  public async set(key: string, data: string | object): Promise<boolean> {
    try {
      const value = typeof data === 'string' ? data : JSON.stringify(data);
      const size = new Blob([value]).size;

      if (size > this.config.maxSize) {
        console.warn('Cache item exceeds maximum size');
        return false;
      }

      await AsyncStorage.setItem(key, value);
      
      this.cacheItems.set(key, {
        key,
        size,
        timestamp: Date.now(),
        type: 'data',
      });

      await this.saveCacheMetadata();
      return true;
    } catch (error) {
      console.error('Error setting cache item:', error);
      return false;
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      const item = this.cacheItems.get(key);
      if (!item) return null;

      if (Date.now() - item.timestamp > this.config.maxAge) {
        await this.remove(key);
        return null;
      }

      const value = await AsyncStorage.getItem(key);
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Error getting cache item:', error);
      return null;
    }
  }

  public async cacheFile(key: string, filePath: string): Promise<boolean> {
    try {
      const fileStats = await RNFS.stat(filePath);
      if (!fileStats || fileStats.size > this.config.maxSize) {
        return false;
      }

      const cachePath = `${RNFS.CachesDirectoryPath}/${key}`;
      await RNFS.copyFile(filePath, cachePath);

      this.cacheItems.set(key, {
        key,
        size: fileStats.size,
        timestamp: Date.now(),
        type: 'file',
        path: cachePath,
      });

      await this.saveCacheMetadata();
      return true;
    } catch (error) {
      console.error('Error caching file:', error);
      return false;
    }
  }

  public async getCachedFile(key: string): Promise<string | null> {
    try {
      const item = this.cacheItems.get(key);
      if (!item || item.type !== 'file' || !item.path) return null;

      if (Date.now() - item.timestamp > this.config.maxAge) {
        await this.remove(key);
        return null;
      }

      const exists = await RNFS.exists(item.path);
      if (!exists) {
        await this.remove(key);
        return null;
      }

      return item.path;
    } catch (error) {
      console.error('Error getting cached file:', error);
      return null;
    }
  }

  public async remove(key: string): Promise<void> {
    try {
      const item = this.cacheItems.get(key);
      if (!item) return;

      if (item.type === 'data') {
        await AsyncStorage.removeItem(key);
      } else if (item.type === 'file' && item.path) {
        await RNFS.unlink(item.path);
      }

      this.cacheItems.delete(key);
      await this.saveCacheMetadata();
    } catch (error) {
      console.error('Error removing cache item:', error);
    }
  }

  public async cleanup(): Promise<void> {
    const now = Date.now();
    let totalSize = 0;
    const itemsToRemove: string[] = [];

    // Calculer la taille totale et identifier les éléments expirés
    for (const [key, item] of this.cacheItems) {
      if (now - item.timestamp > this.config.maxAge) {
        itemsToRemove.push(key);
      } else {
        totalSize += item.size;
      }
    }

    // Supprimer les éléments expirés
    for (const key of itemsToRemove) {
      await this.remove(key);
    }

    // Si la taille totale dépasse encore la limite, supprimer les plus anciens
    if (totalSize > this.config.maxSize) {
      const sortedItems = Array.from(this.cacheItems.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);

      for (const [key, item] of sortedItems) {
        if (totalSize <= this.config.maxSize) break;
        await this.remove(key);
        totalSize -= item.size;
      }
    }
  }

  public async clear(): Promise<void> {
    for (const [key] of this.cacheItems) {
      await this.remove(key);
    }
  }

  public destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  public getCacheStats() {
    let totalSize = 0;
    let fileCount = 0;
    let dataCount = 0;

    for (const item of this.cacheItems.values()) {
      totalSize += item.size;
      if (item.type === 'file') fileCount++;
      else dataCount++;
    }

    return {
      totalSize,
      fileCount,
      dataCount,
      itemCount: this.cacheItems.size,
    };
  }
}

export const cacheManager = new CacheManager();
