import { HelpCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Tooltip } from "~/components/ui/tooltip";
import { useState } from "react";

export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 animate-fade-in">
        <Tooltip content="Need help? Contact support">
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-neon hover:shadow-glow-lg transition-all duration-300 hover:scale-110 bg-gradient-to-br from-purple-600 to-blue-600"
            onClick={handleClick}
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </Tooltip>
      </div>

      {isOpen && (
        <HelpModal onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}

function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-neon border border-purple-500/30 animate-scale-in">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gradient">Help & Support</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-secondary transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
              <h3 className="font-semibold mb-2">📧 Email Support</h3>
              <p className="text-sm text-muted-foreground">support@quipuchain.com</p>
            </div>

            <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
              <h3 className="font-semibold mb-2">💬 Live Chat</h3>
              <p className="text-sm text-muted-foreground">Available 24/7</p>
              <Button className="w-full mt-3" size="sm">
                Start Chat
              </Button>
            </div>

            <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
              <h3 className="font-semibold mb-2">📚 Documentation</h3>
              <p className="text-sm text-muted-foreground">Learn how to use QuipuChain</p>
              <Button variant="outline" className="w-full mt-3" size="sm">
                View Docs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
