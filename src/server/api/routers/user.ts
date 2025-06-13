import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";
import { env } from "@/env.js";

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

      const toHyphenCase = (str: string) =>
        str
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

      const organizationName = toHyphenCase(newUser.name!); // Use ! assertion
      await ctx.db.organization.create({
        data: {
          name: organizationName,
          owner_user_id: newUser.id,
          OrganizationMember: {
            create: {
              user_id: newUser.id,
              role: "owner",
            },
          },
        },
      });

      return newUser;
    }),

  getUser: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return ctx.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
      },
    });
  }),

  resetPassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z
          .string()
          .min(8, "New password must be at least 8 characters long"),
        confirmPassword: z.string().min(1, "Confirm password is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { currentPassword, newPassword } = input;

      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });

      if (!user?.password) {
        throw new Error("User not found or password not set.");
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        throw new Error("Invalid current password.");
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await ctx.db.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return { success: true };
    }),

  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email("Invalid email address") }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      // Always return success for security reasons, even if user not found
      if (!user) {
        return { success: true };
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour from now

      await ctx.db.user.update({
        where: { id: user.id },
        data: {
          reset_password_token: resetToken,
          reset_password_expires: resetPasswordExpires,
        },
      });

      const resetLink = `${env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

      await sendPasswordResetEmail(user.email!, resetToken, resetLink);

      return { success: true };
    }),

  confirmPasswordReset: publicProcedure
    .input(
      z.object({
        token: z.string(),
        newPassword: z
          .string()
          .min(8, "New password must be at least 8 characters long"),
        confirmPassword: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { token, newPassword, confirmPassword } = input;

      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const user = await ctx.db.user.findFirst({
        where: {
          reset_password_token: token,
          reset_password_expires: {
            gt: new Date(), // Token must not be expired
          },
        },
      });

      if (!user) {
        throw new Error("Invalid or expired password reset token.");
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await ctx.db.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          reset_password_token: null,
          reset_password_expires: null,
        },
      });

      return { success: true };
    }),
});
