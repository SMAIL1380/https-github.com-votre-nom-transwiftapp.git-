import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { batteryOptimizer } from '../../services/battery/BatteryOptimizer';

export function useTabBarVisibility() {
  const navigation = useNavigation();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      const route = navigation.getCurrentRoute();
      if (!route) return;

      // Masquer la barre d'onglets sur certains écrans
      const hideTabBarScreens = ['Scan', 'DeliveryDetails'];
      const shouldHideTabBar = hideTabBarScreens.includes(route.name);

      // Vérifier l'état de la batterie
      const batteryInfo = batteryOptimizer.getCurrentBatteryInfo();
      const isLowBattery = batteryInfo.level < 0.1 && !batteryInfo.isCharging;

      // Masquer la barre d'onglets si la batterie est faible pour économiser l'énergie
      setIsVisible(!shouldHideTabBar && !isLowBattery);
    });

    // S'abonner aux changements d'état de la batterie
    const batteryUnsubscribe = batteryOptimizer.subscribe(() => {
      const batteryInfo = batteryOptimizer.getCurrentBatteryInfo();
      const isLowBattery = batteryInfo.level < 0.1 && !batteryInfo.isCharging;

      const route = navigation.getCurrentRoute();
      if (!route) return;

      const hideTabBarScreens = ['Scan', 'DeliveryDetails'];
      const shouldHideTabBar = hideTabBarScreens.includes(route.name);

      setIsVisible(!shouldHideTabBar && !isLowBattery);
    });

    return () => {
      unsubscribe();
      batteryUnsubscribe();
    };
  }, [navigation]);

  return isVisible;
}
