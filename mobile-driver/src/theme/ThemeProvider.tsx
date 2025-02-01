import React, { createContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme } from './lightTheme';
import { darkTheme } from './darkTheme';

const THEME_STORAGE_KEY = '@theme_preference';
const AUTO_THEME_START_HOUR = 19; // 19h00
const AUTO_THEME_END_HOUR = 7; // 07h00

type ThemePreference = 'light' | 'dark' | 'system' | 'auto';

interface ThemeContextType {
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
}

export const ThemePreferenceContext = createContext<ThemeContextType>({
  themePreference: 'system',
  setThemePreference: () => {},
});

const shouldUseDarkMode = () => {
  const currentHour = new Date().getHours();
  return currentHour >= AUTO_THEME_START_HOUR || currentHour < AUTO_THEME_END_HOUR;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [currentTheme, setCurrentTheme] = useState(lightTheme);

  const updateTheme = async (preference: ThemePreference) => {
    let newTheme;
    switch (preference) {
      case 'light':
        newTheme = lightTheme;
        break;
      case 'dark':
        newTheme = darkTheme;
        break;
      case 'auto':
        newTheme = shouldUseDarkMode() ? darkTheme : lightTheme;
        break;
      case 'system':
      default:
        newTheme = systemColorScheme === 'dark' ? darkTheme : lightTheme;
        break;
    }
    setCurrentTheme(newTheme);
  };

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedPreference = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedPreference) {
          setThemePreference(savedPreference as ThemePreference);
          await updateTheme(savedPreference as ThemePreference);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  useEffect(() => {
    const checkAutoTheme = async () => {
      if (themePreference === 'auto') {
        await updateTheme('auto');
      }
    };

    const interval = setInterval(checkAutoTheme, 60000); // Vérifier toutes les minutes
    return () => clearInterval(interval);
  }, [themePreference]);

  const handleThemePreferenceChange = async (preference: ThemePreference) => {
    setThemePreference(preference);
    await updateTheme(preference);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  return (
    <ThemePreferenceContext.Provider
      value={{
        themePreference,
        setThemePreference: handleThemePreferenceChange,
      }}
    >
      <StyledThemeProvider theme={currentTheme}>
        {children}
      </StyledThemeProvider>
    </ThemePreferenceContext.Provider>
  );
};
