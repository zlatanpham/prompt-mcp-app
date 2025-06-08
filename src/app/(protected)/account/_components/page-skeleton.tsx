import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountPageSkeleton() {
  return (
    <>
      <Card className="w-full max-w-2xl p-0">
        <CardContent className="flex items-center space-x-4 p-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Skeleton className="h-5 w-16" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <div className="grid gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-10 flex-1" />
        </div>

        <Separator />

        <div className="grid gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>

        <Separator />

        <div className="grid gap-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-80" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>
    </>
  );
}
