import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

interface ErrorToastProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
  duration?: number;
  onDismiss?: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  message,
  type = 'error',
  duration = 4000,
  onDismiss,
  action,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeout = useRef<NodeJS.Timeout>();

  const getIconName = () => {
    switch (type) {
      case 'error':
        return 'error-outline';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info-outline';
      default:
        return 'error-outline';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.notification;
      case 'info':
        return theme.colors.primary;
      default:
        return theme.colors.error;
    }
  };

  useEffect(() => {
    show();
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  const show = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: Platform.OS === 'ios' ? 50 : 20,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    timeout.current = setTimeout(() => {
      hide();
    }, duration);
  };

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) {
        onDismiss();
      }
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: getBackgroundColor(),
        },
      ]}
    >
      <View style={styles.content}>
        <Icon name={getIconName()} size={24} color="white" style={styles.icon} />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>

      {action && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            action.onPress();
            hide();
          }}
        >
          <Text style={styles.actionText}>{action.label}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.closeButton} onPress={hide}>
        <Icon name="close" size={20} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    marginLeft: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
});
