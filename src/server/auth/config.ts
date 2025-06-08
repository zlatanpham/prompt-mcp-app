import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  type DefaultSession,
  type Account, // Import Account
  type Profile, // Import Profile
  type User,
  type NextAuthConfig, // Import User from next-auth
} from "next-auth";
import { type AdapterUser } from "next-auth/adapters"; // Import AdapterUser
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { type JWT } from "next-auth/jwt";

import { db } from "@/server/db";
import type { PrismaClient, User as PrismaUser } from "@prisma/client";

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

  interface User {
    // Extend DefaultUser
    password?: string | null | undefined; // Allow undefined
    emailVerified?: Date | null; // Allow undefined
    email?: string | null; // Allow undefined
    name?: string | null; // Allow undefined
  }
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

        if (
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }

        const user: PrismaUser | null = await db.user.findUnique({
          // Use PrismaUser here
          where: { email: credentials.email },
        });

        if (!user?.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password, // Now guaranteed to be a string
          user.password,
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return user;
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt", // Credentials provider requires JWT strategy
  },
  callbacks: {
    jwt: async ({
      token,
      user,
    }: {
      token: JWT;
      user: AdapterUser | User; // Use AdapterUser | User from next-auth
      account: Account | null;
      profile?: Profile;
      trigger?: "signIn" | "signUp" | "update";
    }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: ({ session, token }: { session: DefaultSession; token: JWT }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
        },
      };
    },
  },
  events: {
    async createUser({ user }: { user: User }) {
      if (!user.name || !user.id) return;
      // Convert user.name to hyphen case (kebab case)
      const toHyphenCase = (str: string) =>
        str
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

      const organizationName = toHyphenCase(user.name); // user.name is string | null | undefined, but checked above

      // Ensure email is not null or undefined before using it if needed elsewhere
      // if (!user.email) return;
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
