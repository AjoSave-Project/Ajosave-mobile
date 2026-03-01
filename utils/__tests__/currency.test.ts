/**
 * Tests for currency formatting utilities
 * 
 * These tests verify the currency formatting and parsing functions
 * meet the requirements specified in the design document.
 */

import { formatCurrency, parseCurrency } from '../currency';

describe('formatCurrency', () => {
  describe('basic formatting', () => {
    it('should format positive numbers with default NGN currency', () => {
      const result = formatCurrency(1000);
      expect(result).toContain('1,000');
      expect(result).toContain('00'); // Should have 2 decimal places
    });

    it('should format zero correctly', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
      expect(result).toContain('00'); // Should have 2 decimal places
    });

    it('should format negative numbers with negative indicator', () => {
      const result = formatCurrency(-500);
      expect(result).toContain('500');
      expect(result).toContain('00');
      // Should have some negative indicator (- or parentheses)
      expect(result.includes('-') || result.includes('(')).toBe(true);
    });
  });

  describe('currency support', () => {
    it('should format USD currency', () => {
      const result = formatCurrency(1500, { currency: 'USD' });
      expect(result).toContain('1,500');
      expect(result).toContain('00');
    });

    it('should format GBP currency', () => {
      const result = formatCurrency(2000, { currency: 'GBP' });
      expect(result).toContain('2,000');
      expect(result).toContain('00');
    });

    it('should format EUR currency', () => {
      const result = formatCurrency(3000, { currency: 'EUR' });
      expect(result).toContain('3,000');
      expect(result).toContain('00');
    });
  });

  describe('compact notation', () => {
    it('should format thousands with K suffix', () => {
      const result = formatCurrency(1200, { compact: true });
      expect(result).toContain('1.2');
      expect(result).toContain('K');
    });

    it('should format millions with M suffix', () => {
      const result = formatCurrency(1500000, { compact: true });
      expect(result).toContain('1.5');
      expect(result).toContain('M');
    });

    it('should format billions with B suffix', () => {
      const result = formatCurrency(1200000000, { compact: true });
      expect(result).toContain('1.2');
      expect(result).toContain('B');
    });

    it('should format negative numbers in compact notation', () => {
      const result = formatCurrency(-5000, { compact: true });
      expect(result).toContain('-');
      expect(result).toContain('5');
      expect(result).toContain('K');
    });

    it('should not use compact notation for numbers below 1000', () => {
      const result = formatCurrency(999, { compact: true });
      expect(result).not.toContain('K');
      expect(result).not.toContain('M');
      expect(result).not.toContain('B');
    });
  });

  describe('symbol display', () => {
    it('should show currency symbol by default', () => {
      const result = formatCurrency(1000);
      // Should contain some currency symbol
      expect(result.length).toBeGreaterThan('1,000.00'.length);
    });

    it('should hide currency symbol when showSymbol is false', () => {
      const result = formatCurrency(1000, { showSymbol: false });
      expect(result).toBe('1,000.00');
    });
  });
});

describe('parseCurrency', () => {
  describe('basic parsing', () => {
    it('should parse formatted currency strings', () => {
      expect(parseCurrency('1,000.00')).toBe(1000);
      expect(parseCurrency('1,500.00')).toBe(1500);
    });

    it('should parse negative values', () => {
      expect(parseCurrency('-500.00')).toBe(-500);
      expect(parseCurrency('(-500.00)')).toBe(-500);
    });

    it('should parse zero', () => {
      expect(parseCurrency('0.00')).toBe(0);
      expect(parseCurrency('0')).toBe(0);
    });

    it('should handle currency symbols', () => {
      expect(parseCurrency('₦1,000.00')).toBe(1000);
      expect(parseCurrency('$1,500.00')).toBe(1500);
      expect(parseCurrency('£2,000.00')).toBe(2000);
      expect(parseCurrency('€3,000.00')).toBe(3000);
    });
  });

  describe('compact notation parsing', () => {
    it('should parse thousands (K)', () => {
      expect(parseCurrency('1.2K')).toBe(1200);
      expect(parseCurrency('5K')).toBe(5000);
    });

    it('should parse millions (M)', () => {
      expect(parseCurrency('1.5M')).toBe(1500000);
      expect(parseCurrency('2M')).toBe(2000000);
    });

    it('should parse billions (B)', () => {
      expect(parseCurrency('1.2B')).toBe(1200000000);
      expect(parseCurrency('3B')).toBe(3000000000);
    });

    it('should handle case-insensitive suffixes', () => {
      expect(parseCurrency('1.2k')).toBe(1200);
      expect(parseCurrency('1.5m')).toBe(1500000);
      expect(parseCurrency('1.2b')).toBe(1200000000);
    });
  });

  describe('round-trip formatting', () => {
    it('should round-trip standard amounts', () => {
      const amount = 1234.56;
      const formatted = formatCurrency(amount);
      const parsed = parseCurrency(formatted);
      expect(parsed).toBeCloseTo(amount, 2);
    });

    it('should round-trip compact notation', () => {
      const amount = 1500000;
      const formatted = formatCurrency(amount, { compact: true });
      const parsed = parseCurrency(formatted);
      expect(parsed).toBe(amount);
    });

    it('should round-trip negative values', () => {
      const amount = -500;
      const formatted = formatCurrency(amount);
      const parsed = parseCurrency(formatted);
      expect(parsed).toBe(amount);
    });
  });

  describe('error handling', () => {
    it('should return NaN for invalid input', () => {
      expect(parseCurrency('')).toBeNaN();
      expect(parseCurrency('invalid')).toBeNaN();
      expect(parseCurrency('abc')).toBeNaN();
    });

    it('should return NaN for null or undefined', () => {
      expect(parseCurrency(null as any)).toBeNaN();
      expect(parseCurrency(undefined as any)).toBeNaN();
    });
  });
});
