import React, { Component, ErrorInfo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { errorService } from '../../services/error/ErrorService';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorService.handleError(error, {
      type: 'critical',
      metadata: { componentStack: errorInfo.componentStack },
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  onRetry: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onRetry }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Icon
        name="error-outline"
        size={64}
        color={theme.colors.error}
        style={styles.icon}
      />

      <Text style={[styles.title, { color: theme.colors.text }]}>
        {t('error.title')}
      </Text>

      <Text style={[styles.message, { color: theme.colors.text }]}>
        {error?.message || t('error.generic')}
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={onRetry}
      >
        <Text style={[styles.buttonText, { color: theme.colors.background }]}>
          {t('error.retry')}
        </Text>
      </TouchableOpacity>

      {__DEV__ && error?.stack && (
        <Text
          style={[styles.stack, { color: theme.colors.text }]}
          numberOfLines={5}
        >
          {error.stack}
        </Text>
      )}
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
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  stack: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 16,
    textAlign: 'center',
  },
});
