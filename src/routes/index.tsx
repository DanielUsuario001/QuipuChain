import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowDownUp, Settings2, Send, Download, Activity, Wallet } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { TokenSelector } from "~/components/swap/token-selector";
import { PriceDisplay, TokenAmountDisplay } from "~/components/swap/price-display";
import { QuickAmountSelector } from "~/components/swap/quick-amount-selector";
import { ExchangeRateDisplay } from "~/components/swap/exchange-rate-display";
import { PriceImpactIndicator } from "~/components/swap/price-impact-indicator";
import { Tooltip } from "~/components/ui/tooltip";
import { useWalletStore } from "~/store/wallet";
import { useAuthStore } from "~/store/auth";
import { calculateMinimumReceived, formatTokenAmount, cn } from "~/lib/utils";
import { getTokensByNetwork, type TokenSymbol } from "~/lib/tokens";
import { SLIPPAGE_OPTIONS, NETWORK_NAMES } from "~/lib/constants";
import { Link } from "@tanstack/react-router";
import { useTRPC } from "~/trpc/react";
import { useQuery } from "@tanstack/react-query";
import toast from 'react-hot-toast';

export const Route = createFileRoute("/")({
  component: SwapPage,
});

function SwapPage() {
  const { selectedNetwork, scrollAddress, starknetAddress } = useWalletStore();
  const { authToken } = useAuthStore();
  const trpc = useTRPC();

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

  const portfolio = portfolioQuery.data;
  const totalBalance = portfolio?.totalBalance || 0;

  if (portfolioQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in">
      {/* Balance Card */}
      <Card className="wallet-card overflow-hidden neon-border">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="text-sm text-muted-foreground uppercase tracking-wider">Balance Total</div>
            <PriceDisplay 
              value={totalBalance} 
              previousValue={totalBalance * 0.98}
              size="lg"
              showTrend
              showChange
              animate
            />
            <div className="text-xs text-muted-foreground">
              {NETWORK_NAMES[selectedNetwork] || selectedNetwork}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/send" search={{ action: 'receive' }} className="block">
          <Card className="wallet-card hover:border-purple-500/50 hover:shadow-neon transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer h-full">
            <CardContent className="p-6 flex flex-col items-center justify-center gap-4 h-full">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center shadow-neon">
                <Download className="h-8 w-8 text-purple-400" />
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">Recibir</div>
                <div className="text-xs text-muted-foreground mt-1">Recibir pagos</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/send" search={{ action: 'send' }} className="block">
          <Card className="wallet-card hover:border-green-500/50 hover:shadow-neon-green transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer h-full">
            <CardContent className="p-6 flex flex-col items-center justify-center gap-4 h-full">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center shadow-neon-green">
                <Send className="h-8 w-8 text-green-400" />
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">Enviar</div>
                <div className="text-xs text-muted-foreground mt-1">Enviar pagos</div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Access Links */}
      <div className="grid grid-cols-3 gap-3">
        <Link to="/swap">
          <button className="w-full p-4 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-purple-500/30 transition-all hover:scale-105 active:scale-95">
            <div className="flex flex-col items-center gap-2">
              <ArrowDownUp className="h-5 w-5 text-purple-400" />
              <span className="text-xs font-medium">Swap</span>
            </div>
          </button>
        </Link>

        <Link to="/history">
          <button className="w-full p-4 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-blue-500/30 transition-all hover:scale-105 active:scale-95">
            <div className="flex flex-col items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              <span className="text-xs font-medium">Actividad</span>
            </div>
          </button>
        </Link>

        <Link to="/settings">
          <button className="w-full p-4 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-green-500/30 transition-all hover:scale-105 active:scale-95">
            <div className="flex flex-col items-center gap-2">
              <Settings2 className="h-5 w-5 text-green-400" />
              <span className="text-xs font-medium">Ajustes</span>
            </div>
          </button>
        </Link>
      </div>

      {/* Wallet Connection Notice */}
      {!currentAddress && (
        <Card className="bg-secondary/50 border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Conecta tu wallet para comenzar
            </p>
            <Button
              onClick={() => {
                toast('Por favor usa el botón "Connect Wallet" en el header', { icon: '👆' });
              }}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Wallet className="h-4 w-4" />
              Conectar Wallet
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
