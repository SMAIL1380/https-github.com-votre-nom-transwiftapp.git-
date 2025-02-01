import React, { useEffect, useState } from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DeliveryList } from '../components/delivery/DeliveryList';
import { StatusBar } from '../components/common/StatusBar';
import { FloatingActionButton } from '../components/common/FloatingActionButton';
import { Header } from '../components/common/Header';
import { LoadingAnimation } from '../components/animations/LoadingAnimation';
import { deliveryService } from '../features/delivery/services/DeliveryService';
import { useTranslation } from 'react-i18next';
import { batteryOptimizer } from '../services/battery/BatteryOptimizer';

export const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deliveries, setDeliveries] = useState([]);
  const [batteryInfo, setBatteryInfo] = useState(batteryOptimizer.getCurrentBatteryInfo());

  useEffect(() => {
    loadDeliveries();
    const unsubscribe = batteryOptimizer.subscribe(() => {
      setBatteryInfo(batteryOptimizer.getCurrentBatteryInfo());
    });
    return unsubscribe;
  }, []);

  const loadDeliveries = async () => {
    try {
      const data = await deliveryService.getDeliveries();
      setDeliveries(data);
    } catch (error) {
      console.error('Error loading deliveries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDeliveries();
    setIsRefreshing(false);
  };

  const handleScanPress = () => {
    // Navigation vers l'écran de scan
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LoadingAnimation type="pulse" color={theme.colors.primary} size={50} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar />
      <Header
        title={t('home.title')}
        rightComponent={
          batteryInfo.level <= 0.2 ? (
            <BatteryWarning level={batteryInfo.level} isCharging={batteryInfo.isCharging} />
          ) : undefined
        }
      />
      <DeliveryList
        deliveries={deliveries}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />
      <FloatingActionButton
        icon="qr-code-scanner"
        onPress={handleScanPress}
        disabled={batteryInfo.level <= 0.05} // Désactiver le scan si batterie très faible
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
