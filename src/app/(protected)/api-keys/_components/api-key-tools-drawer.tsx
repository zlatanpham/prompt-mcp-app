"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Highlight } from "@/components/highlight";

interface ApiKeyToolsDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  apiKeyId: string | null;
}

export function ApiKeyToolsDrawer({
  isOpen,
  onOpenChange,
  apiKeyId,
}: ApiKeyToolsDrawerProps) {
  const {
    data: groupedTools,
    isLoading,
    isError,
    error,
  } = api.apiKey.getToolsByApiKeyId.useQuery(
    { apiKeyId: apiKeyId! },
    { enabled: !!apiKeyId },
  );

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader className="pb-0">
          <SheetTitle>Tools for API Key</SheetTitle>
          <SheetDescription>
            List of tools accessible via this API key, grouped by project.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : isError ? (
            <div className="text-red-500">
              Error loading tools: {error?.message}
            </div>
          ) : groupedTools && groupedTools.length > 0 ? (
            <div className="space-y-6">
              {groupedTools.map((projectGroup) => (
                <div key={projectGroup.projectId}>
                  <h3 className="text-md font-semibold">
                    {projectGroup.projectName} ({projectGroup.tools.length}{" "}
                    tools)
                  </h3>
                  <Separator className="my-2" />
                  {projectGroup.tools.length > 0 ? (
                    <ul className="list-disc space-y-2 pl-4">
                      {projectGroup.tools.map((tool) => (
                        <li key={tool.id}>
                          <p className="font-medium">
                            <Highlight>{tool.name}</Highlight>
                          </p>
                          <p className="text-sm text-gray-500">
                            {tool.description}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No tools in this project.</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No tools found for this API key.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
