/**
 * AuthContext - Authentication state management
 * 
 * Provides authentication state and actions to the entire app:
 * - User authentication state (user, isAuthenticated, isLoading)
 * - Biometric authentication state (biometricEnabled)
 * - Authentication actions (login, signup, verifyOtp, logout)
 * - Biometric actions (loginWithBiometric, enableBiometric, disableBiometric)
 * - Session management (checkSession)
 * 
 * Validates: Requirements 1.8, 1.9, 1.11, 1.12, 1.13, 1.14, 2.5, 3.2, 11.1
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService, RegisterRequest } from '../services/authService';
import { BiometricService } from '../services/biometricService';
import { StorageService, STORAGE_KEYS } from '../services/storageService';
import { User } from '../types/models';

/**
 * Authentication context value interface
 */
export interface AuthContextValue {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricEnabled: boolean;
  
  // Authentication actions
  login: (email: string, password: string) => Promise<void>;
  signup: (data: RegisterRequest) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Biometric actions
  loginWithBiometric: () => Promise<void>;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
  
  // Session management
  checkSession: () => Promise<boolean>;
}

/**
 * Authentication context
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthProvider props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component
 * 
 * Manages authentication state and provides authentication actions
 * to the entire application through context.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  /**
   * Check session on mount
   * Validates stored token and loads user data if valid
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check if session is valid
        const hasValidSession = await checkSession();
        
        if (hasValidSession) {
          // Load user data from storage
          const userData = await StorageService.get<User>(STORAGE_KEYS.USER_DATA);
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          }
          
          // Load biometric preference
          const biometricPref = await BiometricService.isEnabled();
          setBiometricEnabled(biometricPref);
        }
      } catch (error) {
        // Clear invalid session on error
        await AuthService.clearToken();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array is intentional - only run on mount

  /**
   * Login with email and password
   * @param email - User email
   * @param password - User password
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Call AuthService to login
      const response = await AuthService.login(email, password);
      
      // Update state
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register a new user
   * @param data - Registration data
   */
  const signup = async (data: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Call AuthService to signup
      await AuthService.signup(data);
      
      // Note: User is not authenticated yet, OTP verification required
      // State remains unauthenticated until verifyOtp is called
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verify OTP code
   * @param otp - One-time password code
   */
  const verifyOtp = async (otp: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Call AuthService to verify OTP
      const response = await AuthService.verifyOtp(otp);
      
      // Update state - user is now authenticated
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   * Clears all authentication data and cached user data
   */
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Call AuthService to logout (clears token and cached data)
      await AuthService.logout();
      
      // Update state
      setUser(null);
      setIsAuthenticated(false);
      setBiometricEnabled(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login with biometric authentication
   * Authenticates user with Face ID/Touch ID and retrieves stored token
   */
  const loginWithBiometric = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Check if biometric is enabled
      const isEnabled = await BiometricService.isEnabled();
      if (!isEnabled) {
        throw new Error('Biometric authentication is not enabled');
      }
      
      // Authenticate with biometric
      const result = await BiometricService.authenticate({
        promptMessage: 'Authenticate to access your account',
        cancelLabel: 'Cancel',
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Biometric authentication failed');
      }
      
      // Retrieve stored token
      const token = await AuthService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Validate token
      const isValid = AuthService.isTokenValid(token);
      if (!isValid) {
        throw new Error('Authentication token is expired');
      }
      
      // Load user data
      const userData = await StorageService.get<User>(STORAGE_KEYS.USER_DATA);
      if (!userData) {
        throw new Error('User data not found');
      }
      
      // Update state
      setUser(userData);
      setIsAuthenticated(true);
      setBiometricEnabled(true);
    } catch (error) {
      console.error('Biometric login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Enable biometric authentication
   * Authenticates user with biometric and stores preference
   */
  const enableBiometric = async (): Promise<void> => {
    try {
      // Check if biometric is available
      const isAvailable = await BiometricService.isAvailable();
      if (!isAvailable) {
        throw new Error('Biometric authentication is not available on this device');
      }
      
      // Check if biometric is enrolled
      const isEnrolled = await BiometricService.isEnrolled();
      if (!isEnrolled) {
        throw new Error('No biometric credentials are enrolled on this device');
      }
      
      // Authenticate to confirm user wants to enable
      const result = await BiometricService.authenticate({
        promptMessage: 'Authenticate to enable biometric login',
        cancelLabel: 'Cancel',
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Biometric authentication failed');
      }
      
      // Enable biometric preference
      await BiometricService.enable();
      setBiometricEnabled(true);
    } catch (error) {
      console.error('Enable biometric error:', error);
      throw error;
    }
  };

  /**
   * Disable biometric authentication
   * Removes biometric preference from storage
   */
  const disableBiometric = async (): Promise<void> => {
    try {
      await BiometricService.disable();
      setBiometricEnabled(false);
    } catch (error) {
      console.error('Disable biometric error:', error);
      throw error;
    }
  };

  /**
   * Check if user has a valid session
   * @returns True if session is valid, false otherwise
   */
  const checkSession = async (): Promise<boolean> => {
    try {
      return await AuthService.checkSession();
    } catch (error) {
      console.error('Check session error:', error);
      return false;
    }
  };

  const value: AuthContextValue = {
    // State
    user,
    isAuthenticated,
    isLoading,
    biometricEnabled,
    
    // Authentication actions
    login,
    signup,
    verifyOtp,
    logout,
    
    // Biometric actions
    loginWithBiometric,
    enableBiometric,
    disableBiometric,
    
    // Session management
    checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth hook
 * 
 * Custom hook to access authentication context
 * @returns Authentication context value
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
