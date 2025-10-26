import { useState } from 'react';
import { X, Wallet, ExternalLink } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useWalletStore } from '~/store/wallet';
import { connectMetaMask, isMetaMaskInstalled } from '~/lib/web3/scroll';
import { connectStarknetWallet } from '~/lib/web3/starknet';
import toast from 'react-hot-toast';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  const { 
    selectedNetwork, 
    setScrollAddress, 
    setStarknetAddress,
    setStarknetAccount,
    setConnectedWallet,
    setIsConnecting,
    setConnectionError,
  } = useWalletStore();
  
  const [connecting, setConnecting] = useState(false);
  const isScrollNetwork = selectedNetwork.startsWith('scroll');

  if (!isOpen) return null;

  const handleConnectMetaMask = async () => {
    setConnecting(true);
    setConnectionError(null);
    setIsConnecting(true);

    try {
      if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install MetaMask extension.');
      }

      const address = await connectMetaMask(selectedNetwork);
      setScrollAddress(address);
      setConnectedWallet('metamask');
      toast.success('Wallet connected successfully!');
      onClose();
    } catch (error: any) {
      console.error('Failed to connect MetaMask:', error);
      const errorMessage = error.message || 'Failed to connect wallet';
      setConnectionError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setConnecting(false);
      setIsConnecting(false);
    }
  };

  const handleConnectStarknet = async () => {
    setConnecting(true);
    setConnectionError(null);
    setIsConnecting(true);

    try {
      const wallet = await connectStarknetWallet(selectedNetwork);
      setStarknetAddress(wallet.address);
      setStarknetAccount(wallet.account);
      setConnectedWallet('argent'); // or detect which wallet was used
      toast.success('Wallet connected successfully!');
      onClose();
    } catch (error: any) {
      console.error('Failed to connect Starknet wallet:', error);
      const errorMessage = error.message || 'Failed to connect wallet';
      setConnectionError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setConnecting(false);
      setIsConnecting(false);
    }
  };

  const handleInstallMetaMask = () => {
    window.open('https://metamask.io/download/', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md my-auto bg-card rounded-2xl shadow-2xl border border-border/50 animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <h2 className="text-xl font-bold">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-secondary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect your wallet to {isScrollNetwork ? 'Scroll' : 'Starknet'} network
          </p>

          {isScrollNetwork ? (
            <>
              {isMetaMaskInstalled() ? (
                <button
                  onClick={handleConnectMetaMask}
                  disabled={connecting}
                  className="w-full p-4 rounded-xl border-2 border-border/50 hover:border-primary/50 hover:bg-secondary/50 transition-all flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">MetaMask</div>
                    <div className="text-xs text-muted-foreground">
                      {connecting ? 'Connecting...' : 'Connect with MetaMask'}
                    </div>
                  </div>
                </button>
              ) : (
                <button
                  onClick={handleInstallMetaMask}
                  className="w-full p-4 rounded-xl border-2 border-border/50 hover:border-primary/50 hover:bg-secondary/50 transition-all flex items-center gap-4"
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Install MetaMask</div>
                    <div className="text-xs text-muted-foreground">
                      MetaMask extension required
                    </div>
                  </div>
                  <ExternalLink className="h-5 w-5 text-muted-foreground" />
                </button>
              )}

              <div className="text-center text-xs text-muted-foreground">
                WalletConnect support coming soon
              </div>
            </>
          ) : (
            <>
              <button
                onClick={handleConnectStarknet}
                disabled={connecting}
                className="w-full p-4 rounded-xl border-2 border-border/50 hover:border-primary/50 hover:bg-secondary/50 transition-all flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">Starknet Wallet</div>
                  <div className="text-xs text-muted-foreground">
                    {connecting ? 'Connecting...' : 'Argent X or Braavos'}
                  </div>
                </div>
              </button>

              <div className="text-xs text-muted-foreground space-y-2">
                <p>Supported wallets:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Argent X</li>
                  <li>Braavos</li>
                </ul>
              </div>
            </>
          )}
        </div>

        <div className="p-6 pt-0">
          <div className="p-4 rounded-lg bg-secondary/50 text-xs text-muted-foreground">
            <p className="font-medium mb-2">🔒 Security Notice</p>
            <p>
              We will never ask for your private keys or seed phrase. Only connect to trusted dApps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
