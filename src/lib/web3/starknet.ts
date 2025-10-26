import { 
  connect,
  disconnect,
  type ConnectOptions,
  type DisconnectOptions,
} from 'starknetkit';
import { 
  Provider, 
  Contract,
  type AccountInterface,
  constants,
} from 'starknet';
import type { NetworkType } from '~/lib/tokens';

// Starknet ERC-20 ABI (Cairo 1.0)
const STARKNET_ERC20_ABI = [
  {
    name: 'balance_of',
    type: 'function',
    inputs: [{ name: 'account', type: 'felt' }],
    outputs: [{ name: 'balance', type: 'Uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'recipient', type: 'felt' },
      { name: 'amount', type: 'Uint256' },
    ],
    outputs: [{ name: 'success', type: 'felt' }],
  },
  {
    name: 'approve',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'felt' },
      { name: 'amount', type: 'Uint256' },
    ],
    outputs: [{ name: 'success', type: 'felt' }],
  },
] as const;

export function getStarknetChainId(network: NetworkType): constants.StarknetChainId {
  if (network === 'starknet') return constants.StarknetChainId.SN_MAIN;
  if (network === 'starknet-sepolia') return constants.StarknetChainId.SN_SEPOLIA;
  throw new Error(`Invalid Starknet network: ${network}`);
}

export function getStarknetProvider(network: NetworkType): Provider {
  const chainId = getStarknetChainId(network);
  const rpcUrl = network === 'starknet' 
    ? 'https://starknet-mainnet.public.blastapi.io'
    : 'https://starknet-sepolia.public.blastapi.io';
  
  return new Provider({ 
    nodeUrl: rpcUrl,
  });
}

export interface StarknetWallet {
  address: string;
  account: AccountInterface;
  isConnected: boolean;
}

export interface SimulationResult {
  success: boolean;
  gasEstimate: bigint;
  gasEstimateFormatted: string;
  executionStatus: string;
  revertReason?: string;
  suggestedMaxFee: bigint;
  suggestedMaxFeeFormatted: string;
}

export async function connectStarknetWallet(network: NetworkType): Promise<StarknetWallet> {
  try {
    const { wallet } = await connect({
      modalMode: 'alwaysAsk',
      modalTheme: 'dark',
    });

    if (!wallet?.isConnected) {
      throw new Error('Failed to connect wallet');
    }

    // Check if we're on the correct network
    const expectedChainId = getStarknetChainId(network);
    const currentChainId = await wallet.account.getChainId();
    
    if (currentChainId !== expectedChainId) {
      throw new Error(
        `Please switch to ${network === 'starknet' ? 'Starknet Mainnet' : 'Starknet Sepolia'} in your wallet`
      );
    }

    return {
      address: wallet.selectedAddress || '',
      account: wallet.account,
      isConnected: true,
    };
  } catch (error: any) {
    console.error('Failed to connect Starknet wallet:', error);
    throw new Error(error.message || 'Failed to connect wallet');
  }
}

export async function disconnectStarknetWallet(): Promise<void> {
  try {
    await disconnect();
  } catch (error) {
    console.error('Failed to disconnect Starknet wallet:', error);
  }
}

export async function getStarknetTokenBalance(
  network: NetworkType,
  tokenAddress: string,
  walletAddress: string
): Promise<bigint> {
  const provider = getStarknetProvider(network);
  const contract = new Contract(STARKNET_ERC20_ABI, tokenAddress, provider);

  try {
    const result = await contract.balance_of(walletAddress);
    // Starknet returns Uint256 as { low, high }
    const balance = result.balance || result;
    return BigInt(balance.low) + (BigInt(balance.high) << BigInt(128));
  } catch (error) {
    console.error('Failed to get Starknet token balance:', error);
    return BigInt(0);
  }
}

export async function sendStarknetToken(
  account: AccountInterface,
  tokenAddress: string,
  recipient: string,
  amount: bigint
): Promise<string> {
  const contract = new Contract(STARKNET_ERC20_ABI, tokenAddress, account);

  // Convert bigint to Uint256 format (low, high)
  const amountLow = amount & BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');
  const amountHigh = amount >> BigInt(128);

  const uint256Amount = {
    low: amountLow.toString(),
    high: amountHigh.toString(),
  };

  try {
    const result = await contract.transfer(recipient, uint256Amount);
    await account.waitForTransaction(result.transaction_hash);
    return result.transaction_hash;
  } catch (error: any) {
    console.error('Failed to send Starknet token:', error);
    throw new Error(error.message || 'Transaction failed');
  }
}

export async function simulateStarknetTransaction(
  account: AccountInterface,
  tokenAddress: string,
  recipient: string,
  amount: bigint
): Promise<SimulationResult> {
  const contract = new Contract(STARKNET_ERC20_ABI, tokenAddress, account);

  // Convert bigint to Uint256 format (low, high)
  const amountLow = amount & BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');
  const amountHigh = amount >> BigInt(128);

  const uint256Amount = {
    low: amountLow.toString(),
    high: amountHigh.toString(),
  };

  try {
    // Prepare the transaction call
    const call = contract.populate('transfer', [recipient, uint256Amount]);
    
    // Simulate the transaction
    const simulation = await account.simulateTransaction([call]);
    
    // Extract simulation results
    const simulationResult = Array.isArray(simulation) ? simulation[0] : simulation;
    
    // Calculate gas estimate (fee_estimate contains overall_fee)
    const gasEstimate = BigInt(simulationResult.fee_estimate?.overall_fee || '0');
    const suggestedMaxFee = BigInt(simulationResult.suggestedMaxFee || gasEstimate * BigInt(15) / BigInt(10)); // 1.5x for safety
    
    // Format gas estimates for display (convert from wei to ETH-like format)
    const gasEstimateFormatted = (Number(gasEstimate) / 1e18).toFixed(6);
    const suggestedMaxFeeFormatted = (Number(suggestedMaxFee) / 1e18).toFixed(6);
    
    // Determine execution status
    const executionStatus = simulationResult.execution_status || 'SUCCEEDED';
    const success = executionStatus === 'SUCCEEDED';
    
    return {
      success,
      gasEstimate,
      gasEstimateFormatted,
      executionStatus,
      revertReason: simulationResult.revert_reason,
      suggestedMaxFee,
      suggestedMaxFeeFormatted,
    };
  } catch (error: any) {
    console.error('Failed to simulate Starknet transaction:', error);
    
    // Return failed simulation result with error details
    return {
      success: false,
      gasEstimate: BigInt(0),
      gasEstimateFormatted: '0',
      executionStatus: 'REVERTED',
      revertReason: error.message || 'Simulation failed',
      suggestedMaxFee: BigInt(0),
      suggestedMaxFeeFormatted: '0',
    };
  }
}

export async function getStarknetTransactionStatus(
  network: NetworkType,
  txHash: string
): Promise<string> {
  const provider = getStarknetProvider(network);
  
  try {
    const receipt = await provider.getTransactionReceipt(txHash);
    return receipt.execution_status || 'UNKNOWN';
  } catch (error) {
    console.error('Failed to get transaction status:', error);
    return 'UNKNOWN';
  }
}
