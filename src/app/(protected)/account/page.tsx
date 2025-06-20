"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EditNameDialog } from "./_components/edit-name-dialog";
import { ResetPasswordDialog } from "./_components/reset-password-dialog";
import { useConfirmAction } from "@/components/confirm-action-dialog";
import { api } from "@/trpc/react";
import AccountPageSkeleton from "./_components/page-skeleton";

export default function AccountPage() {
  const router = useRouter();
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = api.user.getUser.useQuery();

  const { confirm, ConfirmActionDialog } = useConfirmAction();
  const { isLoading: isLoadingTools, refetch: refetchTools } =
    api.tool.getAllByUserId.useQuery(undefined, { enabled: false });

  if (!isLoading && (isError || !user)) {
    router.push("/login");
    return null; // Or a loading spinner/message
  }

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .filter(Boolean) // Get first two words
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : user?.email
      ? user.email[0]?.toUpperCase()
      : "U"; // Default to 'U' for unknown

  const handleExportAllTools = async () => {
    // Trigger data fetch when export button is clicked
    const { data: fetchedTools } = await refetchTools();

    if (isLoadingTools) return; // This check might be redundant if refetchTools() awaits completion

    const numTools = fetchedTools?.length ?? 0;
    const confirmed = await confirm(
      "Export All Tools",
      `Are you sure you want to export ${numTools} tools?`,
      "Export",
      "Cancel",
    );

    if (confirmed) {
      if (!fetchedTools || fetchedTools.length === 0) {
        alert("No tools available to export.");
        return;
      }

      const toolsToExport = fetchedTools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        prompt: tool.prompt,
        args: tool.args ?? [],
      }));

      const jsonString = JSON.stringify(toolsToExport, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `exported_all_tools.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 p-8 pb-16">
      <h2 className="text-xl font-medium tracking-tight">My Account</h2>

      {isLoading ? (
        <AccountPageSkeleton />
      ) : (
        <>
          <Card className="w-full max-w-2xl p-0">
            <CardContent className="flex items-center space-x-4 p-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-primary text-xl text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-medium">{user?.name ?? ""}</p>
                <p className="text-muted-foreground text-sm">{user?.email}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="name"
                  value={user?.name ?? ""}
                  readOnly
                  className="flex-1"
                />
                <EditNameDialog
                  currentName={user?.name ?? ""}
                  onSuccess={async () => {
                    await refetch();
                  }}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                defaultValue={user?.email ?? ""}
                readOnly
                className="flex-1"
              />
            </div>

            <Separator />

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <p className="text-muted-foreground text-sm">
                You can set a permanent password if you {"don't"} want to use
                temporary login codes
              </p>
              <ResetPasswordDialog
                onSuccess={async () => {
                  await refetch();
                }}
              />
            </div>

            <Separator />

            <div className="grid gap-2">
              <Label htmlFor="export-tools">Export All Tools</Label>
              <p className="text-muted-foreground text-sm">
                Export all your tools from all projects in JSON format.
              </p>
              <Button
                variant="outline"
                className="w-fit"
                onClick={handleExportAllTools}
                disabled={isLoadingTools}
              >
                {isLoadingTools ? "Exporting Tools..." : "Export All Tools"}
              </Button>
            </div>
          </div>
        </>
      )}
      {ConfirmActionDialog}
    </div>
  );
}
