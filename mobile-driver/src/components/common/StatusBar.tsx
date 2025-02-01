import React from 'react';
import { StatusBar as RNStatusBar, StatusBarProps } from 'react-native';
import { useTheme } from '@react-navigation/native';

export const StatusBar: React.FC<StatusBarProps> = (props) => {
  const theme = useTheme();
  const isDark = theme.dark;

  return (
    <RNStatusBar
      barStyle={isDark ? 'light-content' : 'dark-content'}
      backgroundColor={theme.colors.background}
      translucent
      {...props}
    />
  );
};
