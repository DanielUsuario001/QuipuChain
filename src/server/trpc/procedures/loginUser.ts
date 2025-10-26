import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "~/server/db";
import { baseProcedure } from "~/server/trpc/main";
import { env } from "~/server/env";

export const loginUser = baseProcedure
  .input(
    z.object({
      email: z.string().email("Invalid email format"),
      pin: z.string().min(4, "PIN must be at least 4 digits"),
    })
  )
  .mutation(async ({ input }) => {
    // Find user
    const user = await db.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or PIN",
      });
    }

    // Verify PIN
    const isValidPin = await bcryptjs.compare(input.pin, user.hashedPin);

    if (!isValidPin) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or PIN",
      });
    }

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
