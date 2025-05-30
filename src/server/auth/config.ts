import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GithubProvider from "next-auth/providers/github";

import { db } from "@/server/db";
import type { PrismaClient } from "@prisma/client";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    GithubProvider,
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Github provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  events: {
    async createUser({ user }) {
      if (!user.name || !user.id) return;
      // Convert user.name to hyphen case (kebab case)
      const toHyphenCase = (str: string) =>
        str
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

      const organizationName = toHyphenCase(user.name);

      try {
        // Create organization and organizationMember
        const prisma = db as PrismaClient;
        await prisma.organization.create({
          data: {
            name: organizationName,
            owner_user_id: user.id,
            OrganizationMember: {
              create: {
                user_id: user.id,
                role: "owner",
              },
            },
          },
        });
      } catch (error) {
        console.error("Error creating organization:", error);
      }
    },
  },
} satisfies NextAuthConfig;
