import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface QuickAmountSelectorProps {
  balance: string;
  onSelectAmount: (amount: string) => void;
  disabled?: boolean;
  className?: string;
}

export function QuickAmountSelector({
  balance,
  onSelectAmount,
  disabled = false,
  className,
}: QuickAmountSelectorProps) {
  const percentages = [25, 50, 75, 100];

  const handlePercentageClick = (percentage: number) => {
    if (disabled) return;
    
    const balanceNum = parseFloat(balance);
    if (isNaN(balanceNum) || balanceNum <= 0) return;
    
    const amount = (balanceNum * percentage) / 100;
    onSelectAmount(amount.toFixed(6));
  };

  return (
    <div className={cn("flex gap-2", className)}>
      {percentages.map((percentage, index) => (
        <Button
          key={percentage}
          variant="ghost"
          size="sm"
          className={cn(
            "quick-select-button flex-1 h-8",
            `animate-scale-in`
          )}
          style={{ animationDelay: `${index * 50}ms` }}
          onClick={() => handlePercentageClick(percentage)}
          disabled={disabled}
        >
          {percentage}%
        </Button>
      ))}
    </div>
  );
}
