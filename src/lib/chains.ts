import { defineChain } from 'viem';

export const scroll = defineChain({
  id: 534352,
  name: 'Scroll',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.scroll.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Scrollscan',
      url: 'https://scrollscan.com',
    },
  },
  testnet: false,
});

export const scrollSepolia = defineChain({
  id: 534351,
  name: 'Scroll Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia-rpc.scroll.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Scrollscan',
      url: 'https://sepolia.scrollscan.com',
    },
  },
  testnet: true,
});

export type SupportedChain = typeof scroll | typeof scrollSepolia;
export type ChainId = 534352 | 534351;

export const SUPPORTED_CHAINS = [scroll, scrollSepolia] as const;
