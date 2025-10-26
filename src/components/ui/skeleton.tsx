import { cn } from "~/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "rectangle" | "circle" | "text";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = "rectangle",
  width,
  height,
}: SkeletonProps) {
  const variantClasses = {
    rectangle: "rounded-lg",
    circle: "rounded-full",
    text: "rounded h-4",
  };

  const style = {
    width: width,
    height: height,
  };

  return (
    <div
      className={cn(
        "bg-secondary/50 animate-shimmer",
        "bg-gradient-to-r from-secondary/50 via-secondary to-secondary/50 bg-[length:200%_100%]",
        variantClasses[variant],
        className
      )}
      style={style}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="wallet-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonSwapInterface() {
  return (
    <div className="wallet-card p-4 space-y-4">
      <div className="space-y-2">
        <Skeleton variant="text" width="30%" />
        <div className="p-4 rounded-xl bg-secondary/30 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton variant="circle" width={32} height={32} />
            <Skeleton variant="text" width="25%" />
          </div>
          <Skeleton variant="text" height={40} />
        </div>
      </div>
      
      <div className="flex justify-center">
        <Skeleton variant="circle" width={48} height={48} />
      </div>
      
      <div className="space-y-2">
        <Skeleton variant="text" width="30%" />
        <div className="p-4 rounded-xl bg-secondary/30 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton variant="circle" width={32} height={32} />
            <Skeleton variant="text" width="25%" />
          </div>
          <Skeleton variant="text" height={40} />
        </div>
      </div>
      
      <Skeleton variant="rectangle" height={48} className="rounded-xl" />
    </div>
  );
}
