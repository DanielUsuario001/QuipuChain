import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, formatFiat, formatPercentage } from "~/lib/utils";

interface PriceDisplayProps {
  value: number;
  previousValue?: number;
  currency?: string;
  showTrend?: boolean;
  showChange?: boolean;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
  className?: string;
}

export function PriceDisplay({
  value,
  previousValue,
  currency = "USD",
  showTrend = false,
  showChange = false,
  size = "md",
  animate = true,
  className,
}: PriceDisplayProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (animate && displayValue !== value) {
      setIsAnimating(true);
      const duration = 300;
      const steps = 20;
      const stepValue = (value - displayValue) / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        setDisplayValue((prev) => {
          const newValue = prev + stepValue;
          return currentStep >= steps ? value : newValue;
        });

        if (currentStep >= steps) {
          clearInterval(interval);
          setIsAnimating(false);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    } else {
      setDisplayValue(value);
    }
  }, [value, animate, displayValue]);

  const change = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;
  const isPositive = change > 0;
  const isNegative = change < 0;

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl font-bold",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "number-display",
          sizeClasses[size],
          isAnimating && "animate-number-pop"
        )}
      >
        {formatFiat(displayValue, currency)}
      </span>

      {showTrend && (
        <>
          {isPositive && <TrendingUp className="h-4 w-4 text-green-500" />}
          {isNegative && <TrendingDown className="h-4 w-4 text-red-500" />}
          {!isPositive && !isNegative && <Minus className="h-4 w-4 text-muted-foreground" />}
        </>
      )}

      {showChange && previousValue && (
        <span
          className={cn(
            "text-sm font-medium",
            isPositive && "price-change-positive",
            isNegative && "price-change-negative",
            !isPositive && !isNegative && "text-muted-foreground"
          )}
        >
          {isPositive && "+"}
          {formatPercentage(change)}
        </span>
      )}
    </div>
  );
}

interface TokenAmountDisplayProps {
  amount: string;
  symbol: string;
  usdValue?: number;
  size?: "sm" | "md" | "lg";
  showUsd?: boolean;
  className?: string;
}

export function TokenAmountDisplay({
  amount,
  symbol,
  usdValue,
  size = "md",
  showUsd = true,
  className,
}: TokenAmountDisplayProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-xl",
    lg: "text-3xl",
  };

  const usdSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={cn("space-y-1", className)}>
      <div className={cn("number-display font-semibold", sizeClasses[size])}>
        {amount} {symbol}
      </div>
      {showUsd && usdValue !== undefined && (
        <div className={cn("text-muted-foreground number-display", usdSizeClasses[size])}>
          ≈ {formatFiat(usdValue)}
        </div>
      )}
    </div>
  );
}
