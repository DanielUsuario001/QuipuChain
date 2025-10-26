import { z } from "zod";
import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";
import { fetchOnChainBalances } from '~/server/utils/fetchOnChainBalances';

export const getUserPortfolio = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      network: z.enum(["scroll", "scroll-sepolia", "starknet", "starknet-sepolia"]),
      walletAddress: z.string().optional(), // Optional connected wallet address
    })
  )
  .query(async ({ input }) => {
    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(input.authToken, env.JWT_SECRET) as { userId: number; email: string };
    } catch (error) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
      });
    }

    // Get user
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not found",
      });
    }

    // Get wallet address from input or user record
    const isScrollNetwork = input.network.startsWith("scroll");
    const walletAddress = input.walletAddress || (isScrollNetwork ? user.scrollAddress : user.starknetAddress);

    // Fetch real on-chain balances
    const tokenBalances = walletAddress 
      ? await fetchOnChainBalances(input.network, walletAddress)
      : { USDT: "0.00", USDC: "0.00", DAI: "0.00" };

    // Calculate total balance (assuming 1:1 USD peg for stablecoins)
    const totalBalance = Object.values(tokenBalances).reduce(
      (sum, balance) => sum + parseFloat(balance),
      0
    );

    // Get recent transactions
    const transactions = walletAddress ? await db.transaction.findMany({
      where: {
        walletAddress: walletAddress.toLowerCase(),
        network: input.network,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    }) : [];

    return {
      walletAddress: walletAddress || null,
      totalBalance,
      tokenBalances,
      transactions,
      email: user.email,
    };
  });
