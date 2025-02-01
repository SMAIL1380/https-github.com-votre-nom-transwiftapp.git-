import Sound from 'react-native-sound';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationType } from './types';

export class NotificationSoundManager {
  private sounds: Map<NotificationType, Sound>;
  private enabled: boolean = true;
  private volume: number = 1.0;

  constructor() {
    Sound.setCategory('Playback');
    this.initializeSounds();
    this.loadPreferences();
  }

  private async loadPreferences() {
    try {
      const prefs = await AsyncStorage.getItem('notification_sound_prefs');
      if (prefs) {
        const { enabled, volume } = JSON.parse(prefs);
        this.enabled = enabled;
        this.volume = volume;
      }
    } catch (error) {
      console.error('Error loading sound preferences:', error);
    }
  }

  private initializeSounds() {
    this.sounds = new Map();
    
    const soundFiles = {
      [NotificationType.DELIVERY]: 'delivery_notification.mp3',
      [NotificationType.MAINTENANCE]: 'maintenance_alert.mp3',
      [NotificationType.MESSAGE]: 'message_notification.mp3',
      [NotificationType.ALERT]: 'urgent_alert.mp3',
      [NotificationType.SYSTEM]: 'system_notification.mp3'
    };

    Object.entries(soundFiles).forEach(([type, file]) => {
      const sound = new Sound(file, Sound.MAIN_BUNDLE, error => {
        if (error) {
          console.error(`Error loading sound ${file}:`, error);
          return;
        }
        sound.setVolume(this.volume);
      });
      this.sounds.set(type as NotificationType, sound);
    });
  }

  async playSound(type: NotificationType) {
    if (!this.enabled) return;

    const sound = this.sounds.get(type);
    if (!sound) return;

    try {
      if (sound.isPlaying()) {
        sound.stop();
      }
      sound.setCurrentTime(0);
      sound.play(success => {
        if (!success) {
          console.error(`Error playing sound for ${type}`);
        }
      });
    } catch (error) {
      console.error(`Error playing sound for ${type}:`, error);
    }
  }

  async updatePreferences(enabled: boolean, volume: number) {
    this.enabled = enabled;
    this.volume = Math.max(0, Math.min(1, volume));

    this.sounds.forEach(sound => {
      sound.setVolume(this.volume);
    });

    try {
      await AsyncStorage.setItem(
        'notification_sound_prefs',
        JSON.stringify({ enabled, volume })
      );
    } catch (error) {
      console.error('Error saving sound preferences:', error);
    }
  }

  cleanup() {
    this.sounds.forEach(sound => {
      sound.release();
    });
  }
}
