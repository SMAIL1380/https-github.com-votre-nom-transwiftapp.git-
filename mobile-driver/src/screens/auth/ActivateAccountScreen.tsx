import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  HelperText,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthStackNavigationProp } from '../../navigation/types';
import { completeRegistration, validateActivationToken } from '../../services/auth.service';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
    )
    .required('Le mot de passe est requis'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Les mots de passe ne correspondent pas')
    .required('La confirmation du mot de passe est requise'),
});

const ActivateAccountScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<AuthStackNavigationProp>();
  const route = useRoute();
  const token = route.params?.token;

  const [loading, setLoading] = useState(true);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const result = await validateActivationToken(token);
      setTokenValid(true);
    } catch (error) {
      Alert.alert(
        'Erreur',
        'Ce lien d\'activation n\'est plus valide ou a expiré. Veuillez contacter le support.'
      );
      setTokenValid(false);
    } finally {
      setValidatingToken(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await validationSchema.validate({ password, confirmPassword }, { abortEarly: false });
      setLoading(true);
      await completeRegistration(token, password);
      Alert.alert(
        'Succès',
        'Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: any = {};
        error.inner.forEach((err) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
        setErrors(validationErrors);
      } else {
        Alert.alert(
          'Erreur',
          'Une erreur est survenue lors de l\'activation de votre compte. Veuillez réessayer.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Validation du lien d'activation...</Text>
      </View>
    );
  }

  if (!tokenValid) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Ce lien d'activation n'est plus valide ou a expiré.
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Login')}
          style={styles.button}
        >
          Retour à la connexion
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Activation de votre compte</Text>
        <Text style={styles.subtitle}>
          Définissez votre mot de passe pour activer votre compte
        </Text>

        <TextInput
          label="Mot de passe"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrors({ ...errors, password: undefined });
          }}
          secureTextEntry={secureTextEntry}
          right={
            <TextInput.Icon
              icon={secureTextEntry ? 'eye' : 'eye-off'}
              onPress={() => setSecureTextEntry(!secureTextEntry)}
            />
          }
          error={!!errors.password}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.password}>
          {errors.password}
        </HelperText>

        <TextInput
          label="Confirmer le mot de passe"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setErrors({ ...errors, confirmPassword: undefined });
          }}
          secureTextEntry={secureTextEntry}
          error={!!errors.confirmPassword}
          style={styles.input}
        />
        <HelperText type="error" visible={!!errors.confirmPassword}>
          {errors.confirmPassword}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Activer mon compte
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: 'red',
  },
  content: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 24,
    paddingVertical: 8,
  },
});

export default ActivateAccountScreen;
