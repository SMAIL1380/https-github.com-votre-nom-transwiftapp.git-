import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

interface BatteryWarningProps {
  level: number;
  isCharging: boolean;
  onPress?: () => void;
}

export const BatteryWarning: React.FC<BatteryWarningProps> = ({
  level,
  isCharging,
  onPress,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const getBatteryIcon = () => {
    if (isCharging) {
      return 'battery-charging-full';
    }
    if (level <= 0.1) {
      return 'battery-alert';
    }
    return 'battery-low';
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.notification,
        },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Icon
        name={getBatteryIcon()}
        size={20}
        color={theme.colors.background}
        style={styles.icon}
      />
      <Text style={[styles.text, { color: theme.colors.background }]}>
        {isCharging
          ? t('battery.charging')
          : t('battery.low', { percentage: Math.round(level * 100) })}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
