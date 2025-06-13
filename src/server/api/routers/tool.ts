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

const toolImportInputSchema = z.object({
  project_id: z.string().uuid(),
  tools: z.array(toolBaseSchema),
});

const toolMoveSchema = z.object({
  toolIds: z.array(z.string().uuid()),
  targetProjectId: z.string().uuid(),
});

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

  importTools: protectedProcedure
    .input(toolImportInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new Error("Unauthorized");
      }

      // 1. Check for duplicate names within the incoming batch
      const incomingToolNames = input.tools.map((tool) => tool.name);
      const uniqueIncomingToolNames = new Set(incomingToolNames);
      if (uniqueIncomingToolNames.size !== incomingToolNames.length) {
        const duplicates = incomingToolNames.filter(
          (name, index) => incomingToolNames.indexOf(name) !== index,
        );
        throw new Error(
          `Duplicate tool names found in the import batch: ${[
            ...new Set(duplicates),
          ].join(", ")}.`,
        );
      }

      // 2. Check for existing tool names in the database for this project
      const existingTools = await db.tool.findMany({
        where: {
          project_id: input.project_id,
          name: {
            in: incomingToolNames,
          },
        },
        select: {
          name: true,
        },
      });

      if (existingTools.length > 0) {
        const existingNames = existingTools.map((tool) => tool.name);
        throw new Error(
          `Tools with these names already exist in this project: ${existingNames.join(
            ", ",
          )}.`,
        );
      }

      // 3. Create tools in a transaction
      const createdTools = await db.$transaction(
        input.tools.map((tool) =>
          db.tool.create({
            data: {
              project_id: input.project_id,
              name: tool.name,
              description: tool.description,
              prompt: tool.prompt,
              args: tool.args,
            },
          }),
        ),
      );

      return createdTools;
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
        where: { project_id: input.project_id },
        orderBy: { created_at: "desc" },
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

      await db.tool.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),

  toggleActive: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        is_active: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new Error("Unauthorized");
      }

      const tool = await db.tool.update({
        where: { id: input.id },
        data: {
          is_active: input.is_active,
          updated_at: new Date(),
        },
      });
      return tool;
    }),

  getAllByUserId: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user?.id;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const projects = await db.project.findMany({
      where: { created_by_user_id: userId },
      select: { id: true },
    });

    const projectIds = projects.map((p) => p.id);

    const tools = await db.tool.findMany({
      where: {
        project_id: {
          in: projectIds,
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Explicitly cast args to Argument[]
    const parsedTools = tools.map((tool) => ({
      ...tool,
      args: (tool.args ?? []) as Argument[],
    }));

    return parsedTools;
  }),

  moveTools: protectedProcedure
    .input(toolMoveSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new Error("Unauthorized");
      }

      // Verify user has access to the target project
      const targetProject = await db.project.findUnique({
        where: { id: input.targetProjectId },
        select: { created_by_user_id: true },
      });

      if (!targetProject || targetProject.created_by_user_id !== userId) {
        throw new Error(
          "Unauthorized: Target project not found or not owned by user.",
        );
      }

      // Verify user has access to all tools and they belong to the same original project
      // This is important to prevent moving tools from projects the user doesn't own
      const toolsToMove = await db.tool.findMany({
        where: {
          id: { in: input.toolIds },
        },
        select: { id: true, project_id: true },
      });

      if (toolsToMove.length !== input.toolIds.length) {
        throw new Error("One or more tools not found.");
      }

      // Ensure all tools belong to projects owned by the user
      const projectIdsOfTools = new Set(toolsToMove.map((t) => t.project_id));
      const projectsOwnedByUser = await db.project.findMany({
        where: {
          id: { in: Array.from(projectIdsOfTools) },
          created_by_user_id: userId,
        },
        select: { id: true },
      });

      if (projectsOwnedByUser.length !== projectIdsOfTools.size) {
        throw new Error(
          "Unauthorized: One or more tools belong to projects not owned by the user.",
        );
      }

      // Perform the update in a transaction
      await db.$transaction(
        input.toolIds.map((toolId) =>
          db.tool.update({
            where: { id: toolId },
            data: { project_id: input.targetProjectId },
          }),
        ),
      );

      return { success: true, movedCount: input.toolIds.length };
    }),
});
