import { 
  createPublicClient, 
  createWalletClient, 
  custom, 
  http,
  parseUnits,
  formatUnits,
  type Address,
  type Hash,
  type PublicClient,
  type WalletClient,
} from 'viem';
import { scroll, scrollSepolia } from '~/lib/chains';
import type { NetworkType, Token } from '~/lib/tokens';

// ERC-20 ABI for token operations
const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export function getScrollChain(network: NetworkType) {
  if (network === 'scroll') return scroll;
  if (network === 'scroll-sepolia') return scrollSepolia;
  throw new Error(`Invalid Scroll network: ${network}`);
}

export function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

export async function connectMetaMask(network: NetworkType): Promise<Address> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
  }

  const chain = getScrollChain(network);
  
  // Request account access
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  }) as Address[];

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts found. Please unlock MetaMask.');
  }

  // Switch to the correct network
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chain.id.toString(16)}` }],
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${chain.id.toString(16)}`,
            chainName: chain.name,
            nativeCurrency: chain.nativeCurrency,
            rpcUrls: [chain.rpcUrls.default.http[0]],
            blockExplorerUrls: [chain.blockExplorers.default.url],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }

  return accounts[0];
}

export function getPublicClient(network: NetworkType): PublicClient {
  const chain = getScrollChain(network);
  return createPublicClient({
    chain,
    transport: http(),
  });
}

export function getWalletClient(network: NetworkType): WalletClient {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  const chain = getScrollChain(network);
  return createWalletClient({
    chain,
    transport: custom(window.ethereum),
  });
}

export async function getTokenBalance(
  network: NetworkType,
  tokenAddress: Address,
  walletAddress: Address
): Promise<bigint> {
  const client = getPublicClient(network);
  
  const balance = await client.readContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [walletAddress],
  });

  return balance;
}

export async function sendToken(
  network: NetworkType,
  tokenAddress: Address,
  recipient: Address,
  amount: bigint,
  fromAddress: Address
): Promise<Hash> {
  const walletClient = getWalletClient(network);
  const publicClient = getPublicClient(network);

  // Send the transfer transaction
  const hash = await walletClient.writeContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [recipient, amount],
    account: fromAddress,
  });

  // Wait for transaction confirmation
  await publicClient.waitForTransactionReceipt({ hash });

  return hash;
}

export async function getTransactionReceipt(network: NetworkType, hash: Hash) {
  const client = getPublicClient(network);
  return await client.getTransactionReceipt({ hash });
}

export async function approveToken(
  network: NetworkType,
  tokenAddress: Address,
  spenderAddress: Address,
  amount: bigint,
  fromAddress: Address
): Promise<Hash> {
  const walletClient = getWalletClient(network);
  const publicClient = getPublicClient(network);

  const hash = await walletClient.writeContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [spenderAddress, amount],
    account: fromAddress,
  });

  await publicClient.waitForTransactionReceipt({ hash });

  return hash;
}

export async function getTokenAllowance(
  network: NetworkType,
  tokenAddress: Address,
  ownerAddress: Address,
  spenderAddress: Address
): Promise<bigint> {
  const client = getPublicClient(network);
  
  const allowance = await client.readContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [ownerAddress, spenderAddress],
  });

  return allowance;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
