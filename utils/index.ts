/**
 * Utility Functions Index
 * 
 * Central export point for all utility functions including:
 * - Currency formatting and parsing
 * - Date formatting and parsing
 * - Input validation
 */

// Currency utilities
export {
  formatCurrency,
  parseCurrency,
  type CurrencyFormatOptions,
} from './currency';

// Date utilities
export {
  formatDate,
  formatRelativeTime,
  parseISODate,
  type DateFormat,
} from './date';

// Validation utilities
export {
  validateEmail,
  validatePhoneNumber,
  validatePassword,
  validateRequired,
  validateRange,
  type ValidationResult,
  type PasswordValidationOptions,
} from './validation';

// Error handling utilities
export {
  ApiError,
  handleApiError,
  logError,
  getErrorLogs,
  clearErrorLogs,
  createNetworkError,
  createValidationError,
  createRuntimeError,
  type ErrorType,
} from './errors';
