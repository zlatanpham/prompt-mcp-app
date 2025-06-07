import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { SessionProvider } from "next-auth/react";

import { HydrateClient } from "@/trpc/server";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Prompt MCP",
  description: "Use prompts as MCP tools",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <SessionProvider>
          <TRPCReactProvider>
            <HydrateClient>{children}</HydrateClient>
          </TRPCReactProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
