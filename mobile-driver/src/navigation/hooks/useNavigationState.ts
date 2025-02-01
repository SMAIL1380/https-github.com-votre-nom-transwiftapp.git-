import { useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types';

export function useNavigationState() {
  const navigation = useNavigation();
  const route = useRoute();

  const navigateToDelivery = useCallback((deliveryId: string) => {
    navigation.navigate('DeliveryDetails', { deliveryId });
  }, [navigation]);

  const navigateToScan = useCallback(() => {
    navigation.navigate('Scan');
  }, [navigation]);

  const navigateToSettings = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  const navigateToReporting = useCallback((params?: { startDate?: number; endDate?: number }) => {
    navigation.navigate('Reporting', params);
  }, [navigation]);

  const goBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const resetToHome = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  }, [navigation]);

  const getCurrentParams = useCallback(() => {
    return route.params as RootStackParamList[keyof RootStackParamList];
  }, [route]);

  return {
    navigateToDelivery,
    navigateToScan,
    navigateToSettings,
    navigateToReporting,
    goBack,
    resetToHome,
    getCurrentParams,
  };
}
