import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  AccessibleInput,
  AccessibleButton,
  AccessibleText,
  AccessibleSwitch,
} from '../../../components/accessible';
import { PackageDetails, PackageSize } from '../types/delivery.types';

interface PackageDetailsFormProps {
  value: PackageDetails;
  onChange: (details: PackageDetails) => void;
}

export const PackageDetailsForm: React.FC<PackageDetailsFormProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation();

  const packageSizes: PackageSize[] = ['small', 'medium', 'large', 'extra_large'];

  const handleChange = (field: keyof PackageDetails, newValue: any) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.sizeButtons}>
        {packageSizes.map((size) => (
          <AccessibleButton
            key={size}
            onPress={() => handleChange('size', size)}
            title={t(`delivery.packageSize.${size}`)}
            variant={value.size === size ? 'primary' : 'outline'}
            style={styles.sizeButton}
          />
        ))}
      </View>

      <View style={styles.row}>
        <View style={styles.field}>
          <AccessibleText style={styles.label}>
            {t('delivery.packageWeight')}
          </AccessibleText>
          <AccessibleInput
            value={value.weight.toString()}
            onChangeText={(text) =>
              handleChange('weight', parseFloat(text) || 0)
            }
            keyboardType="numeric"
            placeholder="0.0"
            suffix="kg"
          />
        </View>
      </View>

      {(value.size === 'large' || value.size === 'extra_large') && (
        <View style={styles.dimensions}>
          <View style={styles.field}>
            <AccessibleInput
              value={value.length?.toString()}
              onChangeText={(text) =>
                handleChange('length', parseFloat(text) || 0)
              }
              keyboardType="numeric"
              placeholder={t('delivery.length')}
              suffix="cm"
            />
          </View>
          <View style={styles.field}>
            <AccessibleInput
              value={value.width?.toString()}
              onChangeText={(text) =>
                handleChange('width', parseFloat(text) || 0)
              }
              keyboardType="numeric"
              placeholder={t('delivery.width')}
              suffix="cm"
            />
          </View>
          <View style={styles.field}>
            <AccessibleInput
              value={value.height?.toString()}
              onChangeText={(text) =>
                handleChange('height', parseFloat(text) || 0)
              }
              keyboardType="numeric"
              placeholder={t('delivery.height')}
              suffix="cm"
            />
          </View>
        </View>
      )}

      <View style={styles.switches}>
        <View style={styles.switchRow}>
          <AccessibleText>{t('delivery.isFragile')}</AccessibleText>
          <AccessibleSwitch
            value={value.isFragile}
            onValueChange={(newValue) => handleChange('isFragile', newValue)}
          />
        </View>

        <View style={styles.switchRow}>
          <AccessibleText>{t('delivery.requiresRefrigeration')}</AccessibleText>
          <AccessibleSwitch
            value={value.requiresRefrigeration}
            onValueChange={(newValue) =>
              handleChange('requiresRefrigeration', newValue)
            }
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  sizeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeButton: {
    flex: 1,
    minWidth: '45%',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  field: {
    flex: 1,
  },
  label: {
    marginBottom: 4,
  },
  dimensions: {
    flexDirection: 'row',
    gap: 12,
  },
  switches: {
    gap: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
