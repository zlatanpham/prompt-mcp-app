import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";

export const promptRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        project_id: z.string().uuid(),
        name: z.string().min(1),
        tool_name: z.string().min(1),
        description: z.string().optional(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new Error("Unauthorized");
      }
      // Optionally, verify user has access to the project here

      const prompt = await db.prompt.create({
        data: {
          project_id: input.project_id,
          name: input.name,
          tool_name: input.tool_name,
          description: input.description,
          content: input.content,
        },
      });
      return prompt;
    }),

  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new Error("Unauthorized");
      }
      // Optionally, verify user has access to the prompt/agent here

      const prompt = await db.prompt.findUnique({
        where: { id: input.id },
      });
      return prompt;
    }),

  getByAgentId: protectedProcedure
    .input(
      z.object({
        project_id: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new Error("Unauthorized");
      }
      // Optionally, verify user has access to the agent here

      const prompts = await db.prompt.findMany({
        where: { project_id: input.project_id, deletedAt: null },
        orderBy: { updated_at: "desc" },
      });
      return prompts;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        tool_name: z.string().min(1).optional(),
        description: z.string().optional(),
        content: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new Error("Unauthorized");
      }
      // Optionally, verify user has access to the prompt/agent here

      const dataToUpdate: {
        name?: string;
        description?: string;
        content?: string;
        updated_at: Date;
      } = {
        updated_at: new Date(),
      };
      if (input.name !== undefined) {
        dataToUpdate.name = input.name;
      }
      if (input.description !== undefined) {
        dataToUpdate.description = input.description;
      }
      if (input.content !== undefined) {
        dataToUpdate.content = input.content;
      }

      const prompt = await db.prompt.update({
        where: { id: input.id },
        data: dataToUpdate,
      });
      return prompt;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new Error("Unauthorized");
      }
      // Optionally, verify user has access to the prompt/agent here

      await db.prompt.update({
        where: { id: input.id },
        data: {
          deletedAt: new Date(),
        },
      });
      return { success: true };
    }),
});
