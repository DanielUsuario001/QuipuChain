// DEX Router addresses
export const SCROLL_ROUTERS = {
  UNISWAP_V3: '0x0000000000000000000000000000000000000000', // Placeholder
  ONEINCH: '0x0000000000000000000000000000000000000000', // Placeholder
} as const;

export const STARKNET_ROUTERS = {
  AVNU: '0x0000000000000000000000000000000000000000', // Placeholder
  EKUBO: '0x0000000000000000000000000000000000000000', // Placeholder
} as const;

// Slippage settings (in basis points, 100 = 1%)
export const DEFAULT_SLIPPAGE = 50; // 0.5%
export const SLIPPAGE_OPTIONS = [10, 50, 100, 300] as const; // 0.1%, 0.5%, 1%, 3%

// Transaction deadline (in minutes)
export const DEFAULT_DEADLINE = 20;

// Supported fiat currencies
export const FIAT_CURRENCIES = ['USD', 'PEN', 'EUR'] as const;
export type FiatCurrency = typeof FIAT_CURRENCIES[number];

// Network display names
export const NETWORK_NAMES = {
  scroll: 'Scroll',
  'scroll-sepolia': 'Scroll Sepolia',
  starknet: 'Starknet',
  'starknet-sepolia': 'Starknet Sepolia',
} as const;

// Explorer URLs
export const EXPLORERS = {
  scroll: 'https://scrollscan.com',
  'scroll-sepolia': 'https://sepolia.scrollscan.com',
  starknet: 'https://starkscan.co',
  'starknet-sepolia': 'https://sepolia.starkscan.co',
} as const;
