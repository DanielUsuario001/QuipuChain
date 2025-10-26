import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getPortfolioPerformance = baseProcedure
  .input(
    z.object({
      walletAddress: z.string(),
      network: z.enum(['scroll', 'scroll-sepolia', 'starknet', 'starknet-sepolia']),
    })
  )
  .query(async ({ input }) => {
    const { walletAddress, network } = input;

    // Get the most recent snapshot
    const latestSnapshot = await db.portfolioSnapshot.findFirst({
      where: {
        walletAddress: walletAddress.toLowerCase(),
        network,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get snapshot from 24 hours ago
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const snapshot24hAgo = await db.portfolioSnapshot.findFirst({
      where: {
        walletAddress: walletAddress.toLowerCase(),
        network,
        createdAt: {
          lte: oneDayAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get snapshot from 7 days ago
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const snapshot7dAgo = await db.portfolioSnapshot.findFirst({
      where: {
        walletAddress: walletAddress.toLowerCase(),
        network,
        createdAt: {
          lte: sevenDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get snapshot from 30 days ago
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const snapshot30dAgo = await db.portfolioSnapshot.findFirst({
      where: {
        walletAddress: walletAddress.toLowerCase(),
        network,
        createdAt: {
          lte: thirtyDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate changes
    const currentValue = latestSnapshot?.totalUsdValue ?? 0;
    const change24h = snapshot24hAgo 
      ? ((currentValue - snapshot24hAgo.totalUsdValue) / snapshot24hAgo.totalUsdValue) * 100
      : 0;
    const change7d = snapshot7dAgo
      ? ((currentValue - snapshot7dAgo.totalUsdValue) / snapshot7dAgo.totalUsdValue) * 100
      : 0;
    const change30d = snapshot30dAgo
      ? ((currentValue - snapshot30dAgo.totalUsdValue) / snapshot30dAgo.totalUsdValue) * 100
      : 0;

    // Get historical snapshots for charting (last 30 days)
    const historicalSnapshots = await db.portfolioSnapshot.findMany({
      where: {
        walletAddress: walletAddress.toLowerCase(),
        network,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return {
      currentValue,
      previousValue24h: snapshot24hAgo?.totalUsdValue ?? currentValue,
      change24h,
      change7d,
      change30d,
      tokenBalances: latestSnapshot?.tokenBalances 
        ? JSON.parse(latestSnapshot.tokenBalances)
        : {},
      historicalSnapshots: historicalSnapshots.map(snapshot => ({
        timestamp: snapshot.createdAt,
        value: snapshot.totalUsdValue,
      })),
    };
  });
