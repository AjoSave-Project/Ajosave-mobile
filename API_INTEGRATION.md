# Mobile App - Backend API Integration

This document describes the mobile app's integration with the backend API.

## Overview

The mobile app is now fully connected to your backend API with the following services:
- Authentication (login, signup, verification)
- Wallet management (balance, bank accounts)
- Groups (create, join, view)
- Transactions (contributions, history, stats)

## Backend API Base URL

Configure in `mobile/.env`:
```
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

For production, update to your deployed backend URL.

## Authentication Flow

### Backend Uses httpOnly Cookies
Your backend sets JWT tokens in httpOnly cookies, which means:
- Tokens are automatically sent with every request
- More secure than localStorage
- No manual token management needed in the app

### Signup Flow
1. User fills KYC form (firstName, lastName, email, phoneNumber, password, BVN, NIN, dateOfBirth)
2. Call `POST /auth/register` with all KYC data
3. Backend creates user and wallet, returns user data
4. User is authenticated (cookie is set)
5. Optional: Call `PUT /auth/verify` with address to complete verification

### Login Flow
1. User enters phoneNumber and password
2. Call `POST /auth/login`
3. Backend validates credentials, returns user data
4. User is authenticated (cookie is set)

## Services

### AuthService (`mobile/services/authService.ts`)
```typescript
// Login
await AuthService.login(phoneNumber, password);

// Signup
await AuthService.signup({
  firstName,
  lastName,
  email,
  phoneNumber,
  password,
  bvn,
  nin,
  dateOfBirth, // ISO format: "YYYY-MM-DD"
});

// Verify user (complete KYC)
await AuthService.verifyUser(address);

// Get current user
await AuthService.getCurrentUser();

// Logout
await AuthService.logout();

// Check session
const isValid = await AuthService.checkSession();
```

### WalletService (`mobile/services/walletService.ts`)
```typescript
// Get wallet
const { wallet } = await WalletService.getMyWallet();

// Verify bank account
const verification = await WalletService.verifyBankAccount(accountNumber, bankCode);

// Add bank account
const { bankAccount } = await WalletService.addBankAccount(
  accountNumber,
  accountName,
  bankCode,
  bankName
);

// Get bank accounts
const { bankAccounts } = await WalletService.getBankAccounts();
```

### GroupService (`mobile/services/groupService.ts`)
```typescript
// Create group
const { group, invitationCode } = await GroupService.createGroup({
  name,
  description,
  maxMembers,
  duration,
  contributionAmount,
  frequency, // 'Weekly' | 'Bi-Weekly' | 'Monthly'
  payoutOrder, // 'random' | 'firstCome' | 'bidding'
  emails, // Optional comma-separated emails
});

// Get user's groups
const { groups, count } = await GroupService.getUserGroups();

// Get group details
const { group } = await GroupService.getGroupById(groupId);

// Find group by invitation code
const { group } = await GroupService.findGroupByCode(code);

// Join group
await GroupService.joinGroup(groupId);

// Get group stats
const { stats } = await GroupService.getGroupStats(groupId);
```

### TransactionService (`mobile/services/transactionService.ts`)
```typescript
// Get transactions
const { transactions, count, total, hasMore } = await TransactionService.getTransactions({
  type: 'contribution', // Optional filter
  groupId: 'xxx', // Optional filter
  status: 'completed', // Optional filter
  limit: 50,
  skip: 0,
});

// Create contribution (after Paystack payment)
const { transaction, wallet, group } = await TransactionService.createContribution(
  groupId,
  paystackReference,
  amount
);

// Get transaction by ID
const { transaction } = await TransactionService.getTransactionById(transactionId);

// Get transaction stats
const { stats } = await TransactionService.getTransactionStats();
```

## React Contexts

### AuthContext
```typescript
import { useAuth } from '@/contexts';

const {
  user,
  isAuthenticated,
  isLoading,
  login,
  signup,
  verifyUser,
  logout,
  refreshUser,
  checkSession,
} = useAuth();
```

### WalletContext
```typescript
import { useWallet } from '@/contexts';

const {
  wallet,
  transactions,
  isLoading,
  error,
  fetchWallet,
  fetchTransactions,
  refreshWallet,
  totalContributed,
  totalReceived,
  pendingAmount,
} = useWallet();
```

### GroupsContext
```typescript
import { useGroups } from '@/contexts';

const {
  groups,
  selectedGroup,
  isLoading,
  error,
  fetchGroups,
  fetchGroupDetails,
  createGroup,
  joinGroup,
  findGroupByCode,
  refreshGroups,
} = useGroups();
```

## Data Models

### User
```typescript
interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  address?: string;
  isVerified: boolean;
  isActive: boolean;
  role: 'user' | 'admin' | 'moderator';
  createdAt: string;
  updatedAt: string;
}
```

### Wallet
```typescript
interface Wallet {
  _id: string;
  userId: string;
  totalBalance: number;
  availableBalance: number;
  lockedBalance: number;
  totalPayouts: number;
  totalContributions: number;
  totalWithdrawals: number;
  linkedBankAccounts: BankAccount[];
  createdAt: string;
  updatedAt: string;
}
```

### Group
```typescript
interface Group {
  _id: string;
  name: string;
  description: string;
  admin: string;
  maxMembers: number;
  members: string[];
  invitationCode: string;
  contributionAmount: number;
  frequency: 'Weekly' | 'Bi-Weekly' | 'Monthly';
  payoutOrder: 'random' | 'firstCome' | 'bidding';
  duration: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  currentTurn: number;
  totalPool: number;
  membersList: GroupMember[];
  createdAt: string;
  updatedAt: string;
}
```

### Transaction
```typescript
interface Transaction {
  _id: string;
  userId: string;
  groupId: string;
  transactionId: string;
  type: 'contribution' | 'payout' | 'withdrawal';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  paymentMethod: 'card' | 'bank_transfer' | 'wallet';
  createdAt: string;
  completedAt?: string;
}
```

## Next Steps

### 1. Update Signup Screen
Connect `mobile/app/(auth)/signup.tsx` to use the new signup flow with all KYC fields.

### 2. Update KYC Screen
Update `mobile/app/(auth)/kyc.tsx` to collect BVN, NIN, and DOB during registration.

### 3. Update Signin Screen
Connect `mobile/app/(auth)/signin.tsx` to use phoneNumber instead of email.

### 4. Implement Payment Integration
Integrate Paystack for contributions in the Pay screen.

### 5. Update Group Screens
Connect group creation and joining flows to the backend.

### 6. Update Wallet Screen
Display real wallet data and bank accounts.

## Testing

1. Start your backend server:
```bash
cd backend
npm run dev
```

2. Update `.env` with your backend URL (if not localhost)

3. Start the mobile app:
```bash
cd mobile
npm start
```

4. Test authentication flow:
   - Signup with full KYC details
   - Login with phone number
   - Verify user with address

5. Test wallet operations:
   - View wallet balance
   - Add bank account
   - View transactions

6. Test group operations:
   - Create a group
   - Join a group with invitation code
   - View group details

## Error Handling

All services throw errors that can be caught and displayed to users:

```typescript
try {
  await AuthService.login(phoneNumber, password);
} catch (error) {
  // error.message contains user-friendly error message
  Alert.alert('Login Failed', error.message);
}
```

## Caching

All data is cached in AsyncStorage for offline access:
- User data: `@user_data`
- Wallet data: `@wallet_data`
- Transactions: `@transactions_data`
- Groups: `@groups_data`

Data is automatically refreshed when the app comes online.
