import {
  createCallerFactory,
  createTRPCRouter,
  baseProcedure,
} from "~/server/trpc/main";
import { getTransactionHistory } from "~/server/trpc/procedures/getTransactionHistory";
import { getTransactionDetails } from "~/server/trpc/procedures/getTransactionDetails";
import { getPortfolioPerformance } from "~/server/trpc/procedures/getPortfolioPerformance";
import { createTransaction } from "~/server/trpc/procedures/createTransaction";
import { registerUser } from "~/server/trpc/procedures/registerUser";
import { loginUser } from "~/server/trpc/procedures/loginUser";
import { verifyPinAndSend } from "~/server/trpc/procedures/verifyPinAndSend";
import { getUserPortfolio } from "~/server/trpc/procedures/getUserPortfolio";

export const appRouter = createTRPCRouter({
  getTransactionHistory,
  getTransactionDetails,
  getPortfolioPerformance,
  createTransaction,
  registerUser,
  loginUser,
  verifyPinAndSend,
  getUserPortfolio,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
