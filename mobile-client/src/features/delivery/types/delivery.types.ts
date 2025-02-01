export type DeliveryStatus = 
  | 'pending'
  | 'accepted'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export type PackageSize = 'small' | 'medium' | 'large' | 'extra_large';

export interface PackageDetails {
  size: PackageSize;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  isFragile: boolean;
  requiresRefrigeration: boolean;
}

export interface DeliveryLocation {
  address: string;
  latitude: number;
  longitude: number;
  contactName: string;
  contactPhone: string;
  instructions?: string;
}

export interface PriceEstimate {
  basePrice: number;
  distancePrice: number;
  weightPrice: number;
  specialHandling: number;
  total: number;
  currency: string;
  estimatedDuration: number; // in minutes
}

export interface CreateDeliveryRequest {
  pickup: DeliveryLocation;
  dropoff: DeliveryLocation;
  package: PackageDetails;
  scheduledTime?: Date;
  specialInstructions?: string;
}

export interface Delivery {
  id: string;
  status: DeliveryStatus;
  trackingNumber: string;
  pickup: DeliveryLocation;
  dropoff: DeliveryLocation;
  package: PackageDetails;
  price: number;
  currency: string;
  scheduledTime?: Date;
  estimatedPickupTime?: Date;
  estimatedDeliveryTime?: Date;
  actualPickupTime?: Date;
  actualDeliveryTime?: Date;
  driverId?: string;
  driverLocation?: {
    latitude: number;
    longitude: number;
    lastUpdated: Date;
  };
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryStatusUpdate {
  status: DeliveryStatus;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  note?: string;
}

export interface DeliveryTrackingInfo {
  delivery: Delivery;
  statusUpdates: DeliveryStatusUpdate[];
  currentLocation?: {
    latitude: number;
    longitude: number;
    lastUpdated: Date;
  };
  eta?: Date;
}
