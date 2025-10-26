import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const registerUser = baseProcedure
  .input(
    z.object({
      email: z.string().email("Invalid email format"),
      pin: z.string().min(4, "PIN must be at least 4 digits").max(6, "PIN must be at most 6 digits"),
    })
  )
  .mutation(async ({ input }) => {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Email already registered",
      });
    }

    // Hash the PIN
    const hashedPin = await bcryptjs.hash(input.pin, 10);

    // Create user
    const user = await db.user.create({
      data: {
        email: input.email.toLowerCase(),
        hashedPin,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      env.JWT_SECRET,
      { expiresIn: "1y" }
    );

    return {
      success: true,
      token,
      userId: user.id,
      email: user.email,
    };
  });
