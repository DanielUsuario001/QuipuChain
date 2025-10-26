import { useState, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { getTokensByNetwork, type Token, type TokenSymbol } from "~/lib/tokens";
import { useWalletStore } from "~/store/wallet";
import { cn } from "~/lib/utils";

interface TokenSelectorProps {
  selectedToken: TokenSymbol;
  onSelectToken: (token: TokenSymbol) => void;
}

export function TokenSelector({ selectedToken, onSelectToken }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedNetwork } = useWalletStore();
  const tokens = getTokensByNetwork(selectedNetwork);
  const currentToken = tokens[selectedToken];

  return (
    <>
      <Button
        variant="ghost"
        className="w-full justify-between h-auto p-0 hover:bg-transparent group"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-2">
          <img
            src={currentToken.logo}
            alt={currentToken.name}
            className="h-8 w-8 rounded-full ring-2 ring-border/50 group-hover:ring-primary/50 transition-all"
          />
          <span className="font-semibold text-base">{currentToken.symbol}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </Button>

      {isOpen && (
        <TokenSelectorModal
          tokens={tokens}
          selectedToken={selectedToken}
          onSelect={(token) => {
            onSelectToken(token);
            setIsOpen(false);
          }}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

interface TokenSelectorModalProps {
  tokens: Record<TokenSymbol, Token>;
  selectedToken: TokenSymbol;
  onSelect: (token: TokenSymbol) => void;
  onClose: () => void;
}

function TokenSelectorModal({ tokens, selectedToken, onSelect, onClose }: TokenSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);
  
  const tokenList = Object.values(tokens).filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border-2 border-border/50 bg-card shadow-2xl animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border/50 bg-secondary/30">
          <h2 className="text-xl font-bold mb-4">Select Token</h2>
          <div className="relative input-with-focus">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name or symbol"
              className="pl-11 h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {tokenList.map((token, index) => (
            <button
              key={token.symbol}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl p-3 transition-all hover:bg-secondary/70 hover:scale-[1.02] active:scale-[0.98] animate-scale-in",
                selectedToken === token.symbol && "bg-secondary/50 ring-2 ring-primary/30"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => onSelect(token.symbol)}
            >
              <img
                src={token.logo}
                alt={token.name}
                className={cn(
                  "h-10 w-10 rounded-full flex-shrink-0 ring-2 transition-all",
                  selectedToken === token.symbol 
                    ? "ring-primary/50" 
                    : "ring-border/50"
                )}
              />
              <div className="flex-1 text-left min-w-0">
                <div className="font-semibold">{token.symbol}</div>
                <div className="text-sm text-muted-foreground truncate">{token.name}</div>
              </div>
              {selectedToken === token.symbol && (
                <div className="h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0 animate-pulse-slow" />
              )}
            </button>
          ))}
          
          {tokenList.length === 0 && (
            <div className="py-16 text-center animate-fade-in">
              <div className="text-muted-foreground text-sm">No tokens found</div>
              <div className="text-xs text-muted-foreground mt-2">Try a different search term</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
