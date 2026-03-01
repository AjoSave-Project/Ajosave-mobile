/**
 * Validation Utilities
 * 
 * Provides validation functions for common input types including email,
 * phone numbers, passwords, required fields, and numeric ranges.
 * All validators return a ValidationResult with isValid flag and optional error message.
 */

/**
 * Result of a validation operation
 */
export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  /** Error message if validation failed */
  error?: string;
}

/**
 * Options for password validation
 */
export interface PasswordValidationOptions {
  /** Minimum password length (default: 8) */
  minLength?: number;
  /** Require at least one uppercase letter (default: true) */
  requireUppercase?: boolean;
  /** Require at least one lowercase letter (default: true) */
  requireLowercase?: boolean;
  /** Require at least one number (default: true) */
  requireNumbers?: boolean;
  /** Require at least one special character (default: true) */
  requireSpecialChars?: boolean;
}

/**
 * Validates an email address using RFC 5322 compliant regex
 * 
 * @param email - The email address to validate
 * @returns ValidationResult with isValid flag and optional error message
 * 
 * @example
 * ```typescript
 * const result = validateEmail('user@example.com');
 * if (!result.isValid) {
 *   console.error(result.error);
 * }
 * ```
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      error: 'Email address is required',
    };
  }

  // RFC 5322 compliant email regex (simplified but comprehensive)
  // Matches: local-part@domain with proper character validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(email.trim())) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
    };
  }

  return { isValid: true };
}

/**
 * Validates a phone number for Nigerian format
 * 
 * Accepts formats:
 * - +234XXXXXXXXXX (13 characters total)
 * - 0XXXXXXXXXX (11 characters total)
 * 
 * Where X represents 10 digits after the country code or leading 0
 * 
 * @param phone - The phone number to validate
 * @returns ValidationResult with isValid flag and optional error message
 * 
 * @example
 * ```typescript
 * const result1 = validatePhoneNumber('+2348012345678');
 * const result2 = validatePhoneNumber('08012345678');
 * ```
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  if (!phone || phone.trim() === '') {
    return {
      isValid: false,
      error: 'Phone number is required',
    };
  }

  const trimmedPhone = phone.trim();

  // Nigerian format: +234XXXXXXXXXX or 0XXXXXXXXXX
  const nigerianRegex = /^(\+234[0-9]{10}|0[0-9]{10})$/;

  if (!nigerianRegex.test(trimmedPhone)) {
    return {
      isValid: false,
      error: 'Phone number must be 11 digits starting with 0 or +234',
    };
  }

  return { isValid: true };
}

/**
 * Validates password strength with configurable rules
 * 
 * @param password - The password to validate
 * @param options - Optional configuration for validation rules
 * @returns ValidationResult with isValid flag and optional error message
 * 
 * @example
 * ```typescript
 * // Use default rules (min 8 chars, uppercase, lowercase, number, special char)
 * const result1 = validatePassword('MyPass123!');
 * 
 * // Custom rules
 * const result2 = validatePassword('mypass', {
 *   minLength: 6,
 *   requireUppercase: false,
 *   requireSpecialChars: false,
 * });
 * ```
 */
export function validatePassword(
  password: string,
  options: PasswordValidationOptions = {}
): ValidationResult {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
  } = options;

  if (!password) {
    return {
      isValid: false,
      error: 'Password is required',
    };
  }

  // Check minimum length
  if (password.length < minLength) {
    return {
      isValid: false,
      error: `Password must be at least ${minLength} characters`,
    };
  }

  // Build requirements list for error message
  const requirements: string[] = [];

  // Check uppercase requirement
  if (requireUppercase && !/[A-Z]/.test(password)) {
    requirements.push('uppercase letter');
  }

  // Check lowercase requirement
  if (requireLowercase && !/[a-z]/.test(password)) {
    requirements.push('lowercase letter');
  }

  // Check number requirement
  if (requireNumbers && !/[0-9]/.test(password)) {
    requirements.push('number');
  }

  // Check special character requirement
  if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    requirements.push('special character');
  }

  // If any requirements failed, return error
  if (requirements.length > 0) {
    const requirementsList = requirements.join(', ');
    return {
      isValid: false,
      error: `Password must contain at least one ${requirementsList}`,
    };
  }

  return { isValid: true };
}

/**
 * Validates that a value is not empty
 * 
 * Checks for:
 * - null or undefined
 * - Empty strings (including whitespace-only)
 * - Empty arrays
 * - Empty objects
 * 
 * @param value - The value to validate
 * @param fieldName - Optional field name for error message (default: "This field")
 * @returns ValidationResult with isValid flag and optional error message
 * 
 * @example
 * ```typescript
 * const result1 = validateRequired('John');
 * const result2 = validateRequired('', 'Name');
 * const result3 = validateRequired([1, 2, 3]);
 * const result4 = validateRequired([]);
 * ```
 */
export function validateRequired(value: any, fieldName: string = 'This field'): ValidationResult {
  // Check for null or undefined
  if (value === null || value === undefined) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  // Check for empty string (including whitespace-only)
  if (typeof value === 'string' && value.trim() === '') {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  // Check for empty array
  if (Array.isArray(value) && value.length === 0) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  // Check for empty object
  if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  return { isValid: true };
}

/**
 * Validates that a numeric value is within a specified range
 * 
 * @param value - The numeric value to validate
 * @param min - Minimum allowed value (inclusive)
 * @param max - Maximum allowed value (inclusive)
 * @param fieldName - Optional field name for error message (default: "Value")
 * @returns ValidationResult with isValid flag and optional error message
 * 
 * @example
 * ```typescript
 * const result1 = validateRange(50, 0, 100);
 * const result2 = validateRange(150, 0, 100, 'Age');
 * const result3 = validateRange(-5, 0, 100);
 * ```
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string = 'Value'
): ValidationResult {
  // Check if value is a valid number
  if (typeof value !== 'number' || isNaN(value)) {
    return {
      isValid: false,
      error: `${fieldName} must be a valid number`,
    };
  }

  // Check minimum bound
  if (value < min) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${min}`,
    };
  }

  // Check maximum bound
  if (value > max) {
    return {
      isValid: false,
      error: `${fieldName} must be at most ${max}`,
    };
  }

  return { isValid: true };
}
