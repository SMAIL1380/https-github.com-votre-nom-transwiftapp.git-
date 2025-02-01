import axios from 'axios';
import { API_URL } from '../../../config';
import { ProfileData, UpdateProfileRequest, Address, AddAddressRequest } from '../types/profile.types';

const API = axios.create({
  baseURL: `${API_URL}/profile`,
});

export const ProfileService = {
  async getProfile(): Promise<ProfileData> {
    const response = await API.get('/me');
    return response.data;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<ProfileData> {
    const response = await API.put('/me', data);
    return response.data;
  },

  async uploadAvatar(file: FormData): Promise<{ avatarUrl: string }> {
    const response = await API.post('/avatar', file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getAddresses(): Promise<Address[]> {
    const response = await API.get('/addresses');
    return response.data;
  },

  async addAddress(address: AddAddressRequest): Promise<Address> {
    const response = await API.post('/addresses', address);
    return response.data;
  },

  async updateAddress(id: string, address: Partial<AddAddressRequest>): Promise<Address> {
    const response = await API.put(`/addresses/${id}`, address);
    return response.data;
  },

  async deleteAddress(id: string): Promise<void> {
    await API.delete(`/addresses/${id}`);
  },

  async setDefaultAddress(id: string): Promise<void> {
    await API.put(`/addresses/${id}/default`);
  },
};
