import { createFileRoute } from "@tanstack/react-router";
import { Sliders, Clock, DollarSign, TestTube, LogOut, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useWalletStore } from "~/store/wallet";
import { SLIPPAGE_OPTIONS, FIAT_CURRENCIES } from "~/lib/constants";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  const {
    slippageTolerance,
    setSlippageTolerance,
    transactionDeadline,
    setTransactionDeadline,
    preferredFiat,
    setPreferredFiat,
    showTestnets,
    setShowTestnets,
    reset,
  } = useWalletStore();

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Slippage Tolerance */}
      <Card className="wallet-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sliders className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold">Slippage Tolerance</div>
              <div className="text-sm text-muted-foreground">Maximum price movement accepted</div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {SLIPPAGE_OPTIONS.map((option) => (
              <Button
                key={option}
                variant={slippageTolerance === option ? "default" : "outline"}
                size="sm"
                onClick={() => setSlippageTolerance(option)}
                className="flex-1 min-w-[80px]"
              >
                {option / 100}%
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Custom"
              value={slippageTolerance / 100}
              onChange={(e) => setSlippageTolerance(parseFloat(e.target.value) * 100)}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Deadline */}
      <Card className="wallet-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold">Transaction Deadline</div>
              <div className="text-sm text-muted-foreground">Time limit for execution</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={transactionDeadline}
              onChange={(e) => setTransactionDeadline(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">minutes</span>
          </div>
        </CardContent>
      </Card>

      {/* Fiat Currency */}
      <Card className="wallet-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold">Preferred Currency</div>
              <div className="text-sm text-muted-foreground">Display prices in your currency</div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {FIAT_CURRENCIES.map((currency) => (
              <Button
                key={currency}
                variant={preferredFiat === currency ? "default" : "outline"}
                size="sm"
                onClick={() => setPreferredFiat(currency)}
                className="flex-1 min-w-[80px]"
              >
                {currency}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Testnet Toggle */}
      <Card className="wallet-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TestTube className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold">Show Testnets</div>
                <div className="text-sm text-muted-foreground">Display testnet networks</div>
              </div>
            </div>
            <Button
              variant={showTestnets ? "default" : "outline"}
              size="sm"
              onClick={() => setShowTestnets(!showTestnets)}
            >
              {showTestnets ? 'On' : 'Off'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Settings */}
      <Card className="wallet-card border-destructive/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <LogOut className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <div className="font-semibold text-destructive">Reset Settings</div>
                <div className="text-sm text-muted-foreground">Disconnect and reset all preferences</div>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm('Are you sure you want to reset all settings?')) {
                  reset();
                }
              }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
