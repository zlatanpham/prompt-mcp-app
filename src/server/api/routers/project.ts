import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";

export const projectRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    const projects = await db.project.findMany({
      orderBy: {
        created_at: "desc",
      },
      include: {
        _count: {
          select: {
            Tool: true,
          },
        },
      },
    });
    return projects;
  }),

  updateById: publicProcedure
    .input(
      z.object({
        project_id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new Error("Unauthorized");
      }

      const { project_id, name, description } = input;

      const updatedAgent = await db.project.update({
        where: { id: project_id },
        data: {
          ...(name !== undefined ? { name } : {}),
          ...(description !== undefined ? { description } : {}),
          updated_at: new Date(),
        },
      });

      return updatedAgent;
    }),

  getById: publicProcedure
    .input(
      z.object({
        project_id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const agent = await db.project.findUnique({
        where: {
          id: input.project_id,
        },
      });
      return agent;
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        organization_id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Assuming user and organization context is available in ctx
      const userId = ctx.session?.user?.id;
      const organizationId = input.organization_id;
      // organizationId is not directly on user, so remove usage or get from elsewhere
      // For now, throw error if no userId
      if (!userId) {
        throw new Error("Unauthorized");
      }

      if (!organizationId) {
        throw new Error("Organization ID is required");
      }

      const agent = await db.project.create({
        data: {
          name: input.name,
          description: input.description,
          created_by_user_id: userId,
          organization_id: organizationId,
        },
      });
      return agent;
    }),

  delete: publicProcedure
    .input(
      z.object({
        project_id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new Error("Unauthorized");
      }

      const { project_id } = input;

      // Optional: Add authorization check here to ensure only the project owner or an admin can delete
      // Optional: Add authorization check here to ensure only the project owner or an admin can delete
      // For example:
      // const project = await db.project.findUnique({ where: { id: project_id } });
      // if (project?.created_by_user_id !== userId) {
      //   throw new Error("Not authorized to delete this project");
      // }

      // Prisma is configured for cascade delete:
      // - Associated Tools will be automatically deleted due to `onDelete: Cascade` in Tool model.
      // - Associations in ApiKeyOnProject will be automatically removed due to `onDelete: Cascade` in ApiKeyOnProject model.
      await db.project.delete({
        where: { id: project_id },
      });

      return { success: true, project_id };
    }),
});
