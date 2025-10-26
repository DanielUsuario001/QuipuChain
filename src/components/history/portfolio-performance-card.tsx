import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { PriceDisplay } from "~/components/swap/price-display";
import { cn, formatFiat } from "~/lib/utils";

interface PortfolioPerformanceCardProps {
  currentValue: number;
  previousValue24h: number;
  change24h: number;
  change7d: number;
  change30d: number;
  tokenBalances: Record<string, string>;
  isLoading?: boolean;
}

export function PortfolioPerformanceCard({
  currentValue,
  previousValue24h,
  change24h,
  change7d,
  change30d,
  tokenBalances,
  isLoading,
}: PortfolioPerformanceCardProps) {
  if (isLoading) {
    return (
      <Card className="wallet-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-secondary rounded w-1/3"></div>
            <div className="h-10 bg-secondary rounded w-1/2"></div>
            <div className="flex gap-4">
              <div className="h-16 bg-secondary rounded flex-1"></div>
              <div className="h-16 bg-secondary rounded flex-1"></div>
              <div className="h-16 bg-secondary rounded flex-1"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="wallet-card">
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Activity className="h-4 w-4" />
          <span className="text-sm font-medium">Portfolio Performance</span>
        </div>

        {/* Current Value */}
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Total Value</div>
          <PriceDisplay
            value={currentValue}
            previousValue={previousValue24h}
            size="lg"
            showTrend
            showChange
            animate
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <PerformanceMetric
            label="24h"
            value={change24h}
          />
          <PerformanceMetric
            label="7d"
            value={change7d}
          />
          <PerformanceMetric
            label="30d"
            value={change30d}
          />
        </div>

        {/* Token Breakdown */}
        {Object.keys(tokenBalances).length > 0 && (
          <div className="pt-4 border-t border-border/50">
            <div className="text-sm font-medium mb-3">Token Balances</div>
            <div className="space-y-2">
              {Object.entries(tokenBalances).map(([token, balance]) => (
                <div key={token} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{token}</span>
                  <span className="font-medium number-display">{balance}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PerformanceMetric({ label, value }: { label: string; value: number }) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  
  return (
    <div className="p-3 rounded-xl bg-secondary/30 border border-border/50">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="flex items-center gap-1.5">
        {isPositive && <TrendingUp className="h-3.5 w-3.5 text-green-500" />}
        {isNegative && <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
        <span
          className={cn(
            "text-sm font-semibold number-display",
            isPositive && "text-green-500",
            isNegative && "text-red-500",
            !isPositive && !isNegative && "text-muted-foreground"
          )}
        >
          {isPositive && "+"}
          {value.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}
