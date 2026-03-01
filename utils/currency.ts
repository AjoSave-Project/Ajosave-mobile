/**
 * Currency formatting utilities for the AjoSave mobile app.
 * Provides locale-aware currency formatting with support for multiple currencies,
 * compact notation for large numbers, and currency parsing.
 */

/**
 * Supported currency codes
 */
export type CurrencyCode = 'NGN' | 'USD' | 'GBP' | 'EUR';

/**
 * Options for currency formatting
 */
export interface CurrencyFormatOptions {
  /**
   * Currency code (default: 'NGN')
   */
  currency?: CurrencyCode;
  
  /**
   * Locale for formatting (default: 'en-NG' for NGN, 'en-US' for USD, etc.)
   */
  locale?: string;
  
  /**
   * Use compact notation for large numbers (e.g., 1.2K, 1.5M)
   * @default false
   */
  compact?: boolean;
  
  /**
   * Show currency symbol
   * @default true
   */
  showSymbol?: boolean;
}

/**
 * Default locales for each currency
 */
const DEFAULT_LOCALES: Record<CurrencyCode, string> = {
  NGN: 'en-NG',
  USD: 'en-US',
  GBP: 'en-GB',
  EUR: 'en-IE',
};

/**
 * Formats a number as currency with locale-aware formatting.
 * 
 * @param amount - The numeric amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 * 
 * @example
 * ```typescript
 * formatCurrency(1000) // "₦1,000.00"
 * formatCurrency(1500, { currency: 'USD' }) // "$1,500.00"
 * formatCurrency(1500000, { compact: true }) // "₦1.5M"
 * formatCurrency(-500) // "-₦500.00"
 * ```
 */
export function formatCurrency(
  amount: number,
  options: CurrencyFormatOptions = {}
): string {
  const {
    currency = 'NGN',
    locale = DEFAULT_LOCALES[currency],
    compact = false,
    showSymbol = true,
  } = options;

  // Handle compact notation for large numbers
  if (compact && Math.abs(amount) >= 1000) {
    return formatCompactCurrency(amount, currency, locale, showSymbol);
  }

  // Use Intl.NumberFormat for standard formatting
  const formatter = new Intl.NumberFormat(locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}

/**
 * Formats a number with compact notation (K, M, B)
 * @internal
 */
function formatCompactCurrency(
  amount: number,
  currency: CurrencyCode,
  locale: string,
  showSymbol: boolean
): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  
  let value: number;
  let suffix: string;
  
  if (absAmount >= 1_000_000_000) {
    // Billions
    value = absAmount / 1_000_000_000;
    suffix = 'B';
  } else if (absAmount >= 1_000_000) {
    // Millions
    value = absAmount / 1_000_000;
    suffix = 'M';
  } else {
    // Thousands
    value = absAmount / 1_000;
    suffix = 'K';
  }
  
  // Format the value with appropriate decimal places
  const decimalPlaces = value >= 10 ? 1 : 1;
  const formattedValue = value.toFixed(decimalPlaces);
  
  // Get currency symbol if needed
  if (showSymbol) {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    
    // Extract currency symbol from formatted zero
    const formatted = formatter.format(0);
    const symbol = formatted.replace(/[\d,.\s]/g, '');
    
    return `${sign}${symbol}${formattedValue}${suffix}`;
  }
  
  return `${sign}${formattedValue}${suffix}`;
}

/**
 * Parses a formatted currency string back to a number.
 * Handles currency symbols, thousand separators, and compact notation (K, M, B).
 * 
 * @param formatted - The formatted currency string to parse
 * @returns The numeric value, or NaN if parsing fails
 * 
 * @example
 * ```typescript
 * parseCurrency("₦1,000.00") // 1000
 * parseCurrency("$1,500.00") // 1500
 * parseCurrency("₦1.5M") // 1500000
 * parseCurrency("-₦500.00") // -500
 * ```
 */
export function parseCurrency(formatted: string): number {
  if (!formatted || typeof formatted !== 'string') {
    return NaN;
  }
  
  // Remove whitespace
  let cleaned = formatted.trim();
  
  // Check for negative sign
  const isNegative = cleaned.startsWith('-') || cleaned.startsWith('(');
  
  // Remove currency symbols, parentheses, and whitespace
  cleaned = cleaned.replace(/[^\d.,KMB]/gi, '');
  
  // Handle compact notation
  let multiplier = 1;
  if (cleaned.endsWith('K') || cleaned.endsWith('k')) {
    multiplier = 1_000;
    cleaned = cleaned.slice(0, -1);
  } else if (cleaned.endsWith('M') || cleaned.endsWith('m')) {
    multiplier = 1_000_000;
    cleaned = cleaned.slice(0, -1);
  } else if (cleaned.endsWith('B') || cleaned.endsWith('b')) {
    multiplier = 1_000_000_000;
    cleaned = cleaned.slice(0, -1);
  }
  
  // Remove thousand separators (commas)
  cleaned = cleaned.replace(/,/g, '');
  
  // Parse the number
  const value = parseFloat(cleaned);
  
  if (isNaN(value)) {
    return NaN;
  }
  
  // Apply multiplier and sign
  return (isNegative ? -1 : 1) * value * multiplier;
}
