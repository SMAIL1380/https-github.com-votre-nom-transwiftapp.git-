import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { batteryOptimizer } from '../../services/battery/BatteryOptimizer';

export function useDeepLinks() {
  const navigation = useNavigation();

  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => {
      // Vérifier l'état de la batterie avant de traiter le deep link
      const batteryInfo = batteryOptimizer.getCurrentBatteryInfo();
      const shouldProcessDeepLink = batteryOptimizer.shouldExecuteBackgroundTask({
        priority: 'high',
      });

      if (!shouldProcessDeepLink && batteryInfo.level < 0.1) {
        // Stocker le deep link pour un traitement ultérieur
        return;
      }

      try {
        const route = parseDeepLink(url);
        if (route) {
          navigation.navigate(route.screen as never, route.params as never);
        }
      } catch (error) {
        console.error('Error handling deep link:', error);
      }
    };

    // Gérer les deep links lorsque l'app est déjà ouverte
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Gérer les deep links qui ont ouvert l'app
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [navigation]);
}

function parseDeepLink(url: string) {
  try {
    const { hostname, pathname, searchParams } = new URL(url);

    // Format attendu: transwift://delivery/123
    if (hostname === 'delivery') {
      const deliveryId = pathname.slice(1); // Enlever le '/' initial
      return {
        screen: 'DeliveryDetails',
        params: { deliveryId },
      };
    }

    // Format attendu: transwift://reporting?startDate=123&endDate=456
    if (hostname === 'reporting') {
      return {
        screen: 'Reporting',
        params: {
          startDate: searchParams.get('startDate'),
          endDate: searchParams.get('endDate'),
        },
      };
    }

    // Format attendu: transwift://scan
    if (hostname === 'scan') {
      return {
        screen: 'Scan',
      };
    }

    return null;
  } catch (error) {
    console.error('Error parsing deep link:', error);
    return null;
  }
}
