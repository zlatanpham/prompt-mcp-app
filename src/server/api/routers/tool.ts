import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { toolNameSchema } from "@/lib/validators/tool";
import { argumentSchema, type Argument } from "@/types/tool";

const toolBaseSchema = z.object({
  name: toolNameSchema,
  description: z.string().optional(),
  prompt: z.string().min(1),
  args: z.array(argumentSchema).optional(),
});

const toolCreateSchema = toolBaseSchema
  .extend({
    project_id: z.string().uuid(),
  })
  .refine(
    (data) => {
      if (data.args && data.args.length > 0) {
        for (const arg of data.args) {
          const placeholder = `{${arg.name}}`;
          if (!data.prompt.includes(placeholder)) {
            return false; // Validation fails
          }
        }
      }
      return true; // Validation passes
    },
    {
      message:
        "Prompt must contain placeholders for all arguments in the format {argumentName}.",
      path: ["prompt"], // Attach error to the prompt field
    },
  );

const toolUpdateSchema = toolBaseSchema
  .partial()
  .extend({
    id: z.string().uuid(),
  })
  .refine(
    (data) => {
      if (data.prompt === undefined) return true; // Allow updates without prompt field
      if (data.args && data.args.length > 0) {
        for (const arg of data.args) {
          const placeholder = `{${arg.name}}`;
          if (!data.prompt.includes(placeholder)) {
            return false; // Validation fails
          }
        }
      }
      return true; // Validation passes
    },
    {
      message:
        "Prompt must contain placeholders for all arguments in the format {argumentName}.",
      path: ["prompt"], // Attach error to the prompt field
    },
  );

export const toolRouter = createTRPCRouter({
  create: protectedProcedure
    .input(toolCreateSchema)
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
          prompt: input.prompt,
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

  getByProjectId: protectedProcedure
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
    .input(toolUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new Error("Unauthorized");
      }
      // Optionally, verify user has access to the tool/agent here

      const dataToUpdate: {
        name?: string;
        description?: string;
        prompt?: string;
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
      if (input.prompt !== undefined) {
        dataToUpdate.prompt = input.prompt;
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
