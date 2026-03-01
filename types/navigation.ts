/**
 * Navigation type definitions
 * Defines route parameter types for navigation stacks and tabs
 */

export type RootStackParamList = {
  Home: undefined;
  Dashboard: undefined;
  GroupDetails: { groupId: string };
  CreateGroup: undefined;
  Profile: { userId: string };
  KYCVerification: undefined;
  TransactionHistory: { walletId: string };
};

export type TabParamList = {
  Home: undefined;
  Groups: undefined;
  Wallet: undefined;
  Profile: undefined;
};
