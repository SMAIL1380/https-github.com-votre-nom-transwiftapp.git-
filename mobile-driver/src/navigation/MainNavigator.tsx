import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from '../screens/home/HomeScreen';
import DeliveryDetailsScreen from '../screens/delivery/DeliveryDetailsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import DocumentsScreen from '../screens/profile/DocumentsScreen';
import StatisticsScreen from '../screens/profile/StatisticsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="HomeMain" 
      component={HomeScreen}
      options={{ title: 'Accueil' }}
    />
    <Stack.Screen 
      name="DeliveryDetails" 
      component={DeliveryDetailsScreen}
      options={{ title: 'Détails de la livraison' }}
    />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ProfileMain" 
      component={ProfileScreen}
      options={{ title: 'Profil' }}
    />
    <Stack.Screen 
      name="Documents" 
      component={DocumentsScreen}
      options={{ title: 'Documents' }}
    />
    <Stack.Screen 
      name="Statistics" 
      component={StatisticsScreen}
      options={{ title: 'Statistiques' }}
    />
  </Stack.Navigator>
);

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ 
          headerShown: false,
          title: 'Accueil'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ 
          headerShown: false,
          title: 'Profil'
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
