import { createPublicClient, http, type Address } from 'viem';
import { scroll, scrollSepolia } from '~/lib/chains';
import { Provider, Contract } from 'starknet';
import { getTokensByNetwork, type NetworkType, type TokenSymbol } from '~/lib/tokens';
import { env } from '~/server/env';

const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const STARKNET_ERC20_ABI = [
  {
    name: 'balance_of',
    type: 'function',
    inputs: [{ name: 'account', type: 'felt' }],
    outputs: [{ name: 'balance', type: 'Uint256' }],
    stateMutability: 'view',
  },
] as const;

async function fetchScrollBalances(
  network: NetworkType,
  walletAddress: string
): Promise<Record<string, string>> {
  const chain = network === 'scroll' ? scroll : scrollSepolia;
  const rpcUrl = network === 'scroll' ? env.SCROLL_RPC_URL : env.SCROLL_SEPOLIA_RPC_URL;
  
  const client = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  const tokens = getTokensByNetwork(network);
  const balances: Record<string, string> = {};

  for (const [symbol, token] of Object.entries(tokens)) {
    try {
      const balance = await client.readContract({
        address: token.address as Address,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [walletAddress as Address],
      });

      // Convert from wei to token units
      const balanceNum = Number(balance) / Math.pow(10, token.decimals);
      balances[symbol] = balanceNum.toFixed(2);
    } catch (error) {
      console.error(`Failed to fetch balance for ${symbol}:`, error);
      balances[symbol] = '0.00';
    }
  }

  return balances;
}

async function fetchStarknetBalances(
  network: NetworkType,
  walletAddress: string
): Promise<Record<string, string>> {
  const rpcUrl = network === 'starknet' ? env.STARKNET_RPC_URL : env.STARKNET_SEPOLIA_RPC_URL;
  const provider = new Provider({ nodeUrl: rpcUrl });

  const tokens = getTokensByNetwork(network);
  const balances: Record<string, string> = {};

  for (const [symbol, token] of Object.entries(tokens)) {
    try {
      const contract = new Contract(STARKNET_ERC20_ABI, token.address, provider);
      const result = await contract.balance_of(walletAddress);
      
      // Starknet returns Uint256 as { low, high }
      const balance = result.balance || result;
      const balanceBigInt = BigInt(balance.low) + (BigInt(balance.high) << BigInt(128));
      
      // Convert from smallest unit to token units
      const balanceNum = Number(balanceBigInt) / Math.pow(10, token.decimals);
      balances[symbol] = balanceNum.toFixed(2);
    } catch (error) {
      console.error(`Failed to fetch balance for ${symbol}:`, error);
      balances[symbol] = '0.00';
    }
  }

  return balances;
}

export async function fetchOnChainBalances(
  network: NetworkType,
  walletAddress: string
): Promise<Record<string, string>> {
  if (!walletAddress || walletAddress === '0x0000000000000000000000000000000000000000') {
    // Return default balances for demo/testing
    return {
      USDT: '0.00',
      USDC: '0.00',
      DAI: '0.00',
    };
  }

  try {
    if (network.startsWith('scroll')) {
      return await fetchScrollBalances(network, walletAddress);
    } else {
      return await fetchStarknetBalances(network, walletAddress);
    }
  } catch (error) {
    console.error('Failed to fetch on-chain balances:', error);
    // Return zero balances on error
    return {
      USDT: '0.00',
      USDC: '0.00',
      DAI: '0.00',
    };
  }
}
