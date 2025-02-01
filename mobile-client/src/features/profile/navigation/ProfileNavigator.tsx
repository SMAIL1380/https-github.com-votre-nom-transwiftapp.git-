import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AddressesScreen } from '../screens/AddressesScreen';
import { OrderHistoryScreen } from '../screens/OrderHistoryScreen';

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Addresses: undefined;
  OrderHistory: undefined;
};

const Stack = createStackNavigator<ProfileStackParamList>();

export const ProfileNavigator: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: t('profile.title') }}
      />
      <Stack.Screen
        name="Addresses"
        component={AddressesScreen}
        options={{ title: t('profile.addresses') }}
      />
      <Stack.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
        options={{ title: t('profile.orderHistory') }}
      />
    </Stack.Navigator>
  );
};
