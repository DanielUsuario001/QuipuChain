import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AccountInterface } from 'starknet';
import type { NetworkType } from '~/lib/tokens';
import type { FiatCurrency } from '~/lib/constants';

export type WalletType = 'metamask' | 'walletconnect' | 'argent' | 'braavos' | null;

interface WalletState {
  // Network selection
  selectedNetwork: NetworkType;
  setSelectedNetwork: (network: NetworkType) => void;
  
  // Wallet connection
  connectedWallet: WalletType;
  scrollAddress: string | null;
  starknetAddress: string | null;
  starknetAccount: AccountInterface | null; // For signing transactions
  isConnecting: boolean;
  connectionError: string | null;
  
  setScrollAddress: (address: string | null) => void;
  setStarknetAddress: (address: string | null) => void;
  setStarknetAccount: (account: AccountInterface | null) => void;
  setConnectedWallet: (wallet: WalletType) => void;
  setIsConnecting: (connecting: boolean) => void;
  setConnectionError: (error: string | null) => void;
  
  // User preferences
  slippageTolerance: number;
  setSlippageTolerance: (slippage: number) => void;
  
  transactionDeadline: number;
  setTransactionDeadline: (deadline: number) => void;
  
  preferredFiat: FiatCurrency;
  setPreferredFiat: (currency: FiatCurrency) => void;
  
  // UI preferences
  showTestnets: boolean;
  setShowTestnets: (show: boolean) => void;
  
  // Reset all state
  reset: () => void;
  disconnectWallet: () => void;
}

const initialState = {
  selectedNetwork: 'scroll' as NetworkType,
  connectedWallet: null as WalletType,
  scrollAddress: null,
  starknetAddress: null,
  starknetAccount: null,
  isConnecting: false,
  connectionError: null,
  slippageTolerance: 50, // 0.5%
  transactionDeadline: 20, // 20 minutes
  preferredFiat: 'USD' as FiatCurrency,
  showTestnets: false,
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setSelectedNetwork: (network) => set({ selectedNetwork: network }),
      
      setScrollAddress: (address) => set({ scrollAddress: address }),
      setStarknetAddress: (address) => set({ starknetAddress: address }),
      setStarknetAccount: (account) => set({ starknetAccount: account }),
      setConnectedWallet: (wallet) => set({ connectedWallet: wallet }),
      setIsConnecting: (connecting) => set({ isConnecting: connecting }),
      setConnectionError: (error) => set({ connectionError: error }),
      
      setSlippageTolerance: (slippage) => set({ slippageTolerance: slippage }),
      setTransactionDeadline: (deadline) => set({ transactionDeadline: deadline }),
      setPreferredFiat: (currency) => set({ preferredFiat: currency }),
      
      setShowTestnets: (show) => set({ showTestnets: show }),
      
      disconnectWallet: () => set({ 
        connectedWallet: null,
        scrollAddress: null,
        starknetAddress: null,
        starknetAccount: null,
        connectionError: null,
      }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'stablecoin-wallet-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
