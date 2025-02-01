import { Buffer } from 'buffer';
import { deflate, inflate } from 'react-native-zlib';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

class DataCompressor {
  private compressionPrefix = '@compressed_';

  public async compress(data: any): Promise<string> {
    try {
      const jsonString = JSON.stringify(data);
      const buffer = Buffer.from(jsonString, 'utf8');
      const compressed = await deflate(buffer);
      return compressed.toString('base64');
    } catch (error) {
      console.error('Error compressing data:', error);
      throw error;
    }
  }

  public async decompress(compressedData: string): Promise<any> {
    try {
      const buffer = Buffer.from(compressedData, 'base64');
      const decompressed = await inflate(buffer);
      const jsonString = decompressed.toString('utf8');
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error decompressing data:', error);
      throw error;
    }
  }

  public async storeCompressed(key: string, data: any): Promise<void> {
    try {
      const compressed = await this.compress(data);
      await AsyncStorage.setItem(this.compressionPrefix + key, compressed);
    } catch (error) {
      console.error('Error storing compressed data:', error);
      throw error;
    }
  }

  public async retrieveCompressed(key: string): Promise<any | null> {
    try {
      const compressed = await AsyncStorage.getItem(this.compressionPrefix + key);
      if (!compressed) return null;
      return await this.decompress(compressed);
    } catch (error) {
      console.error('Error retrieving compressed data:', error);
      return null;
    }
  }

  public async compressAll(dataMap: { [key: string]: any }): Promise<void> {
    const promises = Object.entries(dataMap).map(([key, value]) =>
      this.storeCompressed(key, value)
    );
    await Promise.all(promises);
  }

  public async retrieveAll(keys: string[]): Promise<{ [key: string]: any }> {
    const result: { [key: string]: any } = {};
    const promises = keys.map(async (key) => {
      result[key] = await this.retrieveCompressed(key);
    });
    await Promise.all(promises);
    return result;
  }

  public async getCompressionStats(data: any): Promise<CompressionStats> {
    const originalString = JSON.stringify(data);
    const compressed = await this.compress(data);
    
    const originalSize = Buffer.from(originalString, 'utf8').length;
    const compressedSize = Buffer.from(compressed, 'base64').length;
    
    return {
      originalSize,
      compressedSize,
      compressionRatio: (originalSize - compressedSize) / originalSize,
    };
  }

  public async clearCompressedData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const compressedKeys = keys.filter(key => 
        key.startsWith(this.compressionPrefix)
      );
      await AsyncStorage.multiRemove(compressedKeys);
    } catch (error) {
      console.error('Error clearing compressed data:', error);
      throw error;
    }
  }

  public isCompressed(key: string): boolean {
    return key.startsWith(this.compressionPrefix);
  }
}

export const dataCompressor = new DataCompressor();
