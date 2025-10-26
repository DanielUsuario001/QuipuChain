import { z } from "zod";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getTransactionHistory = baseProcedure
  .input(
    z.object({
      walletAddress: z.string(),
      network: z.enum(['scroll', 'scroll-sepolia', 'starknet', 'starknet-sepolia']),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.number().optional(), // transaction ID for cursor-based pagination
    })
  )
  .query(async ({ input }) => {
    const { walletAddress, network, limit, cursor } = input;

    const transactions = await db.transaction.findMany({
      where: {
        walletAddress: walletAddress.toLowerCase(),
        network,
      },
      take: limit + 1, // fetch one extra to determine if there are more results
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0, // skip the cursor item itself
      orderBy: {
        createdAt: 'desc',
      },
    });

    let nextCursor: number | undefined = undefined;
    if (transactions.length > limit) {
      const nextItem = transactions.pop(); // remove the extra item
      nextCursor = nextItem!.id;
    }

    return {
      transactions,
      nextCursor,
    };
  });
