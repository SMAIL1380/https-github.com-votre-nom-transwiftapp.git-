import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AccessibleForm, AccessibleInput, AccessibleButton } from '../../../components/accessible';
import { AddAddressRequest } from '../types/profile.types';

interface AddressFormProps {
  onSubmit: (address: AddAddressRequest) => Promise<void>;
  initialValues?: Partial<AddAddressRequest>;
  buttonText?: string;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  onSubmit,
  initialValues = {},
  buttonText,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<AddAddressRequest>({
    label: initialValues.label || '',
    street: initialValues.street || '',
    city: initialValues.city || '',
    postalCode: initialValues.postalCode || '',
    country: initialValues.country || '',
    additionalInfo: initialValues.additionalInfo || '',
    isDefault: initialValues.isDefault || false,
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      await onSubmit(formData);
    } catch (err) {
      setError(t('address.submitError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccessibleForm
      style={styles.form}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
    >
      <AccessibleInput
        value={formData.label}
        onChangeText={(text) => setFormData({ ...formData, label: text })}
        placeholder={t('address.labelPlaceholder')}
      />
      <AccessibleInput
        value={formData.street}
        onChangeText={(text) => setFormData({ ...formData, street: text })}
        placeholder={t('address.streetPlaceholder')}
      />
      <AccessibleInput
        value={formData.city}
        onChangeText={(text) => setFormData({ ...formData, city: text })}
        placeholder={t('address.cityPlaceholder')}
      />
      <AccessibleInput
        value={formData.postalCode}
        onChangeText={(text) => setFormData({ ...formData, postalCode: text })}
        placeholder={t('address.postalCodePlaceholder')}
      />
      <AccessibleInput
        value={formData.country}
        onChangeText={(text) => setFormData({ ...formData, country: text })}
        placeholder={t('address.countryPlaceholder')}
      />
      <AccessibleInput
        value={formData.additionalInfo}
        onChangeText={(text) => setFormData({ ...formData, additionalInfo: text })}
        placeholder={t('address.additionalInfoPlaceholder')}
        multiline
      />
      <AccessibleButton
        onPress={handleSubmit}
        title={buttonText || t('address.addButton')}
        loading={loading}
      />
    </AccessibleForm>
  );
};

const styles = StyleSheet.create({
  form: {
    width: '100%',
    padding: 16,
  },
});
