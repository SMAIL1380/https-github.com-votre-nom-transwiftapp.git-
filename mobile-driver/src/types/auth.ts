export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: Driver | null;
  loading: boolean;
  error: string | null;
}

export interface Driver {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  profileImage?: string;
  status: DriverStatus;
  currentVehicleId?: string;
  rating: number;
  completedDeliveries: number;
}

export enum DriverStatus {
  AVAILABLE = 'AVAILABLE',
  ON_DELIVERY = 'ON_DELIVERY',
  OFF_DUTY = 'OFF_DUTY',
  ON_BREAK = 'ON_BREAK'
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Driver;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface CompanyInfo {
  companyName: string;
  registrationNumber: string;
  taxIdentificationNumber: string;
  address: string;
}

export interface ExternalDriverRegistrationDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  licenseNumber: string;
  licenseExpiryDate: Date;
  vehicleType: string;
  insuranceNumber: string;
  insuranceExpiryDate: Date;
  companyInfo?: CompanyInfo;
}
