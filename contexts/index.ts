/**
 * Contexts index
 * 
 * Exports all context providers and hooks for easy importing
 */

export { AuthProvider, useAuth } from './AuthContext';
export type { AuthContextValue } from './AuthContext';

export { WalletProvider, useWallet } from './WalletContext';
export type { WalletContextValue, TransactionFilters } from './WalletContext';

export { GroupsProvider, useGroups } from './GroupsContext';
export type { GroupsContextValue, CreateGroupRequest } from './GroupsContext';

export { ThemeProvider } from './ThemeContext';
export { useTheme } from '../hooks/useTheme';
