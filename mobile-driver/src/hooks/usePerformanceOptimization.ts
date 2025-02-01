import { useEffect, useCallback, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import * as Battery from 'expo-battery';
import NetInfo from '@react-native-community/netinfo';
import { clearImageCache } from '../utils/performance';

interface OptimizationOptions {
  enableLocationOptimization?: boolean;
  enableBatteryOptimization?: boolean;
  enableNetworkOptimization?: boolean;
  lowBatteryThreshold?: number;
  backgroundLocationInterval?: number;
}

export const usePerformanceOptimization = ({
  enableLocationOptimization = true,
  enableBatteryOptimization = true,
  enableNetworkOptimization = true,
  lowBatteryThreshold = 0.15,
  backgroundLocationInterval = 30000,
}: OptimizationOptions = {}) => {
  const appState = useRef(AppState.currentState);
  const batteryLevel = useRef<number>(1);
  const isLowPowerMode = useRef<boolean>(false);
  const networkType = useRef<string>('unknown');

  const handleAppStateChange = useCallback(async (nextAppState: string) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // L'app revient au premier plan
      await clearImageCache();
    }

    appState.current = nextAppState;
  }, []);

  const handleBatteryStateChange = useCallback(async () => {
    if (enableBatteryOptimization) {
      const level = await Battery.getBatteryLevelAsync();
      const powerMode = await Battery.isLowPowerModeEnabledAsync();
      
      batteryLevel.current = level;
      isLowPowerMode.current = powerMode;

      if (level <= lowBatteryThreshold || powerMode) {
        // Réduire la fréquence des mises à jour de position
        if (enableLocationOptimization) {
          // Ajuster l'intervalle de mise à jour de la position
        }

        // Réduire la qualité des images
        // Désactiver les animations non essentielles
      }
    }
  }, [enableBatteryOptimization, enableLocationOptimization, lowBatteryThreshold]);

  const handleConnectivityChange = useCallback(async () => {
    if (enableNetworkOptimization) {
      const netInfo = await NetInfo.fetch();
      networkType.current = netInfo.type;

      if (netInfo.type === 'cellular') {
        // Optimiser pour la connexion cellulaire
        if (netInfo.details?.cellularGeneration === '3g') {
          // Réduire la qualité des images
          // Augmenter la taille du cache
        }
      }
    }
  }, [enableNetworkOptimization]);

  const getOptimizationStatus = useCallback(() => {
    return {
      batteryLevel: batteryLevel.current,
      isLowPowerMode: isLowPowerMode.current,
      networkType: networkType.current,
      appState: appState.current,
    };
  }, []);

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    let batterySubscription: Battery.BatteryLevelSubscription | null = null;
    let powerModeSubscription: Battery.PowerModeSubscription | null = null;
    let netInfoSubscription: any = null;

    const setupSubscriptions = async () => {
      if (enableBatteryOptimization) {
        batterySubscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
          batteryLevel.current = batteryLevel;
          handleBatteryStateChange();
        });

        powerModeSubscription = Battery.addPowerModeListener(({ lowPowerMode }) => {
          isLowPowerMode.current = lowPowerMode;
          handleBatteryStateChange();
        });
      }

      if (enableNetworkOptimization) {
        netInfoSubscription = NetInfo.addEventListener(handleConnectivityChange);
      }

      // Initial checks
      await handleBatteryStateChange();
      await handleConnectivityChange();
    };

    setupSubscriptions();

    return () => {
      appStateSubscription.remove();
      if (batterySubscription) {
        batterySubscription.remove();
      }
      if (powerModeSubscription) {
        powerModeSubscription.remove();
      }
      if (netInfoSubscription) {
        netInfoSubscription();
      }
    };
  }, [
    handleAppStateChange,
    handleBatteryStateChange,
    handleConnectivityChange,
    enableBatteryOptimization,
    enableNetworkOptimization,
  ]);

  return {
    getOptimizationStatus,
  };
};
