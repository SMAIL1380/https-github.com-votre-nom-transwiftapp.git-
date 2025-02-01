import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  AccessibleForm,
  AccessibleButton,
  AccessibleInput,
  AccessibleText,
} from '../../../components/accessible';
import { DeliveryLocationPicker } from '../components/DeliveryLocationPicker';
import { PackageDetailsForm } from '../components/PackageDetailsForm';
import { PricingSummary } from '../components/PricingSummary';
import { DeliveryService } from '../services/delivery.service';
import {
  CreateDeliveryRequest,
  DeliveryLocation,
  PackageDetails,
  PriceEstimate,
} from '../types/delivery.types';
import { CustomTheme } from '../../../theme/types';

export const CreateDeliveryScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme() as CustomTheme;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [priceEstimate, setPriceEstimate] = useState<PriceEstimate | null>(null);

  const [deliveryData, setDeliveryData] = useState<Partial<CreateDeliveryRequest>>({
    package: {
      size: 'small',
      weight: 1,
      isFragile: false,
      requiresRefrigeration: false,
    },
  });

  const updateDeliveryData = (
    field: keyof CreateDeliveryRequest,
    value: any
  ) => {
    setDeliveryData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateLocations = () => {
    return (
      deliveryData.pickup?.address &&
      deliveryData.pickup?.contactPhone &&
      deliveryData.dropoff?.address &&
      deliveryData.dropoff?.contactPhone
    );
  };

  const handleEstimatePrice = async () => {
    if (!validateLocations()) {
      setError(t('delivery.invalidLocations'));
      return;
    }

    try {
      setLoading(true);
      setError('');
      const estimate = await DeliveryService.estimatePrice(
        deliveryData.pickup!,
        deliveryData.dropoff!,
        deliveryData.package as PackageDetails
      );
      setPriceEstimate(estimate);
    } catch (err) {
      setError(t('delivery.estimateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDelivery = async () => {
    if (!validateLocations()) {
      setError(t('delivery.invalidLocations'));
      return;
    }

    try {
      setLoading(true);
      setError('');
      const delivery = await DeliveryService.createDelivery(
        deliveryData as CreateDeliveryRequest
      );
      // Navigate to tracking screen
      navigation.navigate('DeliveryTracking', { id: delivery.id });
    } catch (err) {
      setError(t('delivery.createError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {error ? (
        <AccessibleText style={[styles.error, { color: theme.colors.error }]}>
          {error}
        </AccessibleText>
      ) : null}

      <View style={styles.section}>
        <AccessibleText style={styles.sectionTitle}>
          {t('delivery.pickupDetails')}
        </AccessibleText>
        <DeliveryLocationPicker
          value={deliveryData.pickup}
          onChange={(location) => updateDeliveryData('pickup', location)}
          type="pickup"
        />
      </View>

      <View style={styles.section}>
        <AccessibleText style={styles.sectionTitle}>
          {t('delivery.dropoffDetails')}
        </AccessibleText>
        <DeliveryLocationPicker
          value={deliveryData.dropoff}
          onChange={(location) => updateDeliveryData('dropoff', location)}
          type="dropoff"
        />
      </View>

      <View style={styles.section}>
        <AccessibleText style={styles.sectionTitle}>
          {t('delivery.packageDetails')}
        </AccessibleText>
        <PackageDetailsForm
          value={deliveryData.package as PackageDetails}
          onChange={(details) => updateDeliveryData('package', details)}
        />
      </View>

      <View style={styles.section}>
        <AccessibleInput
          value={deliveryData.specialInstructions}
          onChangeText={(text) =>
            updateDeliveryData('specialInstructions', text)
          }
          placeholder={t('delivery.specialInstructions')}
          multiline
          numberOfLines={3}
        />
      </View>

      {priceEstimate && (
        <View style={styles.section}>
          <PricingSummary estimate={priceEstimate} />
        </View>
      )}

      <View style={styles.actions}>
        <AccessibleButton
          onPress={handleEstimatePrice}
          title={t('delivery.estimatePrice')}
          variant="secondary"
          loading={loading}
          style={styles.button}
        />
        {priceEstimate && (
          <AccessibleButton
            onPress={handleCreateDelivery}
            title={t('delivery.createDelivery')}
            loading={loading}
            style={styles.button}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  error: {
    marginBottom: 16,
    textAlign: 'center',
  },
  actions: {
    gap: 12,
  },
  button: {
    width: '100%',
  },
});
