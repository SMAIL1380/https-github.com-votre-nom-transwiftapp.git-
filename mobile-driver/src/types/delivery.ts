export interface Location {
  latitude: number;
  longitude: number;
}

export interface TimeWindow {
  start: Date;
  end: Date;
}

export interface PackageDetails {
  weight: number;
  dimensions: string;
  type: string;
  specialInstructions?: string;
}

export interface DeliveryProof {
  signature?: string;
  photo?: string;
  note?: string;
  timestamp: Date;
}

export interface Route {
  coordinates: Location[];
  estimatedDistance: number;
  estimatedDuration: number;
  polyline: string;
}

export interface Delivery {
  id: string;
  status: 'pending' | 'accepted' | 'picked_up' | 'in_progress' | 'completed' | 'cancelled';
  pickupLocation: Location;
  deliveryLocation: Location;
  pickupAddress: string;
  deliveryAddress: string;
  customerName: string;
  customerPhone: string;
  packageDetails: PackageDetails;
  timeWindow?: TimeWindow;
  priority?: number;
  price: number;
  route?: Route;
  deliveryProof?: DeliveryProof;
  acceptedAt?: Date;
  pickedUpAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  lastLocationUpdate?: Date;
  currentLocation?: Location;
}
