import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const verifyPinAndSend = baseProcedure
  .input(
    z.object({
      authToken: z.string(),
      pin: z.string().min(4, "PIN required"),
      network: z.enum(["scroll", "scroll-sepolia", "starknet", "starknet-sepolia"]),
      token: z.string(),
      recipient: z.string(),
      amount: z.string(),
      txHash: z.string().optional(), // Real transaction hash from blockchain
    })
  )
  .mutation(async ({ input }) => {
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

    // Verify PIN
    const isValidPin = await bcryptjs.compare(input.pin, user.hashedPin);

    if (!isValidPin) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid PIN",
      });
    }

    // Get wallet address based on network
    const isScrollNetwork = input.network.startsWith("scroll");
    const walletAddress = isScrollNetwork ? user.scrollAddress : user.starknetAddress;

    // Use provided transaction hash or generate placeholder for demo
    const hash = input.txHash || `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    // Determine status based on whether we have a real hash
    const status = input.txHash ? "pending" : "completed";

    // Create transaction
    const transaction = await db.transaction.create({
      data: {
        hash,
        network: input.network,
        walletAddress: walletAddress.toLowerCase(),
        type: "send",
        status,
        fromToken: input.token,
        toToken: null,
        amount: input.amount,
        toAmount: null,
        recipient: input.recipient.toLowerCase(),
        gasFee: "0.35",
        fromTokenUsdPrice: 1.0,
        totalUsdValue: parseFloat(input.amount),
      },
    });

    return {
      success: true,
      transactionHash: transaction.hash,
      transactionId: transaction.id,
    };
  });
