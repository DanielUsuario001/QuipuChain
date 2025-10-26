export type TokenSymbol = 'USDT' | 'USDC' | 'DAI';

export interface Token {
  symbol: TokenSymbol;
  name: string;
  decimals: number;
  address: string;
  logo: string;
}

// Scroll Mainnet token addresses
export const SCROLL_TOKENS: Record<TokenSymbol, Token> = {
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    address: '0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df',
    logo: '/tokens/usdt.svg',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    address: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4',
    logo: '/tokens/usdc.svg',
  },
  DAI: {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    address: '0xcA77eB3fEFe3725Dc33bccB54eDEFc3D9f764f97',
    logo: '/tokens/dai.svg',
  },
};

// Scroll Sepolia token addresses (testnet)
export const SCROLL_SEPOLIA_TOKENS: Record<TokenSymbol, Token> = {
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    address: '0x0000000000000000000000000000000000000000', // Placeholder
    logo: '/tokens/usdt.svg',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    address: '0x0000000000000000000000000000000000000000', // Placeholder
    logo: '/tokens/usdc.svg',
  },
  DAI: {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    address: '0x0000000000000000000000000000000000000000', // Placeholder
    logo: '/tokens/dai.svg',
  },
};

// Starknet Mainnet token addresses
export const STARKNET_TOKENS: Record<TokenSymbol, Token> = {
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    address: '0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8',
    logo: '/tokens/usdt.svg',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    address: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
    logo: '/tokens/usdc.svg',
  },
  DAI: {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    address: '0x00da114221cb83fa859dbdb4c44beeaa0bb37c7537ad5ae66fe5e0efd20e6eb3',
    logo: '/tokens/dai.svg',
  },
};

// Starknet Sepolia token addresses (testnet)
export const STARKNET_SEPOLIA_TOKENS: Record<TokenSymbol, Token> = {
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    address: '0x0000000000000000000000000000000000000000000000000000000000000000',
    logo: '/tokens/usdt.svg',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    address: '0x0000000000000000000000000000000000000000000000000000000000000000',
    logo: '/tokens/usdc.svg',
  },
  DAI: {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    address: '0x0000000000000000000000000000000000000000000000000000000000000000',
    logo: '/tokens/dai.svg',
  },
};

export type NetworkType = 'scroll' | 'scroll-sepolia' | 'starknet' | 'starknet-sepolia';

export function getTokensByNetwork(network: NetworkType): Record<TokenSymbol, Token> {
  switch (network) {
    case 'scroll':
      return SCROLL_TOKENS;
    case 'scroll-sepolia':
      return SCROLL_SEPOLIA_TOKENS;
    case 'starknet':
      return STARKNET_TOKENS;
    case 'starknet-sepolia':
      return STARKNET_SEPOLIA_TOKENS;
  }
}

export const ALL_TOKENS = [
  ...Object.values(SCROLL_TOKENS),
  ...Object.values(STARKNET_TOKENS),
];
