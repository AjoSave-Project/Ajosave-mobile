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
  email: string;
  phoneNumber: string;
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

  async checkRegistrationStatus(email: string, phoneNumber: string): Promise<{
    exists: boolean;
    canContinue: boolean;
    isIncomplete?: boolean;
    userId?: string;
    email?: string;
    phoneNumber?: string;
    isEmailVerified?: boolean;
    currentStep?: string;
    message?: string;
  }> {
    const response = await ApiService.post<any>('/auth/check-registration-status', { 
      email, 
      phoneNumber 
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to check registration status');
    }
    
    return response.data;
  }

  // Simplified - skip OTP for contact verification in this flow
  // The real OTP will be sent after full registration
  async sendOtpToEmail(email: string, phoneNumber: string): Promise<{ userId: string; email: string }> {
    const response = await ApiService.post<{ userId: string; email: string }>('/auth/send-email-otp', { 
      email, 
      phoneNumber 
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to send verification code');
    }
    
    return response.data;
  }

  async verifyContactOtp(userId: string, otp: string): Promise<{ email: string; phoneNumber: string }> {
    const response = await ApiService.post<{ email: string; phoneNumber: string }>('/auth/verify-email-otp', { 
      userId, 
      otp 
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Invalid or expired OTP');
    }
    
    return response.data;
  }

  async sendOtp(userId: string): Promise<{ email?: string }> {
    const response = await ApiService.post<{ email: string }>('/auth/send-otp', { userId });
    if (!response.success) throw new Error('Failed to send OTP');
    return { email: response.data?.email };
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

  async forgotPassword(phoneNumber: string): Promise<{ userId?: string; email?: string; phoneNumber?: string }> {
    const response = await ApiService.post<{ userId?: string; email?: string; phoneNumber?: string }>('/auth/forgot-password', { phoneNumber });
    if (response.success) return response.data ?? {};
    throw new Error('Failed to send reset OTP');
  }

  async resetPassword(userId: string, otp: string, newPassword: string): Promise<void> {
    const response = await ApiService.post('/auth/reset-password', { userId, otp, newPassword });
    if (!response.success) throw new Error('Password reset failed');
  }

  /**
   * Verify BVN using Paystack
   */
  async verifyBVN(userId: string, bvn: string): Promise<{
    verified: boolean;
    message: string;
    data?: {
      bvn: string;
      firstName?: string;
      lastName?: string;
      verifiedAt?: string;
    };
  }> {
    console.log('[AuthService] Verifying BVN with:', { userId, bvn });
    
    const response = await ApiService.post<{
      verified: boolean;
      message: string;
      data?: any;
    }>('/identity/verify-bvn', { userId, bvn });

    console.log('[AuthService] BVN verification response:', response);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'BVN verification failed');
  }

  /**
   * Verify NIN
   */
  async verifyNIN(userId: string, nin: string): Promise<{
    verified: boolean;
    message: string;
    data?: {
      nin: string;
      firstName?: string;
      lastName?: string;
      verifiedAt?: string;
    };
  }> {
    const response = await ApiService.post<{
      verified: boolean;
      message: string;
      data?: any;
    }>('/identity/verify-nin', { userId, nin });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'NIN verification failed');
  }

  /**
   * Get verification status
   */
  async getVerificationStatus(userId: string): Promise<{
    bvnVerified: boolean;
    ninVerified: boolean;
    bvnVerifiedAt?: string;
    ninVerifiedAt?: string;
  }> {
    const response = await ApiService.get<{
      bvnVerified: boolean;
      ninVerified: boolean;
      bvnVerifiedAt?: string;
      ninVerifiedAt?: string;
    }>(`/identity/status/${userId}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Failed to get verification status');
  }

  /**
   * Verify face with BVN photo
   */
  async verifyFaceWithBVN(
    userId: string,
    bvn: string,
    faceImageUri: string
  ): Promise<{
    verified: boolean;
    message: string;
    confidence?: number;
    data?: {
      verifiedAt: string;
      matchScore: number;
    };
  }> {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('bvn', bvn);
      
      // Add face image
      const filename = faceImageUri.split('/').pop() || 'face.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('faceImage', {
        uri: faceImageUri,
        name: filename,
        type,
      } as any);

      const response = await ApiService.post<{
        verified: boolean;
        message: string;
        confidence?: number;
        data?: any;
      }>('/face/verify-bvn', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds
      });

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Face verification failed');
    } catch (error: any) {
      console.error('Face verification with BVN error:', error);
      throw new Error(
        error.message || 
        'Failed to verify face with BVN. Please try again.'
      );
    }
  }

  /**
   * Verify face with NIN photo
   */
  async verifyFaceWithNIN(
    userId: string,
    nin: string,
    faceImageUri: string
  ): Promise<{
    verified: boolean;
    message: string;
    confidence?: number;
    data?: {
      verifiedAt: string;
      matchScore: number;
    };
  }> {
    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('nin', nin);
      
      const filename = faceImageUri.split('/').pop() || 'face.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('faceImage', {
        uri: faceImageUri,
        name: filename,
        type,
      } as any);

      const response = await ApiService.post<{
        verified: boolean;
        message: string;
        confidence?: number;
        data?: any;
      }>('/face/verify-nin', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Face verification failed');
    } catch (error: any) {
      console.error('Face verification with NIN error:', error);
      throw new Error(
        error.message || 
        'Failed to verify face with NIN. Please try again.'
      );
    }
  }

  /**
   * Get face verification status
   */
  async getFaceVerificationStatus(userId: string): Promise<{
    isFaceVerified: boolean;
    faceVerifiedAt?: string;
  }> {
    try {
      const response = await ApiService.get<{
        isFaceVerified: boolean;
        faceVerifiedAt?: string;
      }>(`/face/status/${userId}`);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('Failed to get face verification status');
    } catch (error: any) {
      console.error('Get face verification status error:', error);
      throw new Error(
        error.message || 
        'Failed to get face verification status'
      );
    }
  }
}

export const AuthService = new AuthServiceClass();
