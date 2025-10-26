import { X, CheckCircle, XCircle, AlertCircle, Fuel } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import type { SimulationResult } from "~/lib/web3/starknet";

interface SimulationResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed?: () => void;
  simulationResult: SimulationResult | null;
  transactionDetails?: {
    token: string;
    amount: string;
    recipient: string;
    network: string;
  };
}

export function SimulationResultModal({
  isOpen,
  onClose,
  onProceed,
  simulationResult,
  transactionDetails,
}: SimulationResultModalProps) {
  if (!isOpen || !simulationResult) return null;

  const isSuccess = simulationResult.success;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <Card className="relative w-full max-w-md wallet-card animate-scale-in">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  isSuccess
                    ? "bg-green-500/10 text-green-500"
                    : "bg-red-500/10 text-red-500"
                }`}
              >
                {isSuccess ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {isSuccess ? "Simulación Exitosa" : "Simulación Fallida"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isSuccess
                    ? "La transacción se ejecutará correctamente"
                    : "La transacción fallaría"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Transaction Details */}
          {transactionDetails && (
            <div className="mb-4 p-4 rounded-xl bg-secondary/50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Token</span>
                <span className="text-sm font-medium">{transactionDetails.token}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Cantidad</span>
                <span className="text-sm font-medium">
                  {transactionDetails.amount} {transactionDetails.token}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Para</span>
                <span className="text-sm font-medium font-mono">
                  {transactionDetails.recipient.slice(0, 6)}...
                  {transactionDetails.recipient.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Red</span>
                <span className="text-sm font-medium">{transactionDetails.network}</span>
              </div>
            </div>
          )}

          {/* Simulation Results */}
          <div className="mb-6 space-y-3">
            {/* Execution Status */}
            <div
              className={`p-4 rounded-xl border ${
                isSuccess
                  ? "bg-green-500/5 border-green-500/20"
                  : "bg-red-500/5 border-red-500/20"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className={`h-4 w-4 ${isSuccess ? "text-green-500" : "text-red-500"}`} />
                <span className="text-sm font-medium">Estado de Ejecución</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {simulationResult.executionStatus}
              </p>
              {simulationResult.revertReason && (
                <p className="text-sm text-red-400 mt-2">
                  Razón: {simulationResult.revertReason}
                </p>
              )}
            </div>

            {/* Gas Estimates */}
            {isSuccess && (
              <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <Fuel className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium">Estimación de Gas</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Gas Estimado</span>
                    <span className="text-sm font-medium">
                      {simulationResult.gasEstimateFormatted} ETH
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Max Fee Sugerido</span>
                    <span className="text-sm font-medium text-purple-400">
                      {simulationResult.suggestedMaxFeeFormatted} ETH
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cerrar
            </Button>
            {isSuccess && onProceed && (
              <Button
                type="button"
                className="flex-1"
                onClick={() => {
                  onClose();
                  onProceed();
                }}
              >
                Proceder con Envío
              </Button>
            )}
          </div>

          {/* Info Notice */}
          <div className="mt-4 p-3 rounded-lg bg-secondary/30 border border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              {isSuccess
                ? "✓ Esta simulación indica que tu transacción debería ejecutarse correctamente"
                : "⚠️ Esta transacción fallaría si se ejecuta. Verifica los detalles."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
