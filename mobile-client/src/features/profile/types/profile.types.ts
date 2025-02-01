export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  additionalInfo?: string;
  latitude?: number;
  longitude?: number;
}

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  addresses: Address[];
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface AddAddressRequest {
  label: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  additionalInfo?: string;
  isDefault?: boolean;
  latitude?: number;
  longitude?: number;
}
