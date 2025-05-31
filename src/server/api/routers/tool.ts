import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { toolNameSchema } from "@/lib/validators/tool";
import { argumentSchema, type Argument } from "@/types/tool";

export const toolRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        project_id: z.string().uuid(),
        name: toolNameSchema,
        description: z.string().optional(),
        content: z.string().min(1),
        args: z.array(argumentSchema).optional(), // Changed to array of argumentSchema
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new Error("Unauthorized");
      }
      // Optionally, verify user has access to the project here

      const tool = await db.tool.create({
        data: {
          project_id: input.project_id,
          name: input.name,
          description: input.description,
          content: input.content,
          args: input.args,
        },
      });
      return tool;
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
      // Optionally, verify user has access to the tool/agent here

      const tool = await db.tool.findUnique({
        where: { id: input.id },
      });
      return tool;
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

      const tools = await db.tool.findMany({
        where: { project_id: input.project_id, deletedAt: null },
        orderBy: { updated_at: "desc" },
      });
      return tools;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: toolNameSchema.optional(),
        description: z.string().optional(),
        content: z.string().min(1).optional(),
        args: z.array(argumentSchema).optional(), // Changed to array of argumentSchema
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new Error("Unauthorized");
      }
      // Optionally, verify user has access to the tool/agent here

      const dataToUpdate: {
        name?: string;
        description?: string;
        content?: string;
        args?: Argument[]; // Use Argument[] for Json type
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
      if (input.args !== undefined) {
        dataToUpdate.args = input.args;
      }

      const tool = await db.tool.update({
        where: { id: input.id },
        data: dataToUpdate,
      });
      return tool;
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
      // Optionally, verify user has access to the tool/agent here

      await db.tool.update({
        where: { id: input.id },
        data: {
          deletedAt: new Date(),
        },
      });
      return { success: true };
    }),
});
