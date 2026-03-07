/**
 * AuthContext - Authentication state management
 * 
 * Provides authentication state and actions to the entire app:
 * - User authentication state (user, isAuthenticated, isLoading)
 * - Authentication actions (login, signup, verifyUser, logout)
 * - Session management (checkSession)
 * 
 * Note: Backend uses httpOnly cookies for JWT tokens
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService, RegisterRequest, OtpRequiredResponse } from '../services/authService';
import { StorageService, STORAGE_KEYS } from '../services/storageService';
import { ApiService } from '../services/apiService';
import { User } from '../types/models';

/**
 * Authentication context value interface
 */
export interface AuthContextValue {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Authentication actions
  login: (phoneNumber: string, password: string) => Promise<OtpRequiredResponse | void>;
  signup: (data: RegisterRequest) => Promise<OtpRequiredResponse | void>;
  verifyUser: (address: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  completeOtpLogin: (user: User, token: string) => Promise<void>;
  
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
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Check session on mount
   * Validates stored session and loads user data if valid
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Ensure the token is loaded into ApiService BEFORE calling checkSession.
        // _layout.tsx also calls ApiService.initialize() but that races with this
        // useEffect, so we load it here too (idempotent — just sets the in-memory token).
        await ApiService.initialize();
        
        // Check if session is valid by trying to get current user
        const hasValidSession = await checkSession();
        
        if (hasValidSession) {
          // Load user data from storage
          const userData = await StorageService.get<User>(STORAGE_KEYS.USER_DATA);
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        // Clear invalid session on error
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
   * Login with phone number and password
   * @param phoneNumber - User phone number
   * @param password - User password
   */
  const login = async (phoneNumber: string, password: string): Promise<OtpRequiredResponse | void> => {
    try {
      setIsLoading(true);
      
      const response = await AuthService.login(phoneNumber, password);
      
      if ((response as OtpRequiredResponse).requiresOtp) {
        return response as OtpRequiredResponse;
      }

      const data = response as { user: User };
      setUser(data.user);
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
   * @param data - Registration data with KYC info
   */
  const signup = async (data: RegisterRequest): Promise<OtpRequiredResponse | void> => {
    try {
      setIsLoading(true);
      
      const response = await AuthService.signup(data);
      
      if ((response as OtpRequiredResponse).requiresOtp) {
        return response as OtpRequiredResponse;
      }

      const d = response as { user: User };
      setUser(d.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const completeOtpLogin = async (user: User, token: string): Promise<void> => {
    await StorageService.set(STORAGE_KEYS.AUTH_TOKEN, token);
    await StorageService.set(STORAGE_KEYS.USER_DATA, user);
    ApiService.setAuthToken(token); // ensure in-memory token is set immediately
    setUser(user);
    setIsAuthenticated(true);
  };

  /**
   * Verify user with address (complete KYC)
   * @param address - User's address
   */
  const verifyUser = async (address: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Call AuthService to verify user
      const response = await AuthService.verifyUser(address);
      
      // Update state with verified user
      setUser(response.user);
    } catch (error) {
      console.error('Verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh user data from backend
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const response = await AuthService.getCurrentUser();
      setUser(response.user);
    } catch (error) {
      console.error('Refresh user error:', error);
      throw error;
    }
  };

  /**
   * Logout user
   * Clears all authentication data and cached user data
   */
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Call AuthService to logout (clears cookie and cached data)
      await AuthService.logout();
      
      // Update state
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
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
    
    // Authentication actions
    login,
    signup,
    verifyUser,
    logout,
    refreshUser,
    completeOtpLogin,
    
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
