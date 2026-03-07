/// <reference types="react" />

declare module 'react-native-paystack-webview' {
  import type { ReactNode } from 'react';

  export type PaystackTransactionResponse = {
    reference: string;
    trans: string;
    transaction: string;
    status: string;
    message?: string;
  };

  export type PaystackParams = {
    email: string;
    amount: number;
    metadata?: Record<string, any>;
    reference?: string;
    onSuccess: (data: PaystackTransactionResponse) => void;
    onCancel: () => void;
    onLoad?: (res: { id: string; accessCode: string; customer: Record<string, any> }) => void;
    onError?: (res: { message: string }) => void;
  };

  export type PaystackProviderProps = {
    publicKey: string;
    children: ReactNode;
    currency?: string;
    debug?: boolean;
    onGlobalSuccess?: (data: PaystackTransactionResponse) => void;
    onGlobalCancel?: () => void;
  };

  export declare const PaystackProvider: (props: PaystackProviderProps) => JSX.Element;
  export declare const usePaystack: () => {
    popup: {
      checkout: (params: PaystackParams) => void;
      newTransaction: (params: PaystackParams) => void;
    };
  };
}
