import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { generateApiKey } from "@/lib/encryption";

export const apiKeyRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        projectIds: z.array(z.string().uuid()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, projectIds } = input;
      const userId = ctx.session.user.id;
      const apiKey = generateApiKey(); // Generate a new API key

      const newApiKey = await ctx.db.apiKey.create({
        data: {
          name,
          key: apiKey,
          userId,
          projects: {
            create: projectIds?.map((projectId) => ({
              projectId,
            })),
          },
        },
      });

      return newApiKey;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.apiKey.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        projects: {
          include: {
            project: true,
          },
        },
      },
    });
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const apiKey = await ctx.db.apiKey.findUnique({
        where: { id: input.id },
      });

      if (!apiKey || apiKey.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.db.apiKey.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  regenerate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existingApiKey = await ctx.db.apiKey.findUnique({
        where: { id: input.id },
      });

      if (!existingApiKey || existingApiKey.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const newKey = generateApiKey();

      const updatedApiKey = await ctx.db.apiKey.update({
        where: { id: input.id },
        data: { key: newKey },
      });

      return updatedApiKey;
    }),

  updateProjects: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        projectIds: z.array(z.string().uuid()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, projectIds } = input;
      const userId = ctx.session.user.id;

      const apiKey = await ctx.db.apiKey.findUnique({
        where: { id },
      });

      if (!apiKey || apiKey.userId !== userId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Disconnect all existing projects
      await ctx.db.apiKeyOnProject.deleteMany({
        where: { apiKeyId: id },
      });

      // Connect new projects
      await ctx.db.apiKeyOnProject.createMany({
        data: projectIds.map((projectId) => ({
          apiKeyId: id,
          projectId,
        })),
      });

      return { success: true };
    }),
});
