import { createTRPCRouter, protectedProcedure } from "../trpc";

export const organizationRouter = createTRPCRouter({
  getOwnedOrganization: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user?.id;
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const organization = await ctx.db.organization.findFirst({
      where: {
        owner_user_id: userId,
      },
      select: {
        id: true,
        name: true,
      },
    });
    return organization;
  }),
});
