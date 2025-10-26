import { Link, useNavigate } from "@tanstack/react-router";
import { Wallet, ChevronDown, Settings, Menu, X, Check, LogOut } from "lucide-react";
import { useWalletStore } from "~/store/wallet";
import { useAuthStore } from "~/store/auth";
import { NETWORK_NAMES } from "~/lib/constants";
import { shortenAddress } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { WalletConnectModal } from '~/components/wallet/wallet-connect-modal';
import toast from 'react-hot-toast';

export function Header() {
  const { selectedNetwork, disconnectWallet, scrollAddress, starknetAddress } = useWalletStore();
  const { email, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [showNetworkMenu, setShowNetworkMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  
  const isScrollNetwork = selectedNetwork.startsWith('scroll');
  const currentAddress = isScrollNetwork ? scrollAddress : starknetAddress;

  const handleLogout = () => {
    // Disconnect wallet first to clear all wallet state
    disconnectWallet();
    // Then clear authentication
    clearAuth();
    toast.success('Sesión cerrada exitosamente');
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between px-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 shadow-neon">
            <svg 
              className="h-5 w-5 text-white" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5"
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              {/* Quipu-inspired design: vertical cord with knots */}
              <line x1="12" y1="4" x2="12" y2="20" />
              <circle cx="12" cy="8" r="1.5" fill="currentColor" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="16" r="1.5" fill="currentColor" />
              <line x1="8" y1="8" x2="10.5" y2="8" />
              <line x1="13.5" y1="12" x2="16" y2="12" />
              <line x1="8" y1="16" x2="10.5" y2="16" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gradient hidden sm:inline">QuipuChain</span>
        </Link>

        {/* Center - Account/Network Info (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {currentAddress ? (
            <>
              {/* Account Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="font-medium text-sm">{email}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
                
                {showAccountMenu && (
                  <AccountDropdown 
                    address={currentAddress} 
                    email={email || ''}
                    onClose={() => setShowAccountMenu(false)}
                    onLogout={handleLogout}
                    onDisconnectWallet={disconnectWallet}
                  />
                )}
              </div>

              {/* Network Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowNetworkMenu(!showNetworkMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-400/10 border border-purple-400/20 hover:bg-purple-400/20 transition-colors"
                >
                  <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-sm font-medium">{NETWORK_NAMES[selectedNetwork]}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                
                {showNetworkMenu && (
                  <NetworkDropdown onClose={() => setShowNetworkMenu(false)} />
                )}
              </div>
            </>
          ) : (
            <Button
              onClick={() => setShowWalletModal(true)}
              className="gap-2"
              size="sm"
            >
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Link to="/settings" className="hidden md:block">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <MobileMenu 
          currentAddress={currentAddress || ''}
          email={email || ''}
          onClose={() => setShowMobileMenu(false)}
          onLogout={handleLogout}
        />
      )}

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </header>
  );
}

function AccountDropdown({ address, email, onClose, onLogout, onDisconnectWallet }: { 
  address: string; 
  email: string; 
  onClose: () => void; 
  onLogout: () => void;
  onDisconnectWallet: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDisconnect = () => {
    onDisconnectWallet();
    onClose();
    toast.success('Wallet disconnected');
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute left-0 mt-2 w-64 rounded-xl border border-border/50 bg-popover p-3 shadow-xl z-50 animate-fade-in">
        <div className="space-y-2">
          <div className="px-3 py-2 text-xs text-muted-foreground">Connected Account</div>
          <div className="px-3 py-2 rounded-lg bg-secondary/50">
            <div className="text-sm font-medium mb-1">{email}</div>
            <div className="font-mono text-xs break-all text-muted-foreground">{address}</div>
          </div>
          <button
            onClick={handleCopy}
            className="w-full px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors text-left flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Address
              </>
            )}
          </button>
          <div className="border-t border-border/50 my-2" />
          <button
            onClick={handleDisconnect}
            className="w-full px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors text-left flex items-center gap-2"
          >
            <Wallet className="h-4 w-4" />
            Disconnect Wallet
          </button>
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-left flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

function NetworkDropdown({ onClose }: { onClose: () => void }) {
  const { selectedNetwork, setSelectedNetwork, showTestnets } = useWalletStore();
  
  const networks: Array<{ id: any; name: string; testnet: boolean }> = [
    { id: 'scroll', name: 'Scroll', testnet: false },
    { id: 'starknet', name: 'Starknet', testnet: false },
    { id: 'scroll-sepolia', name: 'Scroll Sepolia', testnet: true },
    { id: 'starknet-sepolia', name: 'Starknet Sepolia', testnet: true },
  ];

  const filteredNetworks = showTestnets 
    ? networks 
    : networks.filter(n => !n.testnet);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border/50 bg-popover p-2 shadow-xl z-50 animate-fade-in">
        <div className="px-3 py-2 text-xs text-muted-foreground">Select Network</div>
        {filteredNetworks.map((network) => (
          <button
            key={network.id}
            className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-secondary ${
              selectedNetwork === network.id ? 'bg-secondary font-medium' : ''
            }`}
            onClick={() => {
              setSelectedNetwork(network.id);
              onClose();
            }}
          >
            <div className="flex items-center justify-between">
              <span>{network.name}</span>
              {network.testnet && (
                <span className="text-xs text-muted-foreground">Testnet</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

function MobileMenu({ currentAddress, email, onClose, onLogout }: { currentAddress: string; email: string; onClose: () => void; onLogout: () => void }) {
  return (
    <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl animate-fade-in">
      <div className="container py-4 space-y-1 px-4">
        <div className="px-4 py-3 mb-2 rounded-lg bg-secondary/50">
          <div className="text-xs text-muted-foreground mb-1">Connected</div>
          <div className="text-sm font-medium mb-1">{email}</div>
          <div className="font-mono text-xs text-muted-foreground">{shortenAddress(currentAddress)}</div>
        </div>
        <Link to="/settings" onClick={onClose}>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => {
            onClose();
            onLogout();
          }}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
