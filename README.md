# QuipuChain - Multi-Chain Stablecoin Wallet & DEX Aggregator

A beautiful, pixel-perfect web application for swapping and managing stablecoins (USDT, USDC, DAI) across Scroll and Starknet networks. Named after the ancient Incan recording device, QuipuChain brings together tradition and innovation in blockchain technology.

![QuipuChain](https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=400&fit=crop)

## 🌟 Features

### ✅ Implemented (Fully Functional)
- **Multi-Chain Support**: Seamless switching between Scroll (EVM) and Starknet networks
- **Wallet Connection**: Mock wallet connection for MetaMask, WalletConnect (Scroll), Argent X, and Braavos (Starknet)
- **Token Swapping**: Beautiful swap interface with real-time quote simulation
- **Transaction History**: View past swaps and sends with detailed information
- **Portfolio Performance**: Track portfolio value with 24h, 7d, and 30d performance metrics
- **Detailed Transaction Receipts**: Click any transaction to view comprehensive details including:
  - Transaction hash and status
  - Token amounts and USD values
  - Exchange rates and price impact
  - Network fees
  - Recipient addresses (for sends)
  - Links to block explorers
- **Pagination**: Load more transactions as you scroll through history
- **Slippage Control**: Customizable slippage tolerance (0.1%, 0.5%, 1%, 3%)
- **Network Selector**: Easy switching between mainnet and testnet
- **Settings Management**: Persistent user preferences using Zustand
- **Responsive Design**: Mobile-first, pixel-perfect UI with smooth animations
- **Database Storage**: PostgreSQL with Prisma ORM for transaction and portfolio data

### 🎨 UI-Only (Frontend Mock)
- **Send/Receive**: Transfer interface with address validation and QR code display
- **Balance Display**: Simulated token balances
- **Price Quotes**: Mock DEX aggregator quotes (Uniswap V3 for Scroll, AVNU for Starknet)

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19 + TypeScript
- **Routing**: TanStack Router (file-based routing)
- **State Management**: Zustand with localStorage persistence
- **Styling**: TailwindCSS with custom design tokens
- **UI Components**: Custom shadcn/ui-style components + HeadlessUI
- **Icons**: Lucide React
- **Backend**: tRPC for type-safe API
- **Database**: PostgreSQL with Prisma ORM
- **Query Management**: TanStack Query (React Query)

### Project Structure

```
src/
├── components/
│   ├── history/
│   │   ├── transaction-details-modal.tsx  # Detailed transaction receipt modal
│   │   └── portfolio-performance-card.tsx # Portfolio performance metrics
│   ├── layout/
│   │   └── header.tsx                     # Navigation header with wallet connection
│   ├── swap/
│   │   ├── token-selector.tsx             # Token selection modal
│   │   ├── price-display.tsx              # Price and trend display
│   │   ├── exchange-rate-display.tsx      # Exchange rate info
│   │   └── price-impact-indicator.tsx     # Price impact warning
│   └── ui/
│       ├── button.tsx                     # Reusable button component
│       ├── card.tsx                       # Card components
│       └── input.tsx                      # Input component
├── lib/
│   ├── chains.ts                          # Scroll chain configurations (viem)
│   ├── tokens.ts                          # Token addresses for all networks
│   ├── constants.ts                       # App-wide constants (DEX routers, slippage, etc.)
│   └── utils.ts                           # Utility functions (formatting, validation)
├── routes/
│   ├── __root.tsx                         # Root layout with header
│   ├── index.tsx                          # Swap page (main feature)
│   ├── send/index.tsx                     # Send/Receive page
│   ├── history/index.tsx                  # Transaction history with portfolio performance
│   └── settings/index.tsx                 # User settings
├── server/
│   ├── trpc/
│   │   ├── procedures/
│   │   │   ├── getTransactionHistory.ts   # Fetch paginated transaction history
│   │   │   ├── getTransactionDetails.ts   # Fetch single transaction details
│   │   │   ├── getPortfolioPerformance.ts # Fetch portfolio metrics
│   │   │   └── createTransaction.ts       # Store new transactions
│   │   ├── main.ts                        # tRPC configuration
│   │   └── root.ts                        # tRPC router
│   ├── scripts/
│   │   └── setup.ts                       # Database seeding script
│   └── db.ts                              # Prisma client
├── store/
│   └── wallet.ts                          # Zustand store for wallet state
└── styles.css                             # Global styles and CSS variables

prisma/
└── schema.prisma                          # Database schema (Transaction, PortfolioSnapshot)
```

## 💾 Database Schema

### Transaction Model
Stores all swap and send transactions with comprehensive details:

```prisma
model Transaction {
  id                Int      @id @default(autoincrement())
  createdAt         DateTime @default(now())
  hash              String   @unique
  network           String   // 'scroll', 'scroll-sepolia', 'starknet', 'starknet-sepolia'
  walletAddress     String
  type              String   // 'swap' or 'send'
  status            String   // 'completed', 'pending', 'failed'
  fromToken         String
  toToken           String?  // null for 'send' transactions
  amount            String
  toAmount          String?  // amount received (for swaps)
  recipient         String?  // for 'send' transactions
  gasFee            String?
  priceImpact       Float?
  exchangeRate      Float?
  fromTokenUsdPrice Float?
  toTokenUsdPrice   Float?
  totalUsdValue     Float?
}
```

### PortfolioSnapshot Model
Stores historical portfolio values for performance tracking:

```prisma
model PortfolioSnapshot {
  id            Int      @id @default(autoincrement())
  createdAt     DateTime @default(now())
  walletAddress String
  network       String
  totalUsdValue Float
  tokenBalances String   // JSON: { "USDT": "1000.50", "USDC": "500.25", ... }
}
```

### Seed Data
The app automatically seeds example transactions and portfolio snapshots on first run:
- 5 example transactions (swaps and sends)
- 31 days of portfolio snapshots showing historical performance
- All data is for the example wallet: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`

## 🔌 tRPC API

### Available Procedures

#### `getTransactionHistory`
Fetch paginated transaction history for a wallet address.

**Input:**
```typescript
{
  walletAddress: string;
  network: 'scroll' | 'scroll-sepolia' | 'starknet' | 'starknet-sepolia';
  limit?: number;        // Default: 20, Max: 100
  cursor?: number;       // Transaction ID for pagination
}
```

**Output:**
```typescript
{
  transactions: Transaction[];
  nextCursor?: number;
}
```

#### `getTransactionDetails`
Fetch detailed information about a specific transaction.

**Input:**
```typescript
{
  hash: string;
}
```

**Output:**
```typescript
Transaction
```

#### `getPortfolioPerformance`
Fetch portfolio performance metrics and historical data.

**Input:**
```typescript
{
  walletAddress: string;
  network: 'scroll' | 'scroll-sepolia' | 'starknet' | 'starknet-sepolia';
}
```

**Output:**
```typescript
{
  currentValue: number;
  previousValue24h: number;
  change24h: number;       // Percentage change
  change7d: number;        // Percentage change
  change30d: number;       // Percentage change
  tokenBalances: Record<string, string>;
  historicalSnapshots: Array<{
    timestamp: Date;
    value: number;
  }>;
}
```

#### `createTransaction`
Store a new transaction in the database (mutation).

**Input:**
```typescript
{
  hash: string;
  network: string;
  walletAddress: string;
  type: 'swap' | 'send';
  status: 'completed' | 'pending' | 'failed';
  fromToken: string;
  toToken?: string;
  amount: string;
  toAmount?: string;
  recipient?: string;
  gasFee?: string;
  priceImpact?: number;
  exchangeRate?: number;
  fromTokenUsdPrice?: number;
  toTokenUsdPrice?: number;
  totalUsdValue?: number;
}
```

**Output:**
```typescript
{
  success: boolean;
  transactionId: number;
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd c-mbialoya
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Run the development server
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 🔐 Environment Variables

Current environment variables:

```env
# Database (automatically configured in Docker)
DATABASE_URL=postgresql://postgres:postgres@postgres/app

# Blockchain RPC endpoints (using public RPCs by default)
SCROLL_RPC_URL=https://rpc.scroll.io
SCROLL_SEPOLIA_RPC_URL=https://sepolia-rpc.scroll.io
STARKNET_RPC_URL=https://starknet-mainnet.public.blastapi.io
STARKNET_SEPOLIA_RPC_URL=https://starknet-sepolia.public.blastapi.io

# DEX Aggregator API keys (optional, for future implementation)
ONEINCH_API_KEY=
AVNU_API_KEY=
```

**Note**: 
- The database connection is automatically configured when running via Docker
- The current implementation includes working transaction history and portfolio tracking
- For production, replace public RPC URLs with private endpoints (Alchemy/Infura/Blast)
- API keys for 1inch and AVNU are not yet required as swap execution is still mocked
- **No environment variables need to be changed** for the app to function with all current features

### Security Considerations
- No private keys stored in app
- Wallet connections handled by external providers
- All approvals done through user's wallet
- Transaction simulation before execution
- Slippage protection
- Deadline enforcement

## 🤝 Contributing

This is a demo/MVP implementation. For production:
1. Implement real wallet connections
2. Integrate with DEX aggregators
3. Add comprehensive error handling
4. Implement rate limiting
5. Add transaction monitoring
6. Set up analytics and logging
7. Conduct security audit

## 📄 License

MIT License - See LICENSE file for details

---

Built with ❤️ using React, TypeScript, and TailwindCSS
