import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AccessibleForm, AccessibleButton, AccessibleInput } from '../../../components/accessible';
import { useAuth } from '../../../hooks/useAuth';
import { CustomTheme } from '../../../theme/types';

export const ForgotPasswordScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme() as CustomTheme;
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      setError('');
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(t('auth.resetPasswordError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AccessibleForm
        style={styles.form}
        onSubmit={handleResetPassword}
        loading={loading}
        error={error}
        success={success ? t('auth.resetPasswordSuccess') : ''}
      >
        <AccessibleInput
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!success}
        />
        {!success && (
          <AccessibleButton
            onPress={handleResetPassword}
            title={t('auth.resetPasswordButton')}
            loading={loading}
          />
        )}
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
