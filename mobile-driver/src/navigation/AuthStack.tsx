import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ActivateAccountScreen from '../screens/auth/ActivateAccountScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ActivateAccount: { token: string };
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ActivateAccount" component={ActivateAccountScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
