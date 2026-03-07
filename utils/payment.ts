/**
 * Payment utility functions for Paystack integration
 */

/**
 * Generate a unique payment reference for Paystack transactions
 * Format: AJO_{timestamp}_{random}
 */
export function generatePaymentReference(): string {
  return `AJO_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}
