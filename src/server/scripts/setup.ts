import { db } from "~/server/db";
import bcryptjs from "bcryptjs";

async function setup() {
  console.log("Running setup script...");

  try {
    // Seed demo user
    const existingUser = await db.user.findUnique({
      where: { email: "demo@example.com" },
    });

    let demoUser;
    if (!existingUser) {
      console.log("Creating demo user...");
      
      // Hash PIN "1234" for demo user
      const hashedPin = await bcryptjs.hash("1234", 10);
      
      demoUser = await db.user.create({
        data: {
          email: "demo@example.com",
          hashedPin,
          scrollAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
          starknetAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        },
      });
      
      console.log("Demo user created successfully");
      console.log("Email: demo@example.com");
      console.log("PIN: 1234");
    } else {
      demoUser = existingUser;
      console.log("Demo user already exists");
    }

    // Seed some example transactions for demonstration
    const exampleWalletAddress = demoUser.scrollAddress;
    
    // Check if we already have seed data
    const existingTransactions = await db.transaction.count({
      where: { walletAddress: exampleWalletAddress.toLowerCase() },
    });
    
    if (existingTransactions === 0) {
      console.log("Seeding example transactions for demo user...");
      
      // Create example swap transactions
      await db.transaction.createMany({
        data: [
          {
            hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            network: "scroll",
            walletAddress: exampleWalletAddress.toLowerCase(),
            type: "swap",
            status: "completed",
            fromToken: "USDT",
            toToken: "USDC",
            amount: "1000.00",
            toAmount: "999.50",
            gasFee: "0.52",
            priceImpact: 0.05,
            exchangeRate: 0.9995,
            fromTokenUsdPrice: 1.0,
            toTokenUsdPrice: 0.9995,
            totalUsdValue: 1000.0,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          },
          {
            hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
            network: "scroll",
            walletAddress: exampleWalletAddress.toLowerCase(),
            type: "swap",
            status: "completed",
            fromToken: "USDC",
            toToken: "DAI",
            amount: "500.00",
            toAmount: "499.80",
            gasFee: "0.48",
            priceImpact: 0.04,
            exchangeRate: 0.9996,
            fromTokenUsdPrice: 1.0,
            toTokenUsdPrice: 0.9996,
            totalUsdValue: 500.0,
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
          },
          {
            hash: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
            network: "scroll",
            walletAddress: exampleWalletAddress.toLowerCase(),
            type: "send",
            status: "completed",
            fromToken: "USDT",
            toToken: null,
            amount: "250.00",
            toAmount: null,
            recipient: "0x8ba1f109551bd432803012645ac136ddd64dba72",
            gasFee: "0.35",
            fromTokenUsdPrice: 1.0,
            totalUsdValue: 250.0,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          },
          {
            hash: "0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210",
            network: "scroll",
            walletAddress: exampleWalletAddress.toLowerCase(),
            type: "swap",
            status: "completed",
            fromToken: "DAI",
            toToken: "USDC",
            amount: "1500.00",
            toAmount: "1499.25",
            gasFee: "0.55",
            priceImpact: 0.05,
            exchangeRate: 0.9995,
            fromTokenUsdPrice: 1.0,
            toTokenUsdPrice: 1.0005,
            totalUsdValue: 1500.0,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          },
          {
            hash: "0x1111111111111111111111111111111111111111111111111111111111111111",
            network: "scroll",
            walletAddress: exampleWalletAddress.toLowerCase(),
            type: "swap",
            status: "pending",
            fromToken: "USDT",
            toToken: "DAI",
            amount: "300.00",
            toAmount: "299.90",
            gasFee: "0.42",
            priceImpact: 0.03,
            exchangeRate: 0.9997,
            fromTokenUsdPrice: 1.0,
            toTokenUsdPrice: 0.9997,
            totalUsdValue: 300.0,
            createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
          },
        ],
      });
      
      console.log("Example transactions seeded successfully");
    }

    // Seed portfolio snapshots
    const existingSnapshots = await db.portfolioSnapshot.count({
      where: { walletAddress: exampleWalletAddress.toLowerCase() },
    });
    
    if (existingSnapshots === 0) {
      console.log("Seeding portfolio snapshots for demo user...");
      
      // Create snapshots over the last 30 days
      const snapshots = [];
      const now = Date.now();
      
      for (let i = 30; i >= 0; i--) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        const baseValue = 2000;
        const variation = Math.sin(i / 5) * 200 + Math.random() * 100;
        const totalValue = baseValue + variation;
        
        snapshots.push({
          walletAddress: exampleWalletAddress.toLowerCase(),
          network: "scroll",
          totalUsdValue: totalValue,
          tokenBalances: JSON.stringify({
            USDT: (totalValue * 0.4).toFixed(2),
            USDC: (totalValue * 0.35).toFixed(2),
            DAI: (totalValue * 0.25).toFixed(2),
          }),
          createdAt: date,
        });
      }
      
      await db.portfolioSnapshot.createMany({
        data: snapshots,
      });
      
      console.log("Portfolio snapshots seeded successfully");
    }
    
    console.log("\n===========================================");
    console.log("Setup complete - Demo wallet ready!");
    console.log("===========================================");
    console.log("\nDemo Account Credentials:");
    console.log("Email: demo@example.com");
    console.log("PIN: 1234");
    console.log("\nYou can use these credentials to log in and test the wallet.");
    console.log("===========================================\n");
  } catch (error) {
    console.error("Error during setup:", error);
    throw error;
  }
}

setup()
  .then(() => {
    console.log("setup.ts complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
