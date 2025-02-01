import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginCredentials, LoginResponse, Driver } from '../types/auth';
import { API_URL } from '../constants/config';

const AUTH_TOKEN_KEY = '@auth_token';
const USER_DATA_KEY = '@user_data';

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/driver/login`, credentials);
      const { token, user } = response.data;

      // Stocker le token et les données utilisateur
      await this.setToken(token);
      await this.setUserData(user);

      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
      this.token = null;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      const newToken = response.data.token;
      await this.setToken(newToken);
      return newToken;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async checkAuth(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return false;

      const response = await axios.get(`${API_URL}/auth/check`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async updateProfile(data: Partial<Driver>): Promise<Driver> {
    try {
      const response = await axios.put(`${API_URL}/driver/profile`, data, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      const updatedUser = response.data;
      await this.setUserData(updatedUser);
      return updatedUser;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      await axios.post(
        `${API_URL}/auth/change-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${this.token}` } }
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      this.token = token;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private async setUserData(user: Driver): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      this.token = token;
      return token;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getUserData(): Promise<Driver | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      throw new Error(error.response.data.message || 'Une erreur est survenue');
    }
    throw new Error('Erreur de connexion au serveur');
  }
}

const api = axios.create({
  baseURL: API_URL,
});

const handleApiError = (error: any) => {
  if (error.response) {
    throw new Error(error.response.data.message || 'Une erreur est survenue');
  }
  throw new Error('Erreur de connexion au serveur');
};

export const registerExternalDriver = async (formData: FormData): Promise<any> => {
  try {
    const response = await api.post('/driver-registration/external', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const validateActivationToken = async (token: string): Promise<any> => {
  try {
    const response = await api.get(`/driver-registration/external/validate-token?token=${token}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const completeRegistration = async (token: string, password: string): Promise<any> => {
  try {
    const response = await api.post('/driver-registration/external/complete-registration', {
      token,
      password,
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export default AuthService.getInstance();
