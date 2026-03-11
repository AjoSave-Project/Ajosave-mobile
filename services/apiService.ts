/**
 * ApiService - HTTP client for backend communication
 * 
 * Provides a centralized HTTP client with features:
 * - Automatic token injection
 * - Request/response interceptors
 * - Timeout handling (30s default)
 * - Automatic retry on network failure (max 3 attempts)
 * - Request/response logging in development
 * - Error normalization
 */

import { handleApiError, createNetworkError, logError } from '../utils/errors';
import { StorageService, STORAGE_KEYS } from './storageService';

/**
 * API Response structure
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Request configuration
 */
interface RequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Record<string, string>;
  body?: any;
  timeout?: number;
}

/**
 * Interceptor function types
 */
export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
export type ResponseInterceptor = (response: ApiResponse<any>) => ApiResponse<any>;
export type ErrorInterceptor = (error: any) => void;

/**
 * ApiService class for HTTP communication
 */
class ApiServiceClass {
  private baseUrl: string = '';
  private fallbackUrl: string = '';
  private authToken: string | null = null;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];
  private readonly defaultTimeout = 60000; // 60 seconds
  private readonly maxRetries = 3;
  private useFallback: boolean = false;

  /**
   * Set the base URL for API requests
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  }

  /**
   * Set fallback URL for when primary URL fails
   */
  setFallbackUrl(url: string): void {
    this.fallbackUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    this.authToken = null;
  }

  /**
   * Add request interceptor
   */
  onRequest(callback: RequestInterceptor): void {
    this.requestInterceptors.push(callback);
  }

  /**
   * Add response interceptor
   */
  onResponse(callback: ResponseInterceptor): void {
    this.responseInterceptors.push(callback);
  }

  /**
   * Add error interceptor
   */
  onError(callback: ErrorInterceptor): void {
    this.errorInterceptors.push(callback);
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, params);
    return this.request<T>('GET', url);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('POST', url, data);
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('PUT', url, data);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('DELETE', url);
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('PATCH', url, data);
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    let url = `${this.baseUrl}${path}`;

    if (params && Object.keys(params).length > 0) {
      const queryString = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');
      
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return url;
  }

  /**
   * Core request method with retry logic and fallback
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    body?: any,
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    try {
      // Build request config
      let config: RequestConfig = {
        url,
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body,
        timeout: this.defaultTimeout,
      };

      // Add auth token if available
      if (this.authToken) {
        config.headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      // Apply request interceptors
      for (const interceptor of this.requestInterceptors) {
        config = await interceptor(config);
      }

      // Make the request with timeout
      const response = await this.fetchWithTimeout(config);

      // Log errors in development
      if (__DEV__ && !response.success) {
        console.warn(`[API Error] ${method} ${url}`, response);
      }

      // Apply response interceptors
      let apiResponse = response;
      for (const interceptor of this.responseInterceptors) {
        apiResponse = interceptor(apiResponse);
      }

      return apiResponse;
    } catch (error: any) {
      // If primary URL timed out and we have a fallback, try fallback
      if (
        error.code === 'TIMEOUT_ERROR' &&
        !this.useFallback &&
        this.fallbackUrl &&
        !url.includes(this.fallbackUrl)
      ) {
        if (__DEV__) {
          console.log(`[API] Primary URL timed out, switching to fallback: ${this.fallbackUrl}`);
        }
        this.useFallback = true;
        const fallbackUrl = url.replace(this.baseUrl, this.fallbackUrl);
        return this.request<T>(method, fallbackUrl, body, 0);
      }

      // Check if we should retry on network failure
      if (this.isNetworkError(error) && retryCount < this.maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, retryCount) * 1000;
        await this.sleep(delay);
        
        return this.request<T>(method, url, body, retryCount + 1);
      }

      // Log error
      await logError(error);

      // Apply error interceptors
      for (const interceptor of this.errorInterceptors) {
        interceptor(error);
      }

      throw error;
    }
  }

  /**
   * Fetch with timeout support
   */
  private async fetchWithTimeout(config: RequestConfig): Promise<ApiResponse<any>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout || this.defaultTimeout);

    try {
      const fetchOptions: RequestInit = {
        method: config.method,
        headers: config.headers,
        signal: controller.signal,
      };

      if (config.method !== 'GET') {
        fetchOptions.body = JSON.stringify(config.body ?? {});
      }

      const response = await fetch(config.url, fetchOptions);
      clearTimeout(timeoutId);

      // Parse response
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle non-2xx responses
      if (!response.ok) {
        const apiError = handleApiError(
          response.status,
          data?.message || data?.error?.message,
          data?.errors || data?.error?.details || data
        );
        throw apiError;
      }

      // Normalize response format
      return this.normalizeResponse(data);
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Handle abort (timeout)
      if (error.name === 'AbortError') {
        const timeoutError = new Error('Request timed out. Please try again.');
        (timeoutError as any).code = 'TIMEOUT_ERROR';
        throw timeoutError;
      }

      // Handle network errors
      if (error.message === 'Network request failed' || error.message.includes('fetch')) {
        const networkError = createNetworkError(
          'Unable to connect. Please check your internet connection.',
          { originalError: error.message }
        );
        throw networkError;
      }

      // Re-throw API errors
      throw error;
    }
  }

  /**
   * Normalize response to ApiResponse format
   */
  private normalizeResponse<T>(data: any): ApiResponse<T> {
    // Check if response is HTML (backend not running)
    if (typeof data === 'string' && data.trim().startsWith('<!DOCTYPE')) {
      throw handleApiError(503, 'Backend service unavailable. Please ensure the API server is running.');
    }

    // If already in correct format
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      return data as ApiResponse<T>;
    }

    // If response has a data field
    if (data && typeof data === 'object' && 'data' in data) {
      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    }

    // Wrap raw data
    return {
      success: true,
      data: data as T,
    };
  }

  /**
   * Check if error is a network error
   */
  private isNetworkError(error: any): boolean {
    return (
      error.code === 'NETWORK_ERROR' ||
      error.message === 'Network request failed' ||
      error.message?.includes('fetch') ||
      error.name === 'TypeError'
    );
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Initialize API service with stored token
   */
  async initialize(): Promise<void> {
    try {
      const token = await StorageService.get<string>(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        this.setAuthToken(token);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to initialize API service:', error);
      }
    }
  }
}

// Export singleton instance
export const ApiService = new ApiServiceClass();

