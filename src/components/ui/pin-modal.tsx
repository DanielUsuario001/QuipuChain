import { useState } from "react";
import { X, Lock, AlertCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => Promise<void>;
  title?: string;
  description?: string;
  transactionDetails?: {
    label: string;
    value: string;
  }[];
}

export function PinModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Transaction",
  description = "Enter your PIN to confirm this transaction",
  transactionDetails = [],
}: PinModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (pin.length < 4) {
      setError("PIN must be at least 4 digits");
      return;
    }

    if (!/^\d+$/.test(pin)) {
      setError("PIN must contain only numbers");
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(pin);
      setPin("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Invalid PIN");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setPin("");
      setError("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <Card className="relative w-full max-w-md wallet-card animate-scale-in">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={handleClose}
              disabled={isLoading}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Transaction Details */}
          {transactionDetails.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-secondary/50 space-y-2">
              {transactionDetails.map((detail, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{detail.label}</span>
                  <span className="text-sm font-medium">{detail.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* PIN Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="pin" className="text-sm font-medium">
                Enter PIN
              </label>
              <Input
                id="pin"
                type="password"
                placeholder="••••"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError("");
                }}
                maxLength={6}
                error={!!error}
                disabled={isLoading}
                autoFocus
              />
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive animate-fade-in">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                isLoading={isLoading}
                disabled={isLoading || pin.length < 4}
              >
                Confirm
              </Button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-4 p-3 rounded-lg bg-secondary/30 border border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              🔒 Your PIN is used to securely authorize this transaction
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
