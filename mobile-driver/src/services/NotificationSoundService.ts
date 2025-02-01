import Sound from 'react-native-sound';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SoundType = 'delivery' | 'maintenance' | 'message' | 'alert';

interface SoundConfig {
  enabled: boolean;
  volume: number;
}

class NotificationSoundService {
  private static instance: NotificationSoundService;
  private sounds: Map<SoundType, Sound>;
  private config: Record<SoundType, SoundConfig> = {
    delivery: { enabled: true, volume: 1.0 },
    maintenance: { enabled: true, volume: 0.8 },
    message: { enabled: true, volume: 0.6 },
    alert: { enabled: true, volume: 1.0 },
  };

  private constructor() {
    Sound.setCategory('Playback');
    this.initializeSounds();
    this.loadConfig();
  }

  static getInstance(): NotificationSoundService {
    if (!NotificationSoundService.instance) {
      NotificationSoundService.instance = new NotificationSoundService();
    }
    return NotificationSoundService.instance;
  }

  private async loadConfig() {
    try {
      const storedConfig = await AsyncStorage.getItem('notification_sounds_config');
      if (storedConfig) {
        this.config = { ...this.config, ...JSON.parse(storedConfig) };
      }
    } catch (error) {
      console.error('Error loading sound config:', error);
    }
  }

  private async saveConfig() {
    try {
      await AsyncStorage.setItem('notification_sounds_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Error saving sound config:', error);
    }
  }

  private initializeSounds() {
    this.sounds = new Map();
    
    // Initialiser les sons avec gestion d'erreur
    const initSound = (type: SoundType, filename: string) => {
      const sound = new Sound(filename, Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.error(`Error loading sound ${type}:`, error);
          return;
        }
        sound.setVolume(this.config[type].volume);
      });
      this.sounds.set(type, sound);
    };

    initSound('delivery', 'delivery_notification.mp3');
    initSound('maintenance', 'maintenance_alert.mp3');
    initSound('message', 'message_notification.mp3');
    initSound('alert', 'urgent_alert.mp3');
  }

  async playSound(type: SoundType) {
    try {
      if (!this.config[type].enabled) return;

      const sound = this.sounds.get(type);
      if (!sound) return;

      // Arrêter le son s'il est en cours de lecture
      if (sound.isPlaying()) {
        sound.stop();
      }

      // Réinitialiser et jouer
      sound.setCurrentTime(0);
      sound.setVolume(this.config[type].volume);
      sound.play((success) => {
        if (!success) {
          console.error(`Error playing sound ${type}`);
        }
      });
    } catch (error) {
      console.error(`Error playing sound ${type}:`, error);
    }
  }

  async setEnabled(type: SoundType, enabled: boolean) {
    this.config[type].enabled = enabled;
    await this.saveConfig();
  }

  async setVolume(type: SoundType, volume: number) {
    this.config[type].volume = Math.max(0, Math.min(1, volume));
    const sound = this.sounds.get(type);
    if (sound) {
      sound.setVolume(this.config[type].volume);
    }
    await this.saveConfig();
  }

  async setAllEnabled(enabled: boolean) {
    Object.keys(this.config).forEach((type) => {
      this.config[type as SoundType].enabled = enabled;
    });
    await this.saveConfig();
  }

  getConfig() {
    return this.config;
  }

  // Précharger tous les sons pour une lecture rapide
  async preloadSounds() {
    const promises = Array.from(this.sounds.values()).map(
      (sound) =>
        new Promise((resolve) => {
          sound.play(() => {
            sound.stop();
            sound.setCurrentTime(0);
            resolve(true);
          });
        })
    );
    await Promise.all(promises);
  }

  // Libérer les ressources
  release() {
    this.sounds.forEach((sound) => {
      sound.release();
    });
  }
}
