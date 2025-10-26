import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowDownUp, Settings2, Info, ArrowLeft, Zap, Wallet, ChevronDown } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { TokenSelector } from "~/components/swap/token-selector";
import { QuickAmountSelector } from "~/components/swap/quick-amount-selector";
import { ExchangeRateDisplay } from "~/components/swap/exchange-rate-display";
import { PriceImpactIndicator } from "~/components/swap/price-impact-indicator";
import { Tooltip } from "~/components/ui/tooltip";
import { useWalletStore } from "~/store/wallet";
import { useAuthStore } from "~/store/auth";
import { calculateMinimumReceived, cn } from "~/lib/utils";
import { getTokensByNetwork, type TokenSymbol, type NetworkType } from "~/lib/tokens";
import { SLIPPAGE_OPTIONS, NETWORK_NAMES } from "~/lib/constants";
import { useTRPC } from "~/trpc/react";
import { useQuery } from "@tanstack/react-query";
import toast from 'react-hot-toast';

export const Route = createFileRoute("/swap/")({
  component: SwapPage,
});

function SwapPage() {
  const { selectedNetwork, setSelectedNetwork, slippageTolerance, setSlippageTolerance, scrollAddress, starknetAddress } = useWalletStore();
  const { authToken } = useAuthStore();
  const trpc = useTRPC();
  const [fromToken, setFromToken] = useState<TokenSymbol>('USDT');
  const [toToken, setToToken] = useState<TokenSymbol>('USDC');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [swapSuccess, setSwapSuccess] = useState(false);

  const isScrollNetwork = selectedNetwork.startsWith('scroll');
  const currentAddress = isScrollNetwork ? scrollAddress : starknetAddress;

  // Fetch user portfolio
  const portfolioQuery = useQuery(
    trpc.getUserPortfolio.queryOptions({
      authToken: authToken || '',
      network: selectedNetwork,
      walletAddress: currentAddress || undefined,
    })
  );

  const tokenBalances = portfolioQuery.data?.tokenBalances || {};

  // Mock exchange rate calculation
  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > 0) {
      const mockRate = 0.9998;
      const calculatedAmount = (parseFloat(fromAmount) * mockRate).toFixed(6);
      setToAmount(calculatedAmount);
      setShowQuote(true);
    } else {
      setToAmount('');
      setShowQuote(false);
    }
  }, [fromAmount]);

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleSwap = async () => {
    setIsSwapping(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSwapping(false);
    setSwapSuccess(true);
    
    setTimeout(() => {
      setSwapSuccess(false);
      setFromAmount('');
      setToAmount('');
      portfolioQuery.refetch();
    }, 2000);
  };

  const mockRate = 0.9998;
  const mockFromUsdPrice = 1.0;
  const mockToUsdPrice = 0.9998;
  const mockPriceImpact = 0.01;
  const mockGasFee = 0.52;
  
  const fromUsdValue = fromAmount ? parseFloat(fromAmount) * mockFromUsdPrice : 0;
  const toUsdValue = toAmount ? parseFloat(toAmount) * mockToUsdPrice : 0;
  
  const fromTokenBalance = tokenBalances[fromToken] || '0.00';
  const toTokenBalance = tokenBalances[toToken] || '0.00';

  // Mock PEN conversion rate (1 USD = 3.8 PEN approximately)
  const penRate = 3.8;
  const fromPenValue = fromUsdValue * penRate;

  return (
    <div className="max-w-md mx-auto space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gradient">Swap</h1>
        </div>

        {/* Network Selector */}
        <div className="relative">
          <button
            onClick={() => setShowNetworkSelector(!showNetworkSelector)}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-all text-sm font-medium"
          >
            <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            <span>{NETWORK_NAMES[selectedNetwork]}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          
          {showNetworkSelector && (
            <NetworkSelector 
              selectedNetwork={selectedNetwork}
              onSelect={(network) => {
                setSelectedNetwork(network);
                setShowNetworkSelector(false);
              }}
              onClose={() => setShowNetworkSelector(false)}
            />
          )}
        </div>
      </div>

      <Card className="wallet-card neon-border">
        <CardContent className="p-4 space-y-4">
          {/* Settings Toggle */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Intercambiar Tokens</h3>
            <Tooltip content="Configurar tolerancia de deslizamiento">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-full transition-all duration-200",
                  showSettings && "bg-secondary rotate-90"
                )}
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings2 className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>

          {/* Wallet Connection Notice */}
          {!currentAddress && (
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 text-center animate-fade-in">
              <p className="text-sm text-muted-foreground mb-3">
                Conecta tu wallet para ver balances reales y realizar swaps
              </p>
              <Button
                onClick={() => {
                  toast('Por favor usa el botón "Connect Wallet" en el header', { icon: '👆' });
                }}
                variant="outline"
                size="sm"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Conectar Wallet
              </Button>
            </div>
          )}

          {/* Settings */}
          {showSettings && (
            <div className="p-4 rounded-xl bg-secondary/50 space-y-3 animate-slide-up border border-purple-500/20">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Tolerancia de Deslizamiento</label>
                <Tooltip content="Diferencia máxima de precio que estás dispuesto a aceptar">
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              <div className="flex gap-2">
                {SLIPPAGE_OPTIONS.map((option) => (
                  <Button
                    key={option}
                    variant={slippageTolerance === option ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "flex-1 h-9 text-sm transition-all",
                      slippageTolerance === option && "shadow-neon"
                    )}
                    onClick={() => setSlippageTolerance(option)}
                  >
                    {option / 100}%
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* From Token */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground font-medium">Pagas</div>
            <div className="p-4 rounded-xl bg-secondary/30 space-y-3 border border-border/50 input-with-focus">
              <TokenSelector
                selectedToken={fromToken}
                onSelectToken={setFromToken}
              />
              <Input
                type="number"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="text-2xl font-semibold bg-transparent border-0 focus-visible:ring-0 p-0 h-auto number-display"
              />
              {fromAmount && parseFloat(fromAmount) > 0 && (
                <div className="space-y-1 text-sm animate-fade-in">
                  <div className="text-muted-foreground number-display">
                    ≈ ${fromUsdValue.toFixed(2)} USD
                  </div>
                  <div className="text-purple-400 number-display font-semibold">
                    ≈ S/ {fromPenValue.toFixed(2)} PEN
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Balance: {fromTokenBalance}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-3 text-xs hover:bg-purple-500/10 hover:text-purple-400 transition-all"
                  onClick={() => setFromAmount(fromTokenBalance)}
                >
                  MAX
                </Button>
              </div>
              <QuickAmountSelector
                balance={fromTokenBalance}
                onSelectAmount={setFromAmount}
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <Tooltip content="Intercambiar posiciones">
              <Button
                variant="ghost"
                size="icon"
                className="swap-button"
                onClick={handleSwapTokens}
              >
                <ArrowDownUp className="h-5 w-5" />
              </Button>
            </Tooltip>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground font-medium">Recibes</div>
            <div className="p-4 rounded-xl bg-secondary/30 space-y-3 border border-border/50">
              <TokenSelector
                selectedToken={toToken}
                onSelectToken={setToToken}
              />
              <Input
                type="number"
                placeholder="0.00"
                value={toAmount}
                readOnly
                className="text-2xl font-semibold bg-transparent border-0 focus-visible:ring-0 p-0 h-auto number-display"
              />
              {toAmount && parseFloat(toAmount) > 0 && (
                <div className="text-sm text-muted-foreground number-display animate-fade-in">
                  ≈ ${toUsdValue.toFixed(2)} USD
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Balance: {toTokenBalance}
              </div>
            </div>
          </div>

          {/* Exchange Rate */}
          {showQuote && (
            <div className="space-y-2">
              <ExchangeRateDisplay
                fromToken={fromToken}
                toToken={toToken}
                rate={mockRate}
                className="animate-slide-up"
              />
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 animate-slide-up">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Comisión</span>
                  <span className="text-green-400 font-semibold">Muy baja (0.3%)</span>
                </div>
              </div>
            </div>
          )}

          {/* Quote Info */}
          {showQuote && (
            <div className="quote-card p-4 space-y-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Zap className="h-4 w-4 text-purple-400" />
                <span>Detalles de la Cotización</span>
              </div>
              
              <PriceImpactIndicator impact={mockPriceImpact} />
              
              <div className="space-y-2 text-sm pt-2 border-t border-border/50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Mínimo Recibido</span>
                    <Tooltip content="Cantidad mínima que recibirás considerando el deslizamiento">
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </Tooltip>
                  </div>
                  <span className="font-medium number-display">
                    {calculateMinimumReceived(toAmount, slippageTolerance)} {toToken}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Tarifa de Red</span>
                    <Tooltip content="Costo estimado del gas para esta transacción">
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </Tooltip>
                  </div>
                  <span className="font-medium number-display">
                    ${mockGasFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ruta</span>
                  <span className="font-medium text-xs">
                    {fromToken} → {toToken}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <Button
            className={cn(
              "w-full h-12 font-semibold rounded-xl text-base transition-all",
              !fromAmount || parseFloat(fromAmount) <= 0 || !currentAddress
                ? "opacity-50"
                : "hover:shadow-glow-lg hover:scale-[1.02] active:scale-[0.98]"
            )}
            onClick={handleSwap}
            isLoading={isSwapping}
            success={swapSuccess}
            disabled={!fromAmount || parseFloat(fromAmount) <= 0 || !currentAddress}
          >
            {!currentAddress 
              ? 'Conectar Wallet para Swap'
              : swapSuccess 
              ? '¡Swap Exitoso!' 
              : isSwapping 
              ? 'Procesando...' 
              : 'Realizar Swap'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function NetworkSelector({ 
  selectedNetwork, 
  onSelect, 
  onClose 
}: { 
  selectedNetwork: NetworkType; 
  onSelect: (network: NetworkType) => void; 
  onClose: () => void;
}) {
  const networks: Array<{ id: NetworkType; name: string; icon: string }> = [
    { id: 'scroll', name: 'Scroll', icon: '🔷' },
    { id: 'starknet', name: 'Starknet', icon: '🔶' },
    { id: 'scroll-sepolia', name: 'Scroll Sepolia', icon: '🔷' },
    { id: 'starknet-sepolia', name: 'Starknet Sepolia', icon: '🔶' },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 mt-2 w-56 rounded-xl border border-purple-500/30 bg-card p-2 shadow-neon z-50 animate-fade-in">
        <div className="px-3 py-2 text-xs text-muted-foreground">Seleccionar Red</div>
        {networks.map((network) => (
          <button
            key={network.id}
            className={cn(
              "w-full rounded-lg px-3 py-2.5 text-left text-sm transition-all hover:bg-secondary flex items-center gap-2",
              selectedNetwork === network.id && 'bg-secondary font-medium border border-purple-500/30'
            )}
            onClick={() => onSelect(network.id)}
          >
            <span className="text-lg">{network.icon}</span>
            <span className="flex-1">{network.name}</span>
            {selectedNetwork === network.id && (
              <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </>
  );
}
