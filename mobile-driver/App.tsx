import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as StoreProvider } from 'react-redux';
import { StatusBar } from 'react-native';
import { theme } from './src/theme';
import { ThemeProvider } from './src/theme/ThemeProvider';
import RootNavigator from './src/navigation/RootNavigator';
import { store } from './src/store';
import './src/i18n/i18n.config';

export default function App() {
  return (
    <ThemeProvider>
      <StoreProvider store={store}>
        <PaperProvider theme={theme.light}>
          <SafeAreaProvider>
            <NavigationContainer>
              <StatusBar
                barStyle="dark-content"
                backgroundColor={theme.light.colors.background}
              />
              <RootNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </PaperProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}
