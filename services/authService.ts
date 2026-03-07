/**
 * AuthService - Authentication logic
 *
 * Connects to backend API for authentication:
 * - Login with phone number and password
 * - Register with full KYC details
 * - Verify user with address
 * - Get current user
 * - Logout
 *
 * Note: Backend uses httpOnly cookies for JWT tokens
 */

import { ApiService } from './apiService';
import { StorageService, STORAGE_KEYS } from './storageService';
import { User } from '../types/models';

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  bvn: string;
  nin: string;
  dateOfBirth: string; // ISO date string (YYYY-MM-DD)
}

export interface OtpRequiredResponse {
  requiresOtp: true;
  userId: string;
  phoneNumber: string;
  devOtp?: string;
}

class AuthServiceClass {
  async login(phoneNumber: string, password: string): Promise<{ user: User } | OtpRequiredResponse> {
    const response = await ApiService.post<{ user: User; token: string } | OtpRequiredResponse>('/auth/login', {
      phoneNumber,
      password,
    });

    if (response.success && response.data) {
      if ((response.data as OtpRequiredResponse).requiresOtp) {
        return response.data as OtpRequiredResponse;
      }
      const data = response.data as { user: User; token: string };
      if (data.token) {
        await StorageService.set(STORAGE_KEYS.AUTH_TOKEN, data.token);
        ApiService.setAuthToken(data.token);
      }
      await StorageService.set(STORAGE_KEYS.USER_DATA, data.user);
      return data;
    }

    throw new Error('Login failed');
  }

  async signup(data: RegisterRequest): Promise<{ user: User } | OtpRequiredResponse> {
    const response = await ApiService.post<{ user: User; token: string } | OtpRequiredResponse>('/auth/register', data);

    if (response.success && response.data) {
      if ((response.data as OtpRequiredResponse).requiresOtp) {
        return response.data as OtpRequiredResponse;
      }
      const d = response.data as { user: User; token: string };
      if (d.token) {
        await StorageService.set(STORAGE_KEYS.AUTH_TOKEN, d.token);
        ApiService.setAuthToken(d.token);
      }
      await StorageService.set(STORAGE_KEYS.USER_DATA, d.user);
      return d;
    }

    throw new Error('Signup failed');
  }

  async sendOtp(userId: string): Promise<{ devOtp?: string }> {
    const response = await ApiService.post<{ phoneNumber: string; devOtp?: string }>('/auth/send-otp', { userId });
    if (!response.success) throw new Error('Failed to send OTP');
    return { devOtp: response.data?.devOtp };
  }

  async verifyOtp(userId: string, otp: string): Promise<{ user: User; token: string }> {
    const response = await ApiService.post<{ user: User; token: string }>('/auth/verify-otp', { userId, otp });
    if (response.success && response.data) {
      if (response.data.token) {
        await StorageService.set(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
        ApiService.setAuthToken(response.data.token);
      }
      await StorageService.set(STORAGE_KEYS.USER_DATA, response.data.user);
      return response.data;
    }
    throw new Error('OTP verification failed');
  }

  async verifyFace(): Promise<{ user: User }> {
    const response = await ApiService.post<{ user: User }>('/auth/verify-face', {});
    if (response.success && response.data) {
      await StorageService.set(STORAGE_KEYS.USER_DATA, response.data.user);
      return response.data;
    }
    throw new Error('Face verification failed');
  }

  async verifyUser(address: string): Promise<{ user: User }> {
    const response = await ApiService.put<{ user: User }>('/auth/verify', { address });

    if (response.success && response.data) {
      await StorageService.set(STORAGE_KEYS.USER_DATA, response.data.user);
      return response.data;
    }

    throw new Error('Verification failed');
  }

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await ApiService.get<{ user: User }>('/auth/me');

    if (response.success && response.data) {
      await StorageService.set(STORAGE_KEYS.USER_DATA, response.data.user);
      return response.data;
    }

    throw new Error('Failed to get user info');
  }

  async logout(): Promise<void> {
    try {
      await ApiService.post('/auth/logout', {});
    } catch {
      // Ignore errors from logout endpoint
    } finally {
      ApiService.clearAuthToken();
      await StorageService.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.WALLET_DATA,
        STORAGE_KEYS.TRANSACTIONS_DATA,
        STORAGE_KEYS.GROUPS_DATA,
      ]);
    }
  }

  async checkSession(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  async forgotPassword(phoneNumber: string): Promise<{ userId?: string; phoneNumber?: string; devOtp?: string }> {
    const response = await ApiService.post<{ userId?: string; phoneNumber?: string; devOtp?: string }>('/auth/forgot-password', { phoneNumber });
    if (response.success) return response.data ?? {};
    throw new Error('Failed to send reset OTP');
  }

  async resetPassword(userId: string, otp: string, newPassword: string): Promise<void> {
    const response = await ApiService.post('/auth/reset-password', { userId, otp, newPassword });
    if (!response.success) throw new Error('Password reset failed');
  }
}

export const AuthService = new AuthServiceClass();
