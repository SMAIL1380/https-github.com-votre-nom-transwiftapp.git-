import { useContext, useEffect } from 'react';
import { ThemeContext } from 'styled-components/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const THEME_STORAGE_KEY = '@theme_preference';
const AUTO_THEME_START_HOUR = 19; // 19h00
const AUTO_THEME_END_HOUR = 7; // 07h00

export const useTheme = () => {
  const theme = useContext(ThemeContext);
  const systemColorScheme = useColorScheme();

  const shouldUseDarkMode = () => {
    const currentHour = new Date().getHours();
    return currentHour >= AUTO_THEME_START_HOUR || currentHour < AUTO_THEME_END_HOUR;
  };

  const setThemePreference = async (preference: 'light' | 'dark' | 'system' | 'auto') => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const getThemePreference = async () => {
    try {
      const preference = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      return preference || 'system';
    } catch (error) {
      console.error('Error reading theme preference:', error);
      return 'system';
    }
  };

  const getCurrentTheme = async () => {
    const preference = await getThemePreference();
    switch (preference) {
      case 'light':
        return 'light';
      case 'dark':
        return 'dark';
      case 'auto':
        return shouldUseDarkMode() ? 'dark' : 'light';
      case 'system':
      default:
        return systemColorScheme || 'light';
    }
  };

  const isDarkMode = theme.colors.background === '#000000';

  useEffect(() => {
    const checkAutoTheme = async () => {
      const preference = await getThemePreference();
      if (preference === 'auto') {
        const newTheme = shouldUseDarkMode() ? 'dark' : 'light';
        // Mettre à jour le thème si nécessaire
        // Note: Cette logique devrait être gérée par le ThemeProvider
      }
    };

    const interval = setInterval(checkAutoTheme, 60000); // Vérifier toutes les minutes
    return () => clearInterval(interval);
  }, []);

  return {
    theme,
    isDarkMode,
    setThemePreference,
    getThemePreference,
    getCurrentTheme,
    systemColorScheme,
  };
};
