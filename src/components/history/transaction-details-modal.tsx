import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, ExternalLink, Copy, CheckCircle, Clock, XCircle, ArrowDownUp, Send, Calendar, Hash, Wallet, DollarSign } from "lucide-react";
import { Button } from "~/components/ui/button";
import { formatTokenAmount, formatFiat, shortenAddress, copyToClipboard } from "~/lib/utils";
import { EXPLORERS } from "~/lib/constants";
import type { NetworkType } from "~/lib/tokens";
import { useState } from "react";

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
    id: number;
    hash: string;
    network: string;
    walletAddress: string;
    type: string;
    status: string;
    fromToken: string;
    toToken: string | null;
    amount: string;
    toAmount: string | null;
    recipient: string | null;
    gasFee: string | null;
    priceImpact: number | null;
    exchangeRate: number | null;
    fromTokenUsdPrice: number | null;
    toTokenUsdPrice: number | null;
    totalUsdValue: number | null;
    createdAt: Date;
  };
}

export function TransactionDetailsModal({ isOpen, onClose, transaction }: TransactionDetailsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const explorerUrl = EXPLORERS[transaction.network as NetworkType];
  
  const statusConfig = {
    completed: {
      icon: <CheckCircle className="h-5 w-5" />,
      color: "text-green-500",
      bg: "bg-green-500/10",
      label: "Completed",
    },
    pending: {
      icon: <Clock className="h-5 w-5" />,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      label: "Pending",
    },
    failed: {
      icon: <XCircle className="h-5 w-5" />,
      color: "text-red-500",
      bg: "bg-red-500/10",
      label: "Failed",
    },
  };

  const status = statusConfig[transaction.status as keyof typeof statusConfig] || statusConfig.completed;

  const handleCopy = async (text: string, field: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-card border border-border p-6 shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-xl font-bold">
                    Transaction Details
                  </Dialog.Title>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Status Badge */}
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${status.bg} ${status.color} mb-6`}>
                  {status.icon}
                  <span className="font-medium">{status.label}</span>
                </div>

                {/* Transaction Type */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
                    <div className={`p-2.5 rounded-lg ${status.bg}`}>
                      {transaction.type === 'swap' ? (
                        <ArrowDownUp className={`h-5 w-5 ${status.color}`} />
                      ) : (
                        <Send className={`h-5 w-5 ${status.color}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">
                        {transaction.type === 'swap' ? 'Token Swap' : 'Token Send'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.type === 'swap' 
                          ? `${transaction.fromToken} → ${transaction.toToken}`
                          : `Sent ${transaction.fromToken}`
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="space-y-4">
                  {/* Amounts */}
                  <div className="space-y-3">
                    <DetailRow
                      icon={<ArrowDownUp className="h-4 w-4" />}
                      label="Amount"
                      value={`${formatTokenAmount(transaction.amount, 6, 6)} ${transaction.fromToken}`}
                      subValue={transaction.fromTokenUsdPrice 
                        ? `≈ ${formatFiat(parseFloat(transaction.amount) * transaction.fromTokenUsdPrice)}`
                        : undefined
                      }
                    />
                    
                    {transaction.type === 'swap' && transaction.toAmount && (
                      <DetailRow
                        icon={<ArrowDownUp className="h-4 w-4" />}
                        label="Received"
                        value={`${formatTokenAmount(transaction.toAmount, 6, 6)} ${transaction.toToken}`}
                        subValue={transaction.toTokenUsdPrice 
                          ? `≈ ${formatFiat(parseFloat(transaction.toAmount) * transaction.toTokenUsdPrice)}`
                          : undefined
                        }
                      />
                    )}

                    {transaction.recipient && (
                      <DetailRow
                        icon={<Wallet className="h-4 w-4" />}
                        label="Recipient"
                        value={shortenAddress(transaction.recipient)}
                        copyable
                        onCopy={() => handleCopy(transaction.recipient!, 'recipient')}
                        copied={copiedField === 'recipient'}
                      />
                    )}
                  </div>

                  {/* Transaction Info */}
                  <div className="pt-3 border-t border-border/50 space-y-3">
                    {transaction.exchangeRate && transaction.type === 'swap' && (
                      <DetailRow
                        icon={<DollarSign className="h-4 w-4" />}
                        label="Exchange Rate"
                        value={`1 ${transaction.fromToken} = ${transaction.exchangeRate.toFixed(6)} ${transaction.toToken}`}
                      />
                    )}

                    {transaction.priceImpact !== null && transaction.type === 'swap' && (
                      <DetailRow
                        icon={<DollarSign className="h-4 w-4" />}
                        label="Price Impact"
                        value={`${transaction.priceImpact.toFixed(2)}%`}
                        valueColor={transaction.priceImpact > 1 ? 'text-yellow-500' : undefined}
                      />
                    )}

                    {transaction.gasFee && (
                      <DetailRow
                        icon={<DollarSign className="h-4 w-4" />}
                        label="Network Fee"
                        value={`${formatFiat(parseFloat(transaction.gasFee))}`}
                      />
                    )}

                    <DetailRow
                      icon={<Calendar className="h-4 w-4" />}
                      label="Date"
                      value={new Date(transaction.createdAt).toLocaleString()}
                    />

                    <DetailRow
                      icon={<Hash className="h-4 w-4" />}
                      label="Transaction Hash"
                      value={shortenAddress(transaction.hash, 6)}
                      copyable
                      onCopy={() => handleCopy(transaction.hash, 'hash')}
                      copied={copiedField === 'hash'}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-border/50 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(`${explorerUrl}/tx/${transaction.hash}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Explorer
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

function DetailRow({ 
  icon, 
  label, 
  value, 
  subValue,
  valueColor,
  copyable, 
  onCopy, 
  copied 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  subValue?: string;
  valueColor?: string;
  copyable?: boolean; 
  onCopy?: () => void; 
  copied?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2 text-muted-foreground min-w-0">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-2 text-right">
        <div>
          <div className={`text-sm font-medium ${valueColor || ''}`}>{value}</div>
          {subValue && (
            <div className="text-xs text-muted-foreground">{subValue}</div>
          )}
        </div>
        {copyable && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full flex-shrink-0"
            onClick={onCopy}
          >
            {copied ? (
              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
