import { InteractionManager } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

export const deferInteraction = (task: () => any) => {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      resolve(task());
    });
  });
};

export const preloadImages = async (images: string[]) => {
  const cacheDirectory = `${FileSystem.cacheDirectory}images/`;
  
  try {
    // Créer le répertoire de cache s'il n'existe pas
    const dirInfo = await FileSystem.getInfoAsync(cacheDirectory);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(cacheDirectory, { intermediates: true });
    }

    // Précharger les images
    const downloads = images.map(async (image) => {
      if (image.startsWith('http')) {
        const filename = image.split('/').pop();
        const path = `${cacheDirectory}${filename}`;

        // Vérifier si l'image est déjà en cache
        const fileInfo = await FileSystem.getInfoAsync(path);
        if (!fileInfo.exists) {
          await FileSystem.downloadAsync(image, path);
        }
        return path;
      } else {
        // Pour les images locales
        return Asset.fromModule(image).downloadAsync();
      }
    });

    return Promise.all(downloads);
  } catch (error) {
    console.error('Error preloading images:', error);
    throw error;
  }
};

export const clearImageCache = async () => {
  const cacheDirectory = `${FileSystem.cacheDirectory}images/`;
  try {
    await FileSystem.deleteAsync(cacheDirectory);
  } catch (error) {
    console.error('Error clearing image cache:', error);
  }
};

export const measurePerformance = async (
  task: () => Promise<any>,
  taskName: string
) => {
  const startTime = performance.now();
  try {
    const result = await task();
    const endTime = performance.now();
    console.log(`[Performance] ${taskName}: ${endTime - startTime}ms`);
    return result;
  } catch (error) {
    console.error(`[Performance] ${taskName} failed:`, error);
    throw error;
  }
};

export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  options = { maxSize: 100, ttl: 5 * 60 * 1000 } // 5 minutes par défaut
) => {
  const cache = new Map<string, { value: any; timestamp: number }>();

  return (...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < options.ttl) {
      return cached.value;
    }

    const result = fn(...args);
    cache.set(key, { value: result, timestamp: now });

    // Nettoyer le cache si nécessaire
    if (cache.size > options.maxSize) {
      const oldestKey = Array.from(cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      cache.delete(oldestKey);
    }

    return result;
  };
};
