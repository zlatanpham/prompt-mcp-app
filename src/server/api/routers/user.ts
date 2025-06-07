import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import bcrypt from "bcryptjs";

export const userRouter = createTRPCRouter({
  updateName: protectedProcedure
    .input(z.object({ name: z.string().min(2) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return ctx.db.user.update({
        where: { id: userId },
        data: { name: input.name },
      });
    }),

  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters long"),
        email: z.string().email("Invalid email address"),
        password: z
          .string()
          .min(8, "Password must be at least 8 characters long"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, email, password } = input;

      const existingUser = await ctx.db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error("User with this email already exists.");
      }

      const hashedPassword = await bcrypt.hash(password, 10); // Hash with salt rounds = 10

      const newUser = await ctx.db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // The createUser event in authConfig will handle organization creation

      return newUser;
    }),
});
