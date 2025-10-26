import * as React from "react";
import { cn } from "~/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
  isLoading?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, isLoading, disabled, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-xl border-2 bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
            !error && !success && "border-input focus-visible:border-primary focus-visible:ring-primary/20",
            error && "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20",
            success && "border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/20",
            disabled && "cursor-not-allowed opacity-50",
            isLoading && "animate-pulse-slow",
            className
          )}
          ref={ref}
          disabled={disabled || isLoading}
          {...props}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
