import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AccessibleForm, AccessibleButton, AccessibleInput } from '../../../components/accessible';
import { useAuth } from '../../../hooks/useAuth';
import { CustomTheme } from '../../../theme/types';

export const RegisterScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme() as CustomTheme;
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register(formData);
    } catch (err) {
      setError(t('auth.registrationError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AccessibleForm
        style={styles.form}
        onSubmit={handleRegister}
        loading={loading}
        error={error}
      >
        <AccessibleInput
          value={formData.firstName}
          onChangeText={(text) => setFormData({ ...formData, firstName: text })}
          placeholder={t('auth.firstNamePlaceholder')}
        />
        <AccessibleInput
          value={formData.lastName}
          onChangeText={(text) => setFormData({ ...formData, lastName: text })}
          placeholder={t('auth.lastNamePlaceholder')}
        />
        <AccessibleInput
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          placeholder={t('auth.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <AccessibleInput
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          placeholder={t('auth.phonePlaceholder')}
          keyboardType="phone-pad"
        />
        <AccessibleInput
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          placeholder={t('auth.passwordPlaceholder')}
          secureTextEntry
        />
        <AccessibleInput
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
          placeholder={t('auth.confirmPasswordPlaceholder')}
          secureTextEntry
        />
        <AccessibleButton
          onPress={handleRegister}
          title={t('auth.registerButton')}
          loading={loading}
        />
      </AccessibleForm>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
});
