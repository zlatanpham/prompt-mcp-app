import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession } from "next-auth";
import { type AdapterUser } from "next-auth/adapters";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { db } from "@/server/db";
import type { PrismaClient, User } from "@prisma/client";

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
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user: User | null = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user?.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isPasswordValid) {
          return null;
        }

        return user;
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    session: ({
      session,
      user,
    }: {
      session: DefaultSession;
      user: AdapterUser;
    }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  events: {
    async createUser({ user }: { user: AdapterUser }) {
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
};
