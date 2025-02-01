import * as Location from 'expo-location';
import io from 'socket.io-client';
import { API_URL } from '@env';
import { store } from '../store';
import { deferInteraction, measurePerformance } from '../utils/performance';
import NetInfo from '@react-native-community/netinfo';
import * as Battery from 'expo-battery';

class TrackingService {
  private static instance: TrackingService;
  private socket: any;
  private locationSubscription: any;
  private currentDeliveryId: string | null = null;
  private locationQueue: any[] = [];
  private isProcessingQueue: boolean = false;
  private lastLocationUpdate: number = 0;
  private updateInterval: number = 5000; // 5 secondes par défaut

  private constructor() {
    this.socket = io(`${API_URL}/tracking`, {
      auth: (cb) => {
        cb({ token: store.getState().auth.token });
      },
      transports: ['websocket'],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.setupSocketListeners();
    this.setupPerformanceMonitoring();
  }

  public static getInstance(): TrackingService {
    if (!TrackingService.instance) {
      TrackingService.instance = new TrackingService();
    }
    return TrackingService.instance;
  }

  private setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to tracking server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from tracking server');
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });
  }

  private async setupPerformanceMonitoring() {
    // Surveiller l'état de la batterie
    Battery.addBatteryLevelListener(({ batteryLevel }) => {
      this.adjustUpdateInterval(batteryLevel);
    });

    // Surveiller la connexion réseau
    NetInfo.addEventListener(state => {
      this.adjustSocketConfig(state);
    });
  }

  private adjustUpdateInterval(batteryLevel: number) {
    if (batteryLevel <= 0.15) {
      this.updateInterval = 15000; // 15 secondes en mode économie
    } else if (batteryLevel <= 0.3) {
      this.updateInterval = 10000; // 10 secondes en mode normal
    } else {
      this.updateInterval = 5000; // 5 secondes en mode haute performance
    }
  }

  private adjustSocketConfig(netInfo: any) {
    if (netInfo.type === 'cellular' && netInfo.details?.cellularGeneration === '3g') {
      this.socket.io.opts.reconnectionDelay = 2000;
      this.socket.io.opts.timeout = 30000;
    } else {
      this.socket.io.opts.reconnectionDelay = 1000;
      this.socket.io.opts.timeout = 20000;
    }
  }

  private async processLocationQueue() {
    if (this.isProcessingQueue || this.locationQueue.length === 0) return;

    this.isProcessingQueue = true;
    const now = Date.now();

    while (this.locationQueue.length > 0) {
      const location = this.locationQueue[0];

      // Vérifier si assez de temps s'est écoulé depuis la dernière mise à jour
      if (now - this.lastLocationUpdate < this.updateInterval) {
        break;
      }

      try {
        await this.sendLocationUpdate(location);
        this.locationQueue.shift();
        this.lastLocationUpdate = now;
      } catch (error) {
        console.error('Error processing location queue:', error);
        break;
      }
    }

    this.isProcessingQueue = false;
  }

  public async startTracking(deliveryId: string) {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission de localisation refusée');
      }

      // Vérifier si le service de localisation est activé
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        throw new Error('Le service de localisation doit être activé');
      }

      this.currentDeliveryId = deliveryId;

      // Démarrer le suivi de la localisation
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Mise à jour toutes les 5 secondes
          distanceInterval: 10, // Ou tous les 10 mètres
        },
        (location) => {
          this.sendLocationUpdate(location);
        }
      );

      // Informer le serveur du début du suivi
      this.socket.emit('startTracking', { deliveryId });

    } catch (error) {
      console.error('Error starting tracking:', error);
      throw error;
    }
  }

  public stopTracking() {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
    }

    if (this.currentDeliveryId) {
      this.socket.emit('stopTracking', { deliveryId: this.currentDeliveryId });
      this.currentDeliveryId = null;
    }
  }

  private async sendLocationUpdate(location: Location.LocationObject) {
    if (!this.currentDeliveryId) return;

    const update = {
      deliveryId: this.currentDeliveryId,
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        heading: location.coords.heading,
        speed: location.coords.speed,
        timestamp: location.timestamp,
      },
    };

    return await measurePerformance(
      async () => {
        if (this.socket.connected) {
          this.socket.emit('locationUpdate', update);
        } else {
          // Stocker la mise à jour pour l'envoyer plus tard
          this.locationQueue.push(update);
        }
      },
      'locationUpdate'
    );
  }

  public subscribeToDeliveryUpdates(deliveryId: string, callback: (update: any) => void) {
    this.socket.on(`delivery:${deliveryId}:update`, callback);
    return () => {
      this.socket.off(`delivery:${deliveryId}:update`, callback);
    };
  }

  public disconnect() {
    this.stopTracking();
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default TrackingService.getInstance();
