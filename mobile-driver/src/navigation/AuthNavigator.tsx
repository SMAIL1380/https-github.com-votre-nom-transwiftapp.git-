import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DocumentVerificationScreen from '../screens/auth/DocumentVerificationScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen 
        name="DocumentVerification" 
        component={DocumentVerificationScreen}
        options={{
          headerShown: true,
          title: 'Vérification des documents',
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
