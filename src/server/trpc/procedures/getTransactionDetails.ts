import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";

export const getTransactionDetails = baseProcedure
  .input(
    z.object({
      hash: z.string(),
    })
  )
  .query(async ({ input }) => {
    const transaction = await db.transaction.findUnique({
      where: {
        hash: input.hash,
      },
    });

    if (!transaction) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Transaction not found",
      });
    }

    return transaction;
  });
