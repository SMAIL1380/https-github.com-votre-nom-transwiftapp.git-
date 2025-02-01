import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// Types pour les paramètres des routes
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  DeliveryDetails: { deliveryId: string };
  ScanPackage: undefined;
  VehicleCheck: undefined;
  Incident: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Deliveries: undefined;
  Vehicle: undefined;
  Chat: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ActivateAccount: { token: string };
  ForgotPassword: undefined;
};

// Types pour la navigation
export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;
export type AuthStackNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

// Types pour les routes
export type DeliveryDetailsRouteProp = RouteProp<RootStackParamList, 'DeliveryDetails'>;

// Props de navigation communes
export interface NavigationProps {
  navigation: RootStackNavigationProp;
  route: RouteProp<RootStackParamList, keyof RootStackParamList>;
}
