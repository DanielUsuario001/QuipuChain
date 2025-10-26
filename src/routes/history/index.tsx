import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, ArrowDownUp, Send, CheckCircle, Clock, XCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useWalletStore } from "~/store/wallet";
import { shortenAddress, formatTokenAmount } from "~/lib/utils";
import { EXPLORERS } from "~/lib/constants";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { TransactionDetailsModal } from "~/components/history/transaction-details-modal";
import { PortfolioPerformanceCard } from "~/components/history/portfolio-performance-card";

export const Route = createFileRoute("/history/")({
  component: HistoryPage,
});

function HistoryPage() {
  const { selectedNetwork, scrollAddress, starknetAddress } = useWalletStore();
  const isScrollNetwork = selectedNetwork.startsWith('scroll');
  const walletAddress = isScrollNetwork ? scrollAddress : starknetAddress;
  const isConnected = !!walletAddress;
  const explorerUrl = EXPLORERS[selectedNetwork];
  
  const trpc = useTRPC();
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  // Fetch portfolio performance
  const portfolioQuery = useQuery(
    trpc.getPortfolioPerformance.queryOptions(
      {
        walletAddress: walletAddress || '',
        network: selectedNetwork,
      },
      {
        enabled: isConnected,
      }
    )
  );

  // Fetch transaction history with pagination
  const transactionsQuery = useInfiniteQuery(
    trpc.getTransactionHistory.infiniteQueryOptions(
      {
        walletAddress: walletAddress || '',
        network: selectedNetwork,
        limit: 20,
      },
      {
        enabled: isConnected,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    )
  );

  const transactions = transactionsQuery.data?.pages.flatMap(page => page.transactions) ?? [];
  const hasMore = transactionsQuery.hasNextPage;
  const isLoadingMore = transactionsQuery.isFetchingNextPage;

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Activity</h1>
      </div>

      {isConnected ? (
        <>
          {/* Portfolio Performance */}
          <PortfolioPerformanceCard
            currentValue={portfolioQuery.data?.currentValue ?? 0}
            previousValue24h={portfolioQuery.data?.previousValue24h ?? 0}
            change24h={portfolioQuery.data?.change24h ?? 0}
            change7d={portfolioQuery.data?.change7d ?? 0}
            change30d={portfolioQuery.data?.change30d ?? 0}
            tokenBalances={portfolioQuery.data?.tokenBalances ?? {}}
            isLoading={portfolioQuery.isLoading}
          />

          {/* Transaction History */}
          {transactionsQuery.isLoading ? (
            <Card className="wallet-card">
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">Loading transactions...</div>
              </CardContent>
            </Card>
          ) : transactions.length > 0 ? (
            <>
              <Card className="wallet-card">
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {transactions.map((tx) => (
                      <TransactionRow 
                        key={tx.id} 
                        transaction={tx} 
                        explorerUrl={explorerUrl}
                        onClick={() => setSelectedTransaction(tx)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => transactionsQuery.fetchNextPage()}
                    isLoading={isLoadingMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card className="wallet-card">
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground space-y-2">
                  <div className="text-lg">No activity yet</div>
                  <div className="text-sm">Your transactions will appear here</div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card className="wallet-card">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              Connect your wallet to view transaction history
            </p>
          </CardContent>
        </Card>
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <TransactionDetailsModal
          isOpen={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          transaction={selectedTransaction}
        />
      )}
    </div>
  );
}

function TransactionRow({ 
  transaction, 
  explorerUrl,
  onClick 
}: { 
  transaction: any; 
  explorerUrl: string;
  onClick: () => void;
}) {
  const statusIcons = {
    completed: <CheckCircle className="h-4 w-4 text-green-500" />,
    pending: <Clock className="h-4 w-4 text-yellow-500" />,
    failed: <XCircle className="h-4 w-4 text-red-500" />,
  };

  const statusColors = {
    completed: 'text-green-500',
    pending: 'text-yellow-500',
    failed: 'text-red-500',
  };

  return (
    <div 
      className="p-4 hover:bg-secondary/30 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-primary/10 flex-shrink-0">
          {transaction.type === 'swap' ? (
            <ArrowDownUp className="h-5 w-5 text-primary" />
          ) : (
            <Send className="h-5 w-5 text-primary" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-medium text-sm">
              {transaction.type === 'swap' ? (
                <>Swap {transaction.fromToken} → {transaction.toToken}</>
              ) : (
                <>Send {transaction.fromToken}</>
              )}
            </div>
            {statusIcons[transaction.status as keyof typeof statusIcons]}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {new Date(transaction.createdAt).toLocaleString()}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <div className="font-medium text-sm">
              {formatTokenAmount(transaction.amount, 6, 2)} {transaction.fromToken}
            </div>
            <div className={`text-xs ${statusColors[transaction.status as keyof typeof statusColors]} capitalize`}>
              {transaction.status}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`${explorerUrl}/tx/${transaction.hash}`, '_blank');
            }}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
