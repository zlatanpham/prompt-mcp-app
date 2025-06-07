/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  type DefaultSession,
  type DefaultUser,
  type SessionStrategy,
} from "next-auth"; // Add DefaultUser, SessionStrategy
import { type AdapterUser } from "next-auth/adapters";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { encode, decode, type JWT } from "next-auth/jwt"; // Import JWT
import { type Account, type Profile } from "next-auth";

import { db } from "@/server/db";
import type { PrismaClient, User as PrismaUser } from "@prisma/client"; // Alias User to PrismaUser

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

  interface User extends DefaultUser {
    // Extend DefaultUser
    password?: string | null;
    emailVerified: Date | null; // Explicitly set to Date | null
    email: string | null; // Explicitly set to string | null
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET, // Explicitly set secret
  providers: [
    // GithubProvider,
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
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password, // Now guaranteed to be a string
          user.password,
        );

        if (!isPasswordValid) {
          return null;
        }

        return user;
      },
    }) as any, // Temporarily cast to any to bypass type issues with CredentialsProvider
  ],
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt" as SessionStrategy, // Credentials provider requires JWT strategy
  },
  callbacks: {
    signIn: async ({
      user,
      account,
      profile,
      email,
      credentials,
    }: {
      user: any; // Cast to any to bypass persistent type issues
      account: Account | null;
      profile?: Profile;
      email?: { verificationRequest?: boolean }; // Change this line
      credentials?: Record<string, unknown>;
    }) => {
      // Check if the sign-in is triggered by the Credentials provider
      if (account?.provider === "credentials") {
        console.log("signIn callback: Credentials provider, allowing sign-in.");
        return true; // Allow sign-in
      }
      console.log(
        "signIn callback: Non-credentials provider, allowing sign-in.",
      );
      return true; // Or return false to prevent sign-in
    },
    jwt: async ({ token, user }: { token: JWT; user: any }) => {
      // Explicitly type token and user
      // Add jwt callback
      console.log("testing jwt callback");
      if (user) {
        token.id = user.id; // Add user ID to the token
      }
      return token;
    },
    session: ({
      session,
      token, // Session callback receives token, not user, with JWT strategy
    }: {
      session: DefaultSession;
      token: any; // Cast to any for token
    }) => {
      console.log("testing session callback");
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id, // Get ID from token
        },
      };
    },
  },
  events: {
    async createUser({ user }: { user: any }) {
      // Cast to any
      if (!user.name || !user.id) return;
      if (typeof user.name !== "string") return; // Add this type guard
      // Convert user.name to hyphen case (kebab case)
      const toHyphenCase = (str: string) =>
        str
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

      const organizationName = toHyphenCase(user.name as string); // Explicitly cast here

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
