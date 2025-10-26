import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  BASE_URL: z.string().optional(),
  BASE_URL_OTHER_PORT: z.string().optional(),
  ADMIN_PASSWORD: z.string(),
  JWT_SECRET: z.string(),
  
  // Scroll RPC endpoints
  SCROLL_RPC_URL: z.string().optional().default("https://rpc.scroll.io"),
  SCROLL_SEPOLIA_RPC_URL: z.string().optional().default("https://sepolia-rpc.scroll.io"),
  
  // Starknet RPC endpoints
  STARKNET_RPC_URL: z.string().optional().default("https://starknet-mainnet.public.blastapi.io"),
  STARKNET_SEPOLIA_RPC_URL: z.string().optional().default("https://starknet-sepolia.public.blastapi.io"),
  
  // DEX Aggregator API keys (optional for public endpoints)
  ONEINCH_API_KEY: z.string().optional(),
  AVNU_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
