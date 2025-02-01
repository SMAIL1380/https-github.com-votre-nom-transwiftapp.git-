import axios from 'axios';
import { LoginCredentials, RegisterData, AuthUser } from '../types/auth.types';
import { EmailVerificationStatus, ResendVerificationResponse, VerifyEmailResponse } from '../types/email-verification.types';
import { API_URL } from '../../../config';

const API = axios.create({
  baseURL: `${API_URL}/auth`,
});

export const AuthService = {
  async login(credentials: LoginCredentials) {
    const response = await API.post('/login', credentials);
    return response.data;
  },

  async register(data: RegisterData) {
    const response = await API.post('/register', data);
    return response.data;
  },

  async resetPassword(email: string) {
    const response = await API.post('/reset-password', { email });
    return response.data;
  },

  async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    const response = await API.post('/verify-email', { token });
    return response.data;
  },

  async getEmailVerificationStatus(): Promise<EmailVerificationStatus> {
    const response = await API.get('/email-verification/status');
    return response.data;
  },

  async resendVerificationEmail(): Promise<ResendVerificationResponse> {
    const response = await API.post('/email-verification/resend');
    return response.data;
  },

  async refreshToken(token: string) {
    const response = await API.post('/refresh-token', { token });
    return response.data;
  },

  async updateProfile(userId: string, data: Partial<AuthUser>) {
    const response = await API.put(`/users/${userId}`, data);
    return response.data;
  },

  async logout(token: string) {
    const response = await API.post('/logout', { token });
    return response.data;
  },
};
