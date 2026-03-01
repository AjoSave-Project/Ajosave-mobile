/**
 * Date Formatting Utilities
 * 
 * Provides locale-aware date formatting functions with support for multiple
 * format types, relative time formatting, ISO 8601 parsing, and timezone handling.
 * 
 * @module utils/date
 */

/**
 * Date format types supported by formatDate function
 */
export type DateFormat = 'short' | 'medium' | 'long' | 'relative';

/**
 * Options for date formatting
 */
export interface DateFormatOptions {
  locale?: string;
  timeZone?: string;
}

/**
 * Formats a date according to the specified format type.
 * 
 * @param date - Date to format (Date object or ISO 8601 string)
 * @param format - Format type: 'short', 'medium', 'long', or 'relative'
 * @param options - Optional formatting options (locale, timezone)
 * @returns Formatted date string
 * 
 * @example
 * ```typescript
 * formatDate(new Date(), 'short') // "1/15/24"
 * formatDate(new Date(), 'medium') // "Jan 15, 2024"
 * formatDate(new Date(), 'long') // "January 15, 2024"
 * formatDate(new Date(), 'relative') // "just now"
 * ```
 */
export function formatDate(
  date: string | Date,
  format: DateFormat = 'medium',
  options?: DateFormatOptions
): string {
  const dateObj = typeof date === 'string' ? parseISODate(date) : date;
  
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  if (format === 'relative') {
    return formatRelativeTime(dateObj);
  }

  const locale = options?.locale || 'en-US';
  const timeZone = options?.timeZone || undefined; // Use device timezone by default

  const formatOptions: Intl.DateTimeFormatOptions = {
    timeZone,
  };

  switch (format) {
    case 'short':
      formatOptions.year = '2-digit';
      formatOptions.month = 'numeric';
      formatOptions.day = 'numeric';
      break;
    case 'medium':
      formatOptions.year = 'numeric';
      formatOptions.month = 'short';
      formatOptions.day = 'numeric';
      break;
    case 'long':
      formatOptions.year = 'numeric';
      formatOptions.month = 'long';
      formatOptions.day = 'numeric';
      break;
  }

  return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
}

/**
 * Formats a date as a human-readable relative time string.
 * 
 * Handles both past and future relative times with appropriate labels:
 * - "just now" for times within the last minute
 * - "X minutes ago" / "in X minutes" for times within the last/next hour
 * - "X hours ago" / "in X hours" for times within the last/next day
 * - "yesterday" / "tomorrow" for the previous/next day
 * - "X days ago" / "in X days" for times within the last/next week
 * - Falls back to formatted date for times beyond a week
 * 
 * @param date - Date to format (Date object or ISO 8601 string)
 * @returns Human-readable relative time string
 * 
 * @example
 * ```typescript
 * formatRelativeTime(new Date()) // "just now"
 * formatRelativeTime(new Date(Date.now() - 5 * 60 * 1000)) // "5 minutes ago"
 * formatRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000)) // "2 hours ago"
 * formatRelativeTime(new Date(Date.now() - 24 * 60 * 60 * 1000)) // "yesterday"
 * formatRelativeTime(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) // "3 days ago"
 * formatRelativeTime(new Date(Date.now() + 2 * 60 * 60 * 1000)) // "in 2 hours"
 * ```
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISODate(date) : date;
  
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const isPast = diffMs > 0;

  // Just now (within last minute)
  if (Math.abs(diffSeconds) < 60) {
    return 'just now';
  }

  // Minutes
  if (Math.abs(diffMinutes) < 60) {
    const minutes = Math.abs(diffMinutes);
    if (isPast) {
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else {
      return `in ${minutes} minute${minutes === 1 ? '' : 's'}`;
    }
  }

  // Hours
  if (Math.abs(diffHours) < 24) {
    const hours = Math.abs(diffHours);
    if (isPast) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else {
      return `in ${hours} hour${hours === 1 ? '' : 's'}`;
    }
  }

  // Yesterday / Tomorrow
  if (diffDays === 1) {
    return 'yesterday';
  }
  if (diffDays === -1) {
    return 'tomorrow';
  }

  // Days
  if (Math.abs(diffDays) < 7) {
    const days = Math.abs(diffDays);
    if (isPast) {
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else {
      return `in ${days} day${days === 1 ? '' : 's'}`;
    }
  }

  // Beyond a week, use formatted date
  return formatDate(dateObj, 'medium');
}

/**
 * Parses an ISO 8601 date string into a Date object.
 * 
 * Supports standard ISO 8601 formats including:
 * - Date only: "2024-01-15"
 * - Date and time: "2024-01-15T10:30:00"
 * - With timezone: "2024-01-15T10:30:00Z" or "2024-01-15T10:30:00+01:00"
 * 
 * @param isoString - ISO 8601 formatted date string
 * @returns Date object, or Invalid Date if parsing fails
 * 
 * @example
 * ```typescript
 * parseISODate("2024-01-15") // Date object for Jan 15, 2024
 * parseISODate("2024-01-15T10:30:00Z") // Date object with time
 * parseISODate("invalid") // Invalid Date
 * ```
 */
export function parseISODate(isoString: string): Date {
  if (!isoString || typeof isoString !== 'string') {
    return new Date(NaN);
  }

  // Use native Date parsing for ISO 8601 strings
  const date = new Date(isoString);
  
  return date;
}
