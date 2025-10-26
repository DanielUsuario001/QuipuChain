import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const createTransaction = baseProcedure
  .input(
    z.object({
      hash: z.string(),
      network: z.enum(['scroll', 'scroll-sepolia', 'starknet', 'starknet-sepolia']),
      walletAddress: z.string(),
      type: z.enum(['swap', 'send']),
      status: z.enum(['completed', 'pending', 'failed']),
      fromToken: z.string(),
      toToken: z.string().optional(),
      amount: z.string(),
      toAmount: z.string().optional(),
      recipient: z.string().optional(),
      gasFee: z.string().optional(),
      priceImpact: z.number().optional(),
      exchangeRate: z.number().optional(),
      fromTokenUsdPrice: z.number().optional(),
      toTokenUsdPrice: z.number().optional(),
      totalUsdValue: z.number().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const transaction = await db.transaction.create({
      data: {
        ...input,
        walletAddress: input.walletAddress.toLowerCase(),
      },
    });

    return {
      success: true,
      transactionId: transaction.id,
    };
  });
