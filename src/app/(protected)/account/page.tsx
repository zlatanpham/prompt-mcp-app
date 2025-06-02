import { auth } from "@/server/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { EditNameDialog } from "./_components/edit-name-dialog"; // Will create this next

export default async function AccountPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Please log in to view your account details.</p>
      </div>
    );
  }

  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : user.email
      ? user.email[0]?.toUpperCase()
      : "U"; // Default to 'U' for unknown

  return (
    <div className="mx-auto max-w-lg space-y-6 p-8 pb-16">
      <h2 className="text-2xl font-bold tracking-tight">My Account</h2>

      <Card className="w-full max-w-2xl p-0">
        <CardContent className="flex items-center space-x-4 p-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary text-xl text-white">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold">{user.name ?? ""}</p>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="name"
              defaultValue={user.name ?? ""}
              readOnly
              className="flex-1"
            />
            <EditNameDialog currentName={user.name ?? ""} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            defaultValue={user.email ?? ""}
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
          <Button variant="outline" className="w-fit">
            Reset password
          </Button>
        </div>
      </div>
    </div>
  );
}
