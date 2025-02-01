import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import { cacheManager } from './CacheManager';

interface OptimizationConfig {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  rotation: number;
  outputFormat: 'JPEG' | 'PNG';
}

interface OptimizationResult {
  uri: string;
  size: number;
  width: number;
  height: number;
}

class ImageOptimizer {
  private defaultConfig: OptimizationConfig = {
    maxWidth: 1024,
    maxHeight: 1024,
    quality: 80,
    rotation: 0,
    outputFormat: 'JPEG',
  };

  public async optimizeImage(
    imagePath: string,
    config: Partial<OptimizationConfig> = {}
  ): Promise<OptimizationResult> {
    try {
      // Vérifier si l'image est déjà dans le cache
      const cacheKey = `optimized_${imagePath}`;
      const cachedPath = await cacheManager.getCachedFile(cacheKey);
      
      if (cachedPath) {
        const stats = await RNFS.stat(cachedPath);
        return {
          uri: cachedPath,
          size: stats.size,
          width: 0, // Ces informations ne sont pas stockées dans le cache
          height: 0,
        };
      }

      const finalConfig = { ...this.defaultConfig, ...config };

      // Optimiser l'image
      const result = await ImageResizer.createResizedImage(
        imagePath,
        finalConfig.maxWidth,
        finalConfig.maxHeight,
        finalConfig.outputFormat,
        finalConfig.quality,
        finalConfig.rotation,
        undefined,
        false,
        {
          mode: 'contain',
          onlyScaleDown: true,
        }
      );

      // Mettre en cache l'image optimisée
      await cacheManager.cacheFile(cacheKey, result.uri);

      return {
        uri: result.uri,
        size: result.size,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      console.error('Error optimizing image:', error);
      throw error;
    }
  }

  public async optimizeBatch(
    imagePaths: string[],
    config: Partial<OptimizationConfig> = {}
  ): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = [];
    
    for (const path of imagePaths) {
      try {
        const result = await this.optimizeImage(path, config);
        results.push(result);
      } catch (error) {
        console.error(`Error optimizing image ${path}:`, error);
      }
    }

    return results;
  }

  public async getOptimalConfig(fileSize: number): OptimizationConfig {
    // Ajuster la configuration en fonction de la taille du fichier
    if (fileSize > 5 * 1024 * 1024) { // > 5MB
      return {
        ...this.defaultConfig,
        maxWidth: 800,
        maxHeight: 800,
        quality: 70,
      };
    } else if (fileSize > 2 * 1024 * 1024) { // > 2MB
      return {
        ...this.defaultConfig,
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 75,
      };
    } else if (fileSize > 1024 * 1024) { // > 1MB
      return {
        ...this.defaultConfig,
        quality: 85,
      };
    }
    
    return this.defaultConfig;
  }

  public async cleanOptimizedCache(): Promise<void> {
    try {
      const optimizedDir = `${RNFS.CachesDirectoryPath}/optimized`;
      const exists = await RNFS.exists(optimizedDir);
      
      if (exists) {
        await RNFS.unlink(optimizedDir);
        await RNFS.mkdir(optimizedDir);
      }
    } catch (error) {
      console.error('Error cleaning optimized cache:', error);
    }
  }
}

export const imageOptimizer = new ImageOptimizer();
