import { ViewStyle } from 'react-native';

export interface Delivery {
  id: string;
  status: DeliveryStatus;
  address: string;
  customerName: string;
  timestamp: number;
  notes?: string;
  photos?: string[];
  signature?: string;
  batteryLevel?: number;
}

export type DeliveryStatus = 'pending' | 'inProgress' | 'completed' | 'failed' | 'cancelled';

export interface DeliveryCardProps {
  delivery: Delivery;
  onPress?: (delivery: Delivery) => void;
  style?: ViewStyle;
}

export interface DeliveryListProps {
  deliveries: Delivery[];
  onDeliveryPress?: (delivery: Delivery) => void;
  loading?: boolean;
  onRefresh?: () => void;
  ListEmptyComponent?: React.ReactElement;
  style?: ViewStyle;
}
