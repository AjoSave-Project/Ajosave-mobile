/**
 * Domain model type definitions
 * Defines data structures for User, Group, Wallet, Transaction, and GroupMember
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatarUrl?: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  contributionAmount: number;
  contributionFrequency: 'daily' | 'weekly' | 'monthly';
  maxMembers: number;
  currentMembers: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  userId: string;
  groupId?: string;
  type: 'deposit' | 'withdrawal' | 'contribution' | 'payout';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
  contributionsMade: number;
  totalContributed: number;
}
