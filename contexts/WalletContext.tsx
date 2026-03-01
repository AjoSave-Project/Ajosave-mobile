/**
 * WalletContext - Wallet and transaction state management
 * 
 * Provides wallet and transaction state and actions to the entire app:
 * - Wallet state (wallet, transactions, isLoading, error)
 * - Wallet actions (fetchWallet, fetchTransactions, refreshWallet)
 * - Computed properties (totalContributed, totalReceived, pendingAmount)
 * - Caching in AsyncStorage
 * - Pull-to-refresh support
 * 
 * Validates: Requirements 4.2, 4.6, 9.2, 10.2, 10.4, 10.5, 10.6
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { ApiService } from '../services/apiService';
import { StorageService, STORAGE_KEYS } from '../services/storageService';
import { Wallet, Transaction } from '../types/models';

/**
 * Transaction filters interface
 */
export interface TransactionFilters {
  type?: Transaction['type'];
  startDate?: string;
  endDate?: string;
  groupId?: string;
}

/**
 * Wallet context value interface
 */
export interface WalletContextValue {
  // State
  wallet: Wallet | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchWallet: () => Promise<void>;
  fetchTransactions: (filters?: TransactionFilters) => Promise<void>;
  refreshWallet: () => Promise<void>;
  
  // Computed properties
  totalContributed: number;
  totalReceived: number;
  pendingAmount: number;
}

/**
 * Wallet context
 */
const WalletContext = createContext<WalletContextValue | undefined>(undefined);

/**
 * WalletProvider props
 */
interface WalletProviderProps {
  children: ReactNode;
}

/**
 * WalletProvider component
 * 
 * Manages wallet and transaction state and provides wallet actions
 * to the entire application through context.
 */
export function WalletProvider({ children }: WalletProviderProps) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load cached data on mount
   */
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        // Load cached wallet data
        const cachedWallet = await StorageService.get<Wallet>(STORAGE_KEYS.WALLET_DATA);
        if (cachedWallet) {
          setWallet(cachedWallet);
        }

        // Load cached transactions
        const cachedTransactions = await StorageService.get<Transaction[]>(STORAGE_KEYS.TRANSACTIONS_DATA);
        if (cachedTransactions) {
          setTransactions(cachedTransactions);
        }

        // Fetch fresh data in the background - suppress errors if API unavailable
        try {
          await fetchWallet();
          await fetchTransactions();
        } catch (err) {
          // Silently suppress API errors when backend isn't running
        }
      } catch (err) {
        // Silently suppress error
      }
    };

    loadCachedData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array is intentional - only run on mount

  /**
   * Fetch wallet data from API
   * Caches the result in AsyncStorage
   */
  const fetchWallet = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Call API to get wallet data
      const response = await ApiService.get<Wallet>('/wallets/me');

      if (response.success && response.data) {
        setWallet(response.data);
        
        // Cache wallet data
        await StorageService.set(STORAGE_KEYS.WALLET_DATA, response.data);
      } else {
        throw new Error('Failed to fetch wallet data');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load wallet data';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch transactions from API with optional filters
   * Caches the result in AsyncStorage
   * 
   * @param filters - Optional filters for transactions
   */
  const fetchTransactions = async (filters?: TransactionFilters): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query parameters from filters
      const params: Record<string, any> = {};
      if (filters?.type) {
        params.type = filters.type;
      }
      if (filters?.startDate) {
        params.startDate = filters.startDate;
      }
      if (filters?.endDate) {
        params.endDate = filters.endDate;
      }
      if (filters?.groupId) {
        params.groupId = filters.groupId;
      }

      // Call API to get transactions
      const response = await ApiService.get<Transaction[]>('/transactions', params);

      if (response.success && response.data) {
        setTransactions(response.data);
        
        // Cache transactions data (only if no filters applied)
        if (!filters || Object.keys(filters).length === 0) {
          await StorageService.set(STORAGE_KEYS.TRANSACTIONS_DATA, response.data);
        }
      } else {
        throw new Error('Failed to fetch transactions');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load transactions';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh wallet and transactions data
   * Used for pull-to-refresh functionality
   */
  const refreshWallet = async (): Promise<void> => {
    try {
      setError(null);
      
      // Fetch both wallet and transactions in parallel
      await Promise.all([
        fetchWallet(),
        fetchTransactions(),
      ]);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to refresh wallet data';
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Computed property: Total amount contributed across all groups
   * Sums all contribution transactions
   */
  const totalContributed = useMemo(() => {
    if (!Array.isArray(transactions)) return 0;
    return transactions
      .filter(t => t.type === 'contribution' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  /**
   * Computed property: Total amount received from payouts
   * Sums all payout transactions
   */
  const totalReceived = useMemo(() => {
    if (!Array.isArray(transactions)) return 0;
    return transactions
      .filter(t => t.type === 'payout' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  /**
   * Computed property: Pending amount from pending transactions
   * Sums all pending contribution transactions
   */
  const pendingAmount = useMemo(() => {
    if (!Array.isArray(transactions)) return 0;
    return transactions
      .filter(t => t.type === 'contribution' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const value: WalletContextValue = {
    // State
    wallet,
    transactions,
    isLoading,
    error,
    
    // Actions
    fetchWallet,
    fetchTransactions,
    refreshWallet,
    
    // Computed properties
    totalContributed,
    totalReceived,
    pendingAmount,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

/**
 * useWallet hook
 * 
 * Custom hook to access wallet context
 * @returns Wallet context value
 * @throws Error if used outside WalletProvider
 */
export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  
  return context;
}
