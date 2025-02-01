import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { AccessibleText, AccessibleButton } from '../../../components/accessible';
import { AuthService } from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';
import { CustomTheme } from '../../../theme/types';

type EmailVerificationRouteParams = {
  token?: string;
};

export const EmailVerificationScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme() as CustomTheme;
  const navigation = useNavigation();
  const route = useRoute<RouteProp<Record<string, EmailVerificationRouteParams>, string>>();
  const { user, updateUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const token = route.params?.token;
    if (token) {
      verifyEmail(token);
    }
    checkVerificationStatus();
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const checkVerificationStatus = async () => {
    try {
      const status = await AuthService.getEmailVerificationStatus();
      if (status.isVerified) {
        setSuccess(true);
        if (updateUser) {
          updateUser({ emailVerified: true });
        }
      }
    } catch (err) {
      console.error('Error checking verification status:', err);
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      setLoading(true);
      setError('');
      const response = await AuthService.verifyEmail(token);
      if (response.success) {
        setSuccess(true);
        if (updateUser) {
          updateUser({ emailVerified: true });
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(t('auth.verificationError'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await AuthService.resendVerificationEmail();
      if (response.success) {
        setResendCooldown(60); // 1 minute cooldown
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(t('auth.resendError'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          <AccessibleText style={[styles.title, { color: theme.colors.success }]}>
            {t('auth.emailVerified')}
          </AccessibleText>
          <AccessibleText style={styles.message}>
            {t('auth.verificationSuccessMessage')}
          </AccessibleText>
          <AccessibleButton
            onPress={() => navigation.navigate('Home')}
            title={t('common.continue')}
            style={styles.button}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <AccessibleText style={styles.title}>
          {t('auth.verifyEmailTitle')}
        </AccessibleText>
        <AccessibleText style={styles.message}>
          {t('auth.verifyEmailMessage', { email: user?.email })}
        </AccessibleText>
        
        {error ? (
          <AccessibleText style={[styles.error, { color: theme.colors.error }]}>
            {error}
          </AccessibleText>
        ) : null}

        <AccessibleButton
          onPress={handleResendVerification}
          title={
            resendCooldown > 0
              ? t('auth.resendCodeIn', { seconds: resendCooldown })
              : t('auth.resendVerification')
          }
          disabled={loading || resendCooldown > 0}
          loading={loading}
          style={styles.button}
        />

        <AccessibleText style={styles.hint}>
          {t('auth.checkSpamFolder')}
        </AccessibleText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    marginBottom: 16,
  },
  hint: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
