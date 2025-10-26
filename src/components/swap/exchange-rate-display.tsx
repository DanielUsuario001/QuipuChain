import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { TokenSymbol } from "~/lib/tokens";

interface ExchangeRateDisplayProps {
  fromToken: TokenSymbol;
  toToken: TokenSymbol;
  rate: number;
  isLoading?: boolean;
  className?: string;
}

export function ExchangeRateDisplay({
  fromToken,
  toToken,
  rate,
  isLoading = false,
  className,
}: ExchangeRateDisplayProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const displayRate = isFlipped ? 1 / rate : rate;
  const displayFromToken = isFlipped ? toToken : fromToken;
  const displayToToken = isFlipped ? fromToken : toToken;

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50",
        isLoading && "animate-pulse-slow",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="text-sm">
          <span className="font-medium">1 {displayFromToken}</span>
          <span className="text-muted-foreground"> = </span>
          <span className="font-medium number-display">
            {displayRate.toFixed(6)} {displayToToken}
          </span>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-full hover:bg-secondary/50"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <ArrowLeftRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
