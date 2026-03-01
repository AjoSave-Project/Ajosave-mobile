/**
 * Error Handling Utilities
 * 
 * Provides error classification, handling, and logging functionality
 * for the AjoSave mobile application.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Error classification types
 */
export type ErrorType = 'network' | 'api' | 'validation' | 'runtime';

/**
 * Custom API Error class with detailed error information
 */
export class ApiError extends Error {
  code: string;
  status?: number;
  details?: any;
  type: ErrorType;

  constructor(
    message: string,
    code: string,
    status?: number,
    details?: any,
    type: ErrorType = 'api'
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.type = type;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * Error log entry structure
 */
interface ErrorLogEntry {
  timestamp: string;
  message: string;
  code: string;
  status?: number;
  details?: any;
  type: ErrorType;
  stack?: string;
}

/**
 * Storage key for error logs
 */
const ERROR_LOGS_KEY = '@error_logs';

/**
 * Maximum number of error logs to keep
 */
const MAX_ERROR_LOGS = 100;

/**
 * Handle API errors based on HTTP status codes
 * 
 * @param status - HTTP status code
 * @param message - Optional custom error message
 * @param details - Optional error details
 * @returns ApiError instance
 */
export function handleApiError(
  status: number,
  message?: string,
  details?: any
): ApiError {
  let errorMessage = message;
  let errorCode = 'UNKNOWN_ERROR';
  let errorType: ErrorType = 'api';

  switch (status) {
    case 400:
      errorCode = 'BAD_REQUEST';
      errorMessage = errorMessage || 'Invalid request. Please check your input and try again.';
      errorType = 'validation';
      break;

    case 401:
      errorCode = 'UNAUTHORIZED';
      errorMessage = errorMessage || 'Your session has expired. Please log in again.';
      errorType = 'api';
      break;

    case 403:
      errorCode = 'FORBIDDEN';
      errorMessage = errorMessage || 'You do not have permission to perform this action.';
      errorType = 'api';
      break;

    case 404:
      errorCode = 'NOT_FOUND';
      errorMessage = errorMessage || 'The requested resource was not found.';
      errorType = 'api';
      break;

    case 422:
      errorCode = 'VALIDATION_ERROR';
      errorMessage = errorMessage || 'Validation failed. Please check your input.';
      errorType = 'validation';
      break;

    case 429:
      errorCode = 'RATE_LIMIT_EXCEEDED';
      errorMessage = errorMessage || 'Too many requests. Please try again later.';
      errorType = 'api';
      break;

    case 500:
      errorCode = 'INTERNAL_SERVER_ERROR';
      errorMessage = errorMessage || 'Something went wrong on our end. Please try again later.';
      errorType = 'api';
      break;

    case 502:
      errorCode = 'BAD_GATEWAY';
      errorMessage = errorMessage || 'Service temporarily unavailable. Please try again.';
      errorType = 'network';
      break;

    case 503:
      errorCode = 'SERVICE_UNAVAILABLE';
      errorMessage = errorMessage || 'Service is currently unavailable. Please try again later.';
      errorType = 'network';
      break;

    case 504:
      errorCode = 'GATEWAY_TIMEOUT';
      errorMessage = errorMessage || 'Request timed out. Please check your connection and try again.';
      errorType = 'network';
      break;

    default:
      errorCode = 'UNKNOWN_ERROR';
      errorMessage = errorMessage || 'An unexpected error occurred. Please try again.';
      errorType = 'api';
  }

  return new ApiError(errorMessage, errorCode, status, details, errorType);
}

/**
 * Log error to local storage
 * Keeps only the last 100 errors to prevent storage overflow
 * 
 * @param error - Error to log (can be ApiError, Error, or any object)
 */
export async function logError(error: any): Promise<void> {
  try {
    // Create error log entry
    const logEntry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      message: error.message || String(error),
      code: error.code || 'UNKNOWN',
      status: error.status,
      details: error.details,
      type: error.type || 'runtime',
      stack: error.stack,
    };

    // Retrieve existing logs
    const existingLogsJson = await AsyncStorage.getItem(ERROR_LOGS_KEY);
    const existingLogs: ErrorLogEntry[] = existingLogsJson
      ? JSON.parse(existingLogsJson)
      : [];

    // Add new log entry
    existingLogs.push(logEntry);

    // Keep only the last MAX_ERROR_LOGS entries
    const trimmedLogs = existingLogs.slice(-MAX_ERROR_LOGS);

    // Save back to storage
    await AsyncStorage.setItem(ERROR_LOGS_KEY, JSON.stringify(trimmedLogs));
  } catch (storageError) {
    // If logging fails, log to console in development
    if (__DEV__) {
      console.error('Failed to log error to storage:', storageError);
      console.error('Original error:', error);
    }
  }
}

/**
 * Retrieve error logs from storage
 * 
 * @returns Array of error log entries
 */
export async function getErrorLogs(): Promise<ErrorLogEntry[]> {
  try {
    const logsJson = await AsyncStorage.getItem(ERROR_LOGS_KEY);
    return logsJson ? JSON.parse(logsJson) : [];
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to retrieve error logs:', error);
    }
    return [];
  }
}

/**
 * Clear all error logs from storage
 */
export async function clearErrorLogs(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ERROR_LOGS_KEY);
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to clear error logs:', error);
    }
  }
}

/**
 * Create a network error
 * 
 * @param message - Error message
 * @param details - Optional error details
 * @returns ApiError instance with network type
 */
export function createNetworkError(message?: string, details?: any): ApiError {
  return new ApiError(
    message || 'Network error. Please check your internet connection.',
    'NETWORK_ERROR',
    undefined,
    details,
    'network'
  );
}

/**
 * Create a validation error
 * 
 * @param message - Error message
 * @param details - Optional validation details
 * @returns ApiError instance with validation type
 */
export function createValidationError(message: string, details?: any): ApiError {
  return new ApiError(
    message,
    'VALIDATION_ERROR',
    undefined,
    details,
    'validation'
  );
}

/**
 * Create a runtime error
 * 
 * @param message - Error message
 * @param details - Optional error details
 * @returns ApiError instance with runtime type
 */
export function createRuntimeError(message: string, details?: any): ApiError {
  return new ApiError(
    message,
    'RUNTIME_ERROR',
    undefined,
    details,
    'runtime'
  );
}
