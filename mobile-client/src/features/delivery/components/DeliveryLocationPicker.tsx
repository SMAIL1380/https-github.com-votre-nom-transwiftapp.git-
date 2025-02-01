import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  AccessibleInput,
  AccessibleButton,
  AccessibleText,
} from '../../../components/accessible';
import { DeliveryLocation } from '../types/delivery.types';
import { DeliveryService } from '../services/delivery.service';
import { LocationPicker } from './LocationPicker';

interface DeliveryLocationPickerProps {
  value?: DeliveryLocation;
  onChange: (location: DeliveryLocation) => void;
  type: 'pickup' | 'dropoff';
}

export const DeliveryLocationPicker: React.FC<DeliveryLocationPickerProps> = ({
  value,
  onChange,
  type,
}) => {
  const { t } = useTranslation();
  const [location, setLocation] = useState<DeliveryLocation>(
    value || {
      address: '',
      latitude: 0,
      longitude: 0,
      contactName: '',
      contactPhone: '',
      instructions: '',
    }
  );
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');

  const handleAddressChange = async (address: string) => {
    const newLocation = { ...location, address };
    setLocation(newLocation);

    try {
      setValidating(true);
      setError('');
      const validation = await DeliveryService.validateAddress(newLocation);
      
      if (!validation.valid && validation.suggestions?.length) {
        // Show suggestions to user
        setError(t('delivery.addressSuggestions'));
      } else if (!validation.valid) {
        setError(t('delivery.invalidAddress'));
      } else {
        onChange(newLocation);
      }
    } catch (err) {
      setError(t('delivery.addressValidationError'));
    } finally {
      setValidating(false);
    }
  };

  const handleLocationSelect = (latitude: number, longitude: number) => {
    const newLocation = { ...location, latitude, longitude };
    setLocation(newLocation);
    onChange(newLocation);
  };

  return (
    <View style={styles.container}>
      <LocationPicker
        initialLocation={value ? { latitude: value.latitude, longitude: value.longitude } : undefined}
        onLocationSelect={handleLocationSelect}
      />

      <AccessibleInput
        value={location.address}
        onChangeText={handleAddressChange}
        placeholder={t(`delivery.${type}Address`)}
        error={error}
      />

      <View style={styles.contactInfo}>
        <AccessibleInput
          value={location.contactName}
          onChangeText={(text) => {
            const newLocation = { ...location, contactName: text };
            setLocation(newLocation);
            onChange(newLocation);
          }}
          placeholder={t(`delivery.${type}ContactName`)}
          style={styles.contactField}
        />

        <AccessibleInput
          value={location.contactPhone}
          onChangeText={(text) => {
            const newLocation = { ...location, contactPhone: text };
            setLocation(newLocation);
            onChange(newLocation);
          }}
          placeholder={t(`delivery.${type}ContactPhone`)}
          keyboardType="phone-pad"
          style={styles.contactField}
        />
      </View>

      <AccessibleInput
        value={location.instructions}
        onChangeText={(text) => {
          const newLocation = { ...location, instructions: text };
          setLocation(newLocation);
          onChange(newLocation);
        }}
        placeholder={t(`delivery.${type}Instructions`)}
        multiline
        numberOfLines={2}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  contactInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  contactField: {
    flex: 1,
  },
});
