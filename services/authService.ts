/**
 * AuthService - Authentication logic and token management
 * 
 * Provides authentication methods:
 * - Login, signup, OTP verification, logout
 * - Token management (get, set, clear, validate)
 * - Session checking and refresh
 * - JWT token expiration checking
 */

import { ApiService, ApiResponse } from './apiService';
import { StorageService, STORAGE_KEYS } from './storageService';
import { User } from '../types/models';

/**
 * Authentication response from API
 */
export interface AuthResponse {
  token: string;
  user: User;
  expiresAt: string;
}

/**
 * Registration request data
 */
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

/**
 * JWT payload structure
 */
interface JWTPayload {
  exp: number;
  iat: number;
  sub: string;
  [key: string]: any;
}

/**
 * AuthService class for authentication operations
 */
class AuthServiceClass {
  /**
   * Login with email and password
   * @param email - User email
   * @param password - User password
   * @returns Authentication response with token and user data
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await ApiService.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    });

    if (response.success && response.data) {
      await this.setToken(response.data.token);
      await StorageService.set(STORAGE_KEYS.USER_DATA, response.data.user);
      return response.data;
    }

    throw new Error('Login failed');
  }

  /**
   * Register a new user
   * @param data - Registration data
   * @returns Authentication response (may require OTP verification)
   */
  async signup(data: RegisterRequest): Promise<AuthResponse> {
    const response = await ApiService.post<AuthResponse>('/api/auth/signup', data);

    if (response.success && response.data) {
      // Note: Token may not be set yet if OTP verification is required
      return response.data;
    }

    throw new Error('Signup failed');
  }

  /**
   * Verify OTP code
   * @param otp - One-time password code
   * @returns Authentication response with token and user data
   */
  async verifyOtp(otp: string): Promise<AuthResponse> {
    const response = await ApiService.post<AuthResponse>('/api/auth/verify-otp', {
      otp,
    });

    if (response.success && response.data) {
      await this.setToken(response.data.token);
      await StorageService.set(STORAGE_KEYS.USER_DATA, response.data.user);
      return response.data;
    }

    throw new Error('OTP verification failed');
  }

  /**
   * Logout user and clear all data
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint (optional, may not exist on backend)
      await ApiService.post('/api/auth/logout').catch(() => {
        // Ignore errors from logout endpoint
      });
    } finally {
      // Clear all user data regardless of API call result
      await this.clearToken();
      await StorageService.multiRemove([
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.WALLET_DATA,
        STORAGE_KEYS.TRANSACTIONS_DATA,
        STORAGE_KEYS.GROUPS_DATA,
      ]);
    }
  }

  /**
   * Get stored authentication token
   * @returns Token string or null if not found
   */
  async getToken(): Promise<string | null> {
    return await StorageService.get<string>(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Store authentication token
   * @param token - JWT token string
   */
  async setToken(token: string): Promise<void> {
    await StorageService.set(STORAGE_KEYS.AUTH_TOKEN, token);
    ApiService.setAuthToken(token);
  }

  /**
   * Clear authentication token
   */
  async clearToken(): Promise<void> {
    await StorageService.remove(STORAGE_KEYS.AUTH_TOKEN);
    ApiService.clearAuthToken();
  }

  /**
   * Check if a JWT token is valid (not expired)
   * @param token - JWT token string
   * @returns True if token is valid, false otherwise
   */
  isTokenValid(token: string): boolean {
    try {
      const payload = this.decodeJWT(token);
      
      if (!payload || !payload.exp) {
        return false;
      }

      // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user has a valid session
   * @returns True if session is valid, false otherwise
   */
  async checkSession(): Promise<boolean> {
    const token = await this.getToken();
    
    if (!token) {
      return false;
    }

    return this.isTokenValid(token);
  }

  /**
   * Refresh the authentication session
   * Attempts to refresh the token with the backend
   */
  async refreshSession(): Promise<void> {
    try {
      const response = await ApiService.post<AuthResponse>('/api/auth/refresh');
      
      if (response.success && response.data) {
        await this.setToken(response.data.token);
        await StorageService.set(STORAGE_KEYS.USER_DATA, response.data.user);
      }
    } catch (error) {
      // If refresh fails, clear the session
      await this.clearToken();
      throw error;
    }
  }

  /**
   * Decode JWT token to extract payload
   * @param token - JWT token string
   * @returns Decoded payload or null if invalid
   */
  private decodeJWT(token: string): JWTPayload | null {
    try {
      // JWT format: header.payload.signature
      const parts = token.split('.');
      
      if (parts.length !== 3) {
        return null;
      }

      // Decode the payload (second part)
      const payload = parts[1];
      
      // Base64 decode (handle URL-safe base64)
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload) as JWTPayload;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }
}

// Export singleton instance
export const AuthService = new AuthServiceClass();
