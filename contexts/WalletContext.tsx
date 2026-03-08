/**
 * WalletContext - Wallet and transaction state management
 * 
 * Provides wallet and transaction state and actions to the entire app:
 * - Wallet state (wallet, transactions, isLoading, error)
 * - Wallet actions (fetchWallet, fetchTransactions, refreshWallet)
 * - Computed properties (totalContributed, totalReceived, pendingAmount)
 * - Caching in AsyncStorage
 * - Pull-to-refresh support
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { WalletService, Wallet, Lock } from '../services/walletService';
import { TransactionService, Transaction, TransactionQuery } from '../services/transactionService';
import { StorageService, STORAGE_KEYS } from '../services/storageService';

/**
 * Wallet context value interface
 */
export interface WalletContextValue {
  // State
  wallet: Wallet | null;
  transactions: Transaction[];
  locks: Lock[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchWallet: () => Promise<void>;
  fetchTransactions: (query?: TransactionQuery) => Promise<void>;
  refreshWallet: () => Promise<void>;
  fetchLocks: () => Promise<void>;
  
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
  const [locks, setLocks] = useState<Lock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load cached data on mount
   */
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        // Load cached wallet data for immediate display
        const cachedWallet = await StorageService.get<Wallet>(STORAGE_KEYS.WALLET_DATA);
        if (cachedWallet) {
          setWallet(cachedWallet);
        }

        // Load cached transactions for immediate display
        const cachedTransactions = await StorageService.get<Transaction[]>(STORAGE_KEYS.TRANSACTIONS_DATA);
        if (cachedTransactions) {
          setTransactions(cachedTransactions);
        }
        // NOTE: Live fetch is triggered by each screen on mount, not here,
        // to avoid unauthenticated requests during app startup.
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

      // Call WalletService to get wallet data
      const response = await WalletService.getMyWallet();
      setWallet(response.wallet);
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
   * @param query - Optional query parameters for transactions
   */
  const fetchTransactions = async (query?: TransactionQuery): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Call TransactionService to get transactions
      const response = await TransactionService.getTransactions(query);
      setTransactions(response.transactions);
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
        fetchLocks(),
      ]);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to refresh wallet data';
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Fetch active locks
   */
  const fetchLocks = async (): Promise<void> => {
    try {
      const response = await WalletService.getLocks();
      setLocks(response.locks);
    } catch (err: any) {
      // Non-critical — don't set global error
      console.warn('Failed to fetch locks:', err.message);
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
    locks,
    isLoading,
    error,
    
    // Actions
    fetchWallet,
    fetchTransactions,
    refreshWallet,
    fetchLocks,
    
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
