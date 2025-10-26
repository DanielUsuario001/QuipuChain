import { createFileRoute, Link, useSearch, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Send, QrCode, Copy, Check, ArrowLeft, Wallet, Activity } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { TokenSelector } from "~/components/swap/token-selector";
import { PinModal } from "~/components/ui/pin-modal";
import { WalletConnectModal } from '~/components/wallet/wallet-connect-modal';
import { useWalletStore } from "~/store/wallet";
import { useAuthStore } from "~/store/auth";
import { copyToClipboard, shortenAddress, isValidEthAddress, isValidStarknetAddress, formatTokenAmount } from "~/lib/utils";
import type { TokenSymbol } from "~/lib/tokens";
import { useTRPC } from "~/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { sendToken } from '~/lib/web3/scroll';
import { sendStarknetToken, simulateStarknetTransaction, type SimulationResult } from '~/lib/web3/starknet';
import { SimulationResultModal } from '~/components/ui/simulation-result-modal';
import { getTokensByNetwork } from '~/lib/tokens';
import { parseUnits } from 'viem';
import { NETWORK_NAMES } from "~/lib/constants";

export const Route = createFileRoute("/send/")({
  component: SendPage,
  validateSearch: (search: Record<string, unknown>): { action?: 'send' | 'receive' } => {
    return {
      action: search.action as 'send' | 'receive' | undefined,
    };
  },
});

type View = 'main' | 'send' | 'receive';

function SendPage() {
  const searchParams = useSearch({ from: '/send/' });
  const navigate = useNavigate();
  const { selectedNetwork, scrollAddress, starknetAddress, starknetAccount } = useWalletStore();
  const { authToken } = useAuthStore();
  const trpc = useTRPC();
  
  // Determine initial view from URL parameter
  const initialView = searchParams.action === 'send' ? 'send' : searchParams.action === 'receive' ? 'receive' : 'main';
  const [view, setView] = useState<View>(initialView);
  
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>('USDT');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const isScrollNetwork = selectedNetwork.startsWith('scroll');
  const currentAddress = isScrollNetwork ? scrollAddress : starknetAddress;
  const isConnected = !!currentAddress;
  
  const isValidAddress = isScrollNetwork 
    ? isValidEthAddress(recipient)
    : isValidStarknetAddress(recipient);

  // Fetch user portfolio for balances
  const portfolioQuery = useQuery(
    trpc.getUserPortfolio.queryOptions({
      authToken: authToken || '',
      network: selectedNetwork,
    })
  );

  const tokenBalances = portfolioQuery.data?.tokenBalances || {};
  const currentBalance = tokenBalances[selectedToken] || '0.00';

  // Send transaction mutation
  const sendMutation = useMutation(
    trpc.verifyPinAndSend.mutationOptions({
      onSuccess: (data) => {
        toast.success('¡Transacción enviada exitosamente!');
        setRecipient('');
        setAmount('');
        navigate({ to: '/' });
        portfolioQuery.refetch();
      },
      onError: (error: any) => {
        toast.error(error.message || 'Transacción fallida');
      },
    })
  );

  const handleCopy = async () => {
    if (currentAddress) {
      const success = await copyToClipboard(currentAddress);
      if (success) {
        setCopied(true);
        toast.success('¡Dirección copiada!');
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleSimulate = async () => {
    if (!recipient || !amount || !isValidAddress || parseFloat(amount) <= 0) {
      toast.error('Por favor completa todos los campos correctamente');
      return;
    }

    if (isScrollNetwork) {
      toast.error('La simulación solo está disponible para Starknet');
      return;
    }

    if (!starknetAccount) {
      toast.error('Por favor conecta tu wallet de Starknet primero');
      setShowWalletModal(true);
      return;
    }

    const amountNum = parseFloat(amount);
    const balanceNum = parseFloat(currentBalance);

    if (amountNum > balanceNum) {
      toast.error('Balance insuficiente');
      return;
    }

    setIsSimulating(true);
    try {
      const tokens = getTokensByNetwork(selectedNetwork);
      const token = tokens[selectedToken];
      
      if (!token) {
        throw new Error('Token no encontrado');
      }

      const amountBigInt = parseUnits(amount, token.decimals);
      
      const toastId = toast.loading('Simulando transacción en Starknet...');
      const result = await simulateStarknetTransaction(
        starknetAccount!,
        token.address,
        recipient,
        amountBigInt
      );
      
      toast.dismiss(toastId);
      setSimulationResult(result);
      setShowSimulationModal(true);
      
      if (result.success) {
        toast.success('✓ Simulación exitosa - La transacción debería funcionar');
      } else {
        toast.error('⚠️ La simulación indica que la transacción fallaría');
      }
    } catch (error: any) {
      console.error('Simulación fallida:', error);
      toast.error(error.message || 'Error al simular la transacción');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSendClick = () => {
    if (!recipient || !amount || !isValidAddress || parseFloat(amount) <= 0) {
      return;
    }

    const amountNum = parseFloat(amount);
    const balanceNum = parseFloat(currentBalance);

    if (amountNum > balanceNum) {
      toast.error('Balance insuficiente');
      return;
    }

    setShowPinModal(true);
  };

  const handlePinConfirm = async (pin: string) => {
    try {
      const tokens = getTokensByNetwork(selectedNetwork);
      const token = tokens[selectedToken];
      
      if (!token) {
        throw new Error('Token no encontrado');
      }

      const amountBigInt = parseUnits(amount, token.decimals);
      
      let txHash: string;
      
      if (isScrollNetwork) {
        if (!scrollAddress) {
          throw new Error('Wallet de Scroll no conectada');
        }
        
        txHash = await sendToken(
          selectedNetwork,
          token.address as `0x${string}`,
          recipient as `0x${string}`,
          amountBigInt,
          scrollAddress as `0x${string}`
        );
      } else {
        if (!starknetAccount || !starknetAddress) {
          throw new Error('Wallet de Starknet no conectada');
        }
        
        txHash = await sendStarknetToken(
          starknetAccount,
          token.address,
          recipient,
          amountBigInt
        );
      }

      await sendMutation.mutateAsync({
        authToken: authToken || '',
        pin,
        network: selectedNetwork,
        token: selectedToken,
        recipient,
        amount,
        txHash,
      });

      toast.success(`¡Transacción enviada! Hash: ${txHash.slice(0, 10)}...`);
      setRecipient('');
      setAmount('');
      navigate({ to: '/' });
      portfolioQuery.refetch();
    } catch (error: any) {
      console.error('Transacción fallida:', error);
      toast.error(error.message || 'Transacción fallida');
    }
  };

  if (view === 'main') {
    return (
      <div className="max-w-md mx-auto space-y-4 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gradient">Enviar y Recibir</h1>
        </div>

        <div className="grid gap-3">
          <button
            onClick={() => setView('send')}
            className="wallet-card p-6 hover:border-green-500/50 hover:shadow-neon-green transition-all hover:scale-105 active:scale-95"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center shadow-neon-green">
                <Send className="h-6 w-6 text-green-400" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg">Enviar</div>
                <div className="text-sm text-muted-foreground">Transferir tokens a otra dirección</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setView('receive')}
            className="wallet-card p-6 hover:border-purple-500/50 hover:shadow-neon transition-all hover:scale-105 active:scale-95"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center shadow-neon">
                <QrCode className="h-6 w-6 text-purple-400" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg">Recibir</div>
                <div className="text-sm text-muted-foreground">Obtener tu dirección de wallet</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (view === 'receive') {
    return (
      <div className="max-w-md mx-auto space-y-4 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setView('main')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gradient">Recibir</h1>
        </div>

        <Card className="wallet-card neon-border">
          <CardContent className="p-6 space-y-6">
            {isConnected ? (
              <>
                <div className="text-center space-y-3">
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">Tu Dirección de Wallet</div>
                  <div className="p-4 rounded-xl bg-secondary/50 border border-purple-500/20 font-mono text-sm break-all">
                    {currentAddress}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full gap-2 hover:border-purple-500/50 hover:shadow-neon"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        ¡Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar Dirección
                      </>
                    )}
                  </Button>
                </div>

                {/* QR Code Display */}
                <div className="flex justify-center p-8 rounded-xl bg-white shadow-neon">
                  <div className="text-center">
                    <QrCode className="h-40 w-40 mx-auto mb-2 text-gray-800" />
                    <p className="text-sm text-gray-600 font-medium">Escanea para enviar tokens</p>
                  </div>
                </div>

                {/* Network Info */}
                <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Red</span>
                    <span className="font-semibold text-purple-400">{NETWORK_NAMES[selectedNetwork]}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p>Conecta tu wallet para ver tu dirección</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-md mx-auto space-y-4 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setView('main')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gradient">Enviar Tokens</h1>
        </div>

        <Card className="wallet-card neon-border">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Token</label>
              <TokenSelector
                selectedToken={selectedToken}
                onSelectToken={setSelectedToken}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Dirección del Destinatario</label>
              <Input
                placeholder={isScrollNetwork ? "0x..." : "0x..."}
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                error={recipient !== '' && !isValidAddress}
              />
              {recipient && !isValidAddress && (
                <p className="text-xs text-destructive">Formato de dirección inválido</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cantidad</label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Balance: {formatTokenAmount(currentBalance, 18, 2)} {selectedToken}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs hover:text-purple-400"
                  onClick={() => setAmount(currentBalance)}
                >
                  MAX
                </Button>
              </div>
            </div>

            {isConnected ? (
              <div className="flex gap-3">
                {!isScrollNetwork && (
                  <Button
                    variant="outline"
                    className="flex-1 h-12 font-semibold rounded-xl hover:border-purple-500/50 hover:shadow-neon"
                    onClick={handleSimulate}
                    disabled={!recipient || !amount || !isValidAddress || parseFloat(amount) <= 0 || isSimulating}
                    isLoading={isSimulating}
                  >
                    Simular Transacción
                  </Button>
                )}
                <Button
                  className="flex-1 h-12 font-semibold rounded-xl hover:shadow-glow-lg"
                  onClick={handleSendClick}
                  disabled={!recipient || !amount || !isValidAddress || parseFloat(amount) <= 0}
                >
                  {isScrollNetwork ? 'Revisar Transacción' : 'Enviar'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
                    ⚠️ Necesitas conectar tu wallet de {isScrollNetwork ? 'Scroll' : 'Starknet'} para enviar tokens
                  </p>
                </div>
                <Button 
                  className="w-full h-12 font-semibold rounded-xl gap-2" 
                  onClick={() => setShowWalletModal(true)}
                >
                  <Wallet className="h-5 w-5" />
                  Conectar Wallet de {isScrollNetwork ? 'Scroll' : 'Starknet'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {isConnected && !isScrollNetwork && (
          <Card className="bg-purple-500/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Activity className="h-4 w-4 text-purple-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Simulación Disponible</p>
                  <p className="text-xs text-muted-foreground">
                    En Starknet puedes simular tu transacción antes de enviarla para verificar que funcionará correctamente y ver el costo estimado de gas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <Card className="bg-secondary/50 border-purple-500/20">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground text-center">
              {isConnected ? (
                <>🔒 Se te pedirá confirmar esta transacción con tu PIN</>
              ) : (
                <>🔐 Conecta tu wallet para comenzar a enviar tokens de forma segura</>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* PIN Confirmation Modal */}
      <PinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onConfirm={handlePinConfirm}
        title="Confirmar Envío"
        description="Ingresa tu PIN para autorizar esta transacción"
        transactionDetails={[
          { label: "Token", value: selectedToken },
          { label: "Cantidad", value: `${amount} ${selectedToken}` },
          { label: "Para", value: shortenAddress(recipient) },
          { label: "Red", value: NETWORK_NAMES[selectedNetwork] },
        ]}
      />

      {/* Simulation Result Modal */}
      <SimulationResultModal
        isOpen={showSimulationModal}
        onClose={() => setShowSimulationModal(false)}
        onProceed={() => setShowPinModal(true)}
        simulationResult={simulationResult}
        transactionDetails={{
          token: selectedToken,
          amount: amount,
          recipient: recipient,
          network: NETWORK_NAMES[selectedNetwork],
        }}
      />

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </>
  );
}
