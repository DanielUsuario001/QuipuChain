import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { cn } from "~/lib/utils";
import { Tooltip } from "~/components/ui/tooltip";

interface PriceImpactIndicatorProps {
  impact: number;
  className?: string;
}

export function PriceImpactIndicator({ impact, className }: PriceImpactIndicatorProps) {
  const getImpactLevel = (impact: number) => {
    if (impact < 0.1) return { level: "low", color: "green", label: "Low Impact" };
    if (impact < 1) return { level: "medium", color: "yellow", label: "Medium Impact" };
    if (impact < 3) return { level: "high", color: "orange", label: "High Impact" };
    return { level: "very-high", color: "red", label: "Very High Impact" };
  };

  const impactLevel = getImpactLevel(impact);

  const colorClasses = {
    green: "bg-green-500/20 border-green-500/50 text-green-600 dark:text-green-400",
    yellow: "bg-yellow-500/20 border-yellow-500/50 text-yellow-600 dark:text-yellow-400",
    orange: "bg-orange-500/20 border-orange-500/50 text-orange-600 dark:text-orange-400",
    red: "bg-red-500/20 border-red-500/50 text-red-600 dark:text-red-400",
  };

  const progressColors = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
  };

  const tooltipContent = {
    green: "Your trade will have minimal impact on the market price. This is ideal!",
    yellow: "Your trade will have some impact on the market price. Consider splitting into smaller trades.",
    orange: "Your trade will significantly impact the market price. You may want to reconsider the amount.",
    red: "Your trade will have a very high impact on the market price. Proceed with caution!",
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Price Impact</span>
          <Tooltip content={tooltipContent[impactLevel.color as keyof typeof tooltipContent]}>
            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </Tooltip>
        </div>
        <div className="flex items-center gap-1.5">
          {impactLevel.color === "green" && <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
          {(impactLevel.color === "orange" || impactLevel.color === "red") && (
            <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
          )}
          <span className="font-medium">{impact.toFixed(2)}%</span>
        </div>
      </div>

      <div className="relative h-2 bg-secondary/50 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out",
            progressColors[impactLevel.color as keyof typeof progressColors]
          )}
          style={{ width: `${Math.min(impact * 10, 100)}%` }}
        />
      </div>

      <div
        className={cn(
          "px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 animate-fade-in",
          colorClasses[impactLevel.color as keyof typeof colorClasses]
        )}
      >
        {impactLevel.label}
      </div>
    </div>
  );
}
