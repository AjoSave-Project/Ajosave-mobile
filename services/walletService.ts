/**
 * WalletService - Wallet and bank account management
 * 
 * Provides wallet operations:
 * - Get wallet balance and stats
 * - Verify bank account
 * - Add bank account
 * - Get linked bank accounts
 */

import { ApiService } from './apiService';
import { StorageService, STORAGE_KEYS } from './storageService';

/**
 * Wallet data structure
 */
export interface Wallet {
  _id: string;
  userId: string;
  totalBalance: number;
  availableBalance: number;
  lockedBalance: number;
  totalPayouts: number;
  totalContributions: number;
  totalWithdrawals: number;
  linkedBankAccounts: BankAccount[];
  autoWithdrawal: {
    enabled: boolean;
    bankAccount?: string;
    percentage: number;
    minAmount: number;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Bank account structure
 */
export interface BankAccount {
  _id: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode: string;
  isPrimary: boolean;
  isVerified: boolean;
  addedAt: string;
}

/**
 * Bank account verification response
 */
export interface BankAccountVerification {
  accountName: string;
  accountNumber: string;
}

/**
 * WalletService class
 */
class WalletServiceClass {
  /**
   * Get current user's wallet
   * @returns Wallet data
   */
  async getMyWallet(): Promise<{ wallet: Wallet }> {
    const response = await ApiService.get<{ wallet: Wallet }>('/wallets/me');

    if (response.success && response.data) {
      // Cache wallet data
      await StorageService.set(STORAGE_KEYS.WALLET_DATA, response.data.wallet);
      return response.data;
    }

    throw new Error('Failed to get wallet');
  }

  /**
   * Verify bank account with Paystack
   * @param accountNumber - Bank account number
   * @param bankCode - Bank code
   * @returns Account verification data
   */
  async verifyBankAccount(
    accountNumber: string,
    bankCode: string
  ): Promise<BankAccountVerification> {
    const response = await ApiService.post<BankAccountVerification>('/wallets/verify-account', {
      accountNumber,
      bankCode,
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Failed to verify bank account');
  }

  /**
   * Add bank account to wallet
   * @param accountNumber - Bank account number
   * @param accountName - Account holder name
   * @param bankCode - Bank code
   * @param bankName - Bank name
   * @returns Added bank account
   */
  async addBankAccount(
    accountNumber: string,
    accountName: string,
    bankCode: string,
    bankName: string
  ): Promise<{ bankAccount: BankAccount }> {
    const response = await ApiService.post<{ bankAccount: BankAccount }>('/wallets/add-bank-account', {
      accountNumber,
      accountName,
      bankCode,
      bankName,
    });

    if (response.success && response.data) {
      // Refresh wallet data
      await this.getMyWallet();
      return response.data;
    }

    throw new Error('Failed to add bank account');
  }

  /**
   * Get user's linked bank accounts
   * @returns List of bank accounts
   */
  async getBankAccounts(): Promise<{ bankAccounts: BankAccount[] }> {
    const response = await ApiService.get<{ bankAccounts: BankAccount[] }>('/wallets/bank-accounts');

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Failed to get bank accounts');
  }
}

// Export singleton instance
export const WalletService = new WalletServiceClass();
