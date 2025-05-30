import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";

export const projectRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    const projects = await db.project.findMany({
      orderBy: {
        updated_at: "desc",
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
});
