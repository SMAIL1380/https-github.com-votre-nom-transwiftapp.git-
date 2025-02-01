import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { ReportingScreen } from '../screens/ReportingScreen';
import { DeliveryDetailsScreen } from '../screens/DeliveryDetailsScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

import { navigationRef } from './RootNavigation';
import { RootStackParamList, MainTabParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outlined';
              break;
            case 'Reporting':
              iconName = focused ? 'assessment' : 'assessment-outlined';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outlined';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: t('navigation.home') }}
      />
      <Tab.Screen
        name="Reporting"
        component={ReportingScreen}
        options={{ title: t('navigation.reporting') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t('navigation.profile') }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const theme = useTheme();

  return (
    <NavigationContainer ref={navigationRef} theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="DeliveryDetails"
          component={DeliveryDetailsScreen}
          options={{ presentation: 'card' }}
        />
        <Stack.Screen
          name="Scan"
          component={ScanScreen}
          options={{ presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
