/**
 * ApiService Unit Tests
 * 
 * Tests for HTTP client functionality including:
 * - HTTP methods (GET, POST, PUT, DELETE)
 * - Token injection
 * - Timeout handling
 * - Retry logic
 * - Interceptors
 * - Error handling
 */

import { ApiService } from '../apiService';
import { StorageService, STORAGE_KEYS } from '../storageService';
import { ApiError } from '../../utils/errors';

// Mock fetch
global.fetch = jest.fn();

// Mock StorageService
jest.mock('../storageService', () => ({
  StorageService: {
    get: jest.fn(),
    set: jest.fn(),
  },
  STORAGE_KEYS: {
    AUTH_TOKEN: '@auth_token',
  },
}));

// Mock error logging
jest.mock('../../utils/errors', () => ({
  ...jest.requireActual('../../utils/errors'),
  logError: jest.fn(),
}));

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ApiService.clearAuthToken();
    ApiService.setBaseUrl('https://api.example.com');
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Configuration', () => {
    it('should set base URL', () => {
      ApiService.setBaseUrl('https://test.com');
      expect(ApiService['baseUrl']).toBe('https://test.com');
    });

    it('should remove trailing slash from base URL', () => {
      ApiService.setBaseUrl('https://test.com/');
      expect(ApiService['baseUrl']).toBe('https://test.com');
    });

    it('should set auth token', () => {
      ApiService.setAuthToken('test-token');
      expect(ApiService['authToken']).toBe('test-token');
    });

    it('should clear auth token', () => {
      ApiService.setAuthToken('test-token');
      ApiService.clearAuthToken();
      expect(ApiService['authToken']).toBeNull();
    });
  });

  describe('HTTP Methods', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: { id: 1 } }),
      });
    });

    it('should make GET request', async () => {
      const response = await ApiService.get('/users');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(response.success).toBe(true);
    });

    it('should make GET request with query parameters', async () => {
      await ApiService.get('/users', { page: 1, limit: 10 });
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/users?page=1&limit=10',
        expect.any(Object)
      );
    });

    it('should make POST request', async () => {
      const data = { name: 'John' };
      await ApiService.post('/users', data);
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        })
      );
    });

    it('should make PUT request', async () => {
      const data = { name: 'Jane' };
      await ApiService.put('/users/1', data);
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(data),
        })
      );
    });

    it('should make DELETE request', async () => {
      await ApiService.delete('/users/1');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('Authentication Token Injection', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: {} }),
      });
    });

    it('should inject auth token in Authorization header', async () => {
      ApiService.setAuthToken('test-token-123');
      await ApiService.get('/protected');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token-123',
          }),
        })
      );
    });

    it('should not inject Authorization header when no token is set', async () => {
      await ApiService.get('/public');
      
      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(callArgs.headers['Authorization']).toBeUndefined();
    });
  });

  describe('Timeout Handling', () => {
    it('should timeout after 30 seconds by default', async () => {
      jest.useFakeTimers();
      
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise((resolve) => {
          setTimeout(() => resolve({
            ok: true,
            status: 200,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ success: true, data: {} }),
          }), 35000);
        })
      );

      const promise = ApiService.get('/slow');
      
      jest.advanceTimersByTime(30000);
      
      await expect(promise).rejects.toThrow();
      
      jest.useRealTimers();
    });
  });

  describe('Retry Logic', () => {
    it('should retry on network failure up to 3 times', async () => {
      let attemptCount = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.reject(new Error('Network request failed'));
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: true, data: {} }),
        });
      });

      const response = await ApiService.get('/flaky');
      
      expect(attemptCount).toBe(3);
      expect(response.success).toBe(true);
    });

    it('should not retry on non-network errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: { message: 'Bad request' } }),
      });

      await expect(ApiService.get('/invalid')).rejects.toThrow();
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should fail after max retries', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network request failed'));

      await expect(ApiService.get('/always-fails')).rejects.toThrow();
      expect(global.fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries = 3 total
    });
  });

  describe('Interceptors', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: {} }),
      });
    });

    it('should apply request interceptor', async () => {
      const interceptor = jest.fn((config) => {
        config.headers['X-Custom-Header'] = 'test-value';
        return config;
      });

      ApiService.onRequest(interceptor);
      await ApiService.get('/test');

      expect(interceptor).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'test-value',
          }),
        })
      );
    });

    it('should apply response interceptor', async () => {
      const interceptor = jest.fn((response) => {
        response.message = 'Intercepted';
        return response;
      });

      ApiService.onResponse(interceptor);
      const response = await ApiService.get('/test');

      expect(interceptor).toHaveBeenCalled();
      expect(response.message).toBe('Intercepted');
    });

    it('should apply error interceptor', async () => {
      const errorInterceptor = jest.fn();
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: { message: 'Server error' } }),
      });

      ApiService.onError(errorInterceptor);
      
      await expect(ApiService.get('/error')).rejects.toThrow();
      expect(errorInterceptor).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 Unauthorized', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: { message: 'Unauthorized' } }),
      });

      await expect(ApiService.get('/protected')).rejects.toMatchObject({
        status: 401,
        code: 'UNAUTHORIZED',
      });
    });

    it('should handle 404 Not Found', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: { message: 'Not found' } }),
      });

      await expect(ApiService.get('/missing')).rejects.toMatchObject({
        status: 404,
        code: 'NOT_FOUND',
      });
    });

    it('should handle 500 Internal Server Error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: { message: 'Server error' } }),
      });

      await expect(ApiService.get('/error')).rejects.toMatchObject({
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
      });
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network request failed'));

      await expect(ApiService.get('/offline')).rejects.toMatchObject({
        code: 'NETWORK_ERROR',
      });
    });
  });

  describe('Response Normalization', () => {
    it('should normalize response with success and data fields', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: { id: 1 } }),
      });

      const response = await ApiService.get('/test');
      
      expect(response).toEqual({
        success: true,
        data: { id: 1 },
      });
    });

    it('should normalize response with only data field', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ data: { id: 1 }, message: 'Success' }),
      });

      const response = await ApiService.get('/test');
      
      expect(response).toEqual({
        success: true,
        data: { id: 1 },
        message: 'Success',
      });
    });

    it('should wrap raw data in ApiResponse format', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ id: 1, name: 'Test' }),
      });

      const response = await ApiService.get('/test');
      
      expect(response).toEqual({
        success: true,
        data: { id: 1, name: 'Test' },
      });
    });
  });

  describe('Initialization', () => {
    it('should load token from storage on initialize', async () => {
      (StorageService.get as jest.Mock).mockResolvedValue('stored-token');

      await ApiService.initialize();

      expect(StorageService.get).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
      expect(ApiService['authToken']).toBe('stored-token');
    });

    it('should handle missing token gracefully', async () => {
      (StorageService.get as jest.Mock).mockResolvedValue(null);

      await ApiService.initialize();

      expect(ApiService['authToken']).toBeNull();
    });
  });
});
