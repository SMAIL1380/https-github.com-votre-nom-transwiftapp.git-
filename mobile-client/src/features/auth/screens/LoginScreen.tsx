import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AccessibleForm, AccessibleButton, AccessibleInput } from '../../../components/accessible';
import { useAuth } from '../../../hooks/useAuth';
import { CustomTheme } from '../../../theme/types';

export const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme() as CustomTheme;
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await login(email, password);
    } catch (err) {
      setError(t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AccessibleForm
        style={styles.form}
        onSubmit={handleLogin}
        loading={loading}
        error={error}
      >
        <AccessibleInput
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <AccessibleInput
          value={password}
          onChangeText={setPassword}
          placeholder={t('auth.passwordPlaceholder')}
          secureTextEntry
        />
        <AccessibleButton
          onPress={handleLogin}
          title={t('auth.loginButton')}
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
    alignItems: 'center',
    padding: 20,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
});
