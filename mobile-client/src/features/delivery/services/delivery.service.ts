import axios from 'axios';
import { API_URL } from '../../../config';
import {
  CreateDeliveryRequest,
  Delivery,
  DeliveryTrackingInfo,
  PriceEstimate,
  DeliveryLocation,
  PackageDetails,
} from '../types/delivery.types';

const API = axios.create({
  baseURL: `${API_URL}/deliveries`,
});

export const DeliveryService = {
  async estimatePrice(
    pickup: DeliveryLocation,
    dropoff: DeliveryLocation,
    packageDetails: PackageDetails
  ): Promise<PriceEstimate> {
    const response = await API.post('/estimate', {
      pickup,
      dropoff,
      package: packageDetails,
    });
    return response.data;
  },

  async createDelivery(request: CreateDeliveryRequest): Promise<Delivery> {
    const response = await API.post('/', request);
    return response.data;
  },

  async getDelivery(id: string): Promise<Delivery> {
    const response = await API.get(`/${id}`);
    return response.data;
  },

  async getDeliveryByTracking(trackingNumber: string): Promise<Delivery> {
    const response = await API.get(`/tracking/${trackingNumber}`);
    return response.data;
  },

  async cancelDelivery(id: string): Promise<Delivery> {
    const response = await API.post(`/${id}/cancel`);
    return response.data;
  },

  async getTrackingInfo(id: string): Promise<DeliveryTrackingInfo> {
    const response = await API.get(`/${id}/tracking`);
    return response.data;
  },

  async getDeliveryHistory(
    page: number = 1,
    limit: number = 10
  ): Promise<{ items: Delivery[]; total: number }> {
    const response = await API.get('/history', {
      params: { page, limit },
    });
    return response.data;
  },

  async updateDeliveryInstructions(
    id: string,
    instructions: string
  ): Promise<Delivery> {
    const response = await API.patch(`/${id}/instructions`, { instructions });
    return response.data;
  },

  async validateAddress(address: Partial<DeliveryLocation>): Promise<{
    valid: boolean;
    suggestions?: DeliveryLocation[];
  }> {
    const response = await API.post('/validate-address', address);
    return response.data;
  },

  async searchNearbyDrivers(
    latitude: number,
    longitude: number
  ): Promise<{
    available: number;
    estimatedWaitTime: number;
  }> {
    const response = await API.get('/nearby-drivers', {
      params: { latitude, longitude },
    });
    return response.data;
  },
};
