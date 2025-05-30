import "@/styles/globals.css";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { HydrateClient } from "@/trpc/server";
import { OrganizationProvider } from "./_context/organization";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <OrganizationProvider>
        <HydrateClient>
          <AppSidebar />
          <SidebarInset>{children}</SidebarInset>
        </HydrateClient>
      </OrganizationProvider>
    </SidebarProvider>
  );
}
