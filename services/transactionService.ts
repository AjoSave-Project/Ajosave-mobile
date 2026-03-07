/**
 * TransactionService - Transaction management
 * 
 * Provides transaction operations:
 * - Get transaction history
 * - Create contribution
 * - Get transaction by ID
 * - Get transaction statistics
 */

import { ApiService } from './apiService';
import { StorageService, STORAGE_KEYS } from './storageService';

/**
 * Transaction data structure
 */
export interface Transaction {
  _id: string;
  userId: string;
  groupId: string;
  transactionId: string;
  type: 'contribution' | 'payout' | 'withdrawal' | 'fund_wallet';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  vendor?: string;
  paymentMethod: 'card' | 'bank_transfer' | 'wallet';
  paymentDetails?: {
    cardLastFour?: string;
    cardType?: string;
    processorReference?: string;
    bankName?: string;
  };
  metadata?: any;
  createdAt: string;
  completedAt?: string;
  updatedAt: string;
}

/**
 * Transaction query parameters
 */
export interface TransactionQuery {
  type?: 'contribution' | 'payout' | 'withdrawal' | 'fund_wallet';
  groupId?: string;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  limit?: number;
  skip?: number;
}

/**
 * Transaction statistics
 */
export interface TransactionStats {
  contributions: {
    total: number;
    count: number;
  };
  payouts: {
    total: number;
    count: number;
  };
  withdrawals: {
    total: number;
    count: number;
  };
}

/**
 * TransactionService class
 */
class TransactionServiceClass {
  /**
   * Get user's transactions with optional filters
   * @param query - Query parameters
   * @returns List of transactions
   */
  async getTransactions(query?: TransactionQuery): Promise<{
    transactions: Transaction[];
    count: number;
    total: number;
    hasMore: boolean;
  }> {
    const response = await ApiService.get<{
      transactions: Transaction[];
      count: number;
      total: number;
      hasMore: boolean;
    }>('/transactions', query);

    if (response.success && response.data) {
      // Cache transactions data
      await StorageService.set(STORAGE_KEYS.TRANSACTIONS_DATA, response.data.transactions);
      return response.data;
    }

    throw new Error('Failed to get transactions');
  }

  /**
   * Create a contribution transaction
   * @param groupId - Group ID
   * @param reference - Paystack payment reference
   * @param amount - Contribution amount
   * @returns Transaction data
   */
  async createContribution(
    groupId: string,
    reference: string,
    amount: number
  ): Promise<{
    transaction: Transaction;
    wallet: {
      totalContributions: number;
      availableBalance: number;
    };
    group: {
      totalPool: number;
      name: string;
    };
  }> {
    const response = await ApiService.post<{
      transaction: Transaction;
      wallet: any;
      group: any;
    }>('/transactions/contribution', {
      groupId,
      reference,
      amount,
    });

    if (response.success && response.data) {
      // Refresh transactions cache
      await this.getTransactions();
      return response.data;
    }

    throw new Error('Failed to create contribution');
  }

  /**
   * Pay group contribution from wallet balance
   */
  async createWalletContribution(
    groupId: string,
    amount: number
  ): Promise<{
    transaction: Transaction;
    wallet: { availableBalance: number; totalContributions: number };
    group: { totalPool: number; name: string };
  }> {
    const response = await ApiService.post<{
      transaction: Transaction;
      wallet: any;
      group: any;
    }>('/transactions/contribution/wallet', { groupId, amount });

    if (response.success && response.data) {
      await this.getTransactions();
      return response.data;
    }

    throw new Error('Failed to process wallet contribution');
  }

  /**
   * Get a specific transaction by ID
   * @param transactionId - Transaction ID
   * @returns Transaction details
   */
  async getTransactionById(transactionId: string): Promise<{ transaction: Transaction }> {
    const response = await ApiService.get<{ transaction: Transaction }>(`/transactions/${transactionId}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Failed to get transaction');
  }

  /**
   * Get user's transaction statistics
   * @returns Transaction statistics
   */
  async getTransactionStats(): Promise<{ stats: TransactionStats }> {
    const response = await ApiService.get<{ stats: TransactionStats }>('/transactions/stats');

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error('Failed to get transaction statistics');
  }
}

// Export singleton instance
export const TransactionService = new TransactionServiceClass();
