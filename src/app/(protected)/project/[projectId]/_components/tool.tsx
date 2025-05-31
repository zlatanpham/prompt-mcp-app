/* eslint-disable @typescript-eslint/no-floating-promises */
"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  HardDriveUpload,
  Plus as PlusIcon,
  Info as InfoIcon,
} from "lucide-react";

import { api } from "@/trpc/react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Tool } from "@prisma/client";

import ManualToolDialog, {
  type ManualToolFormValues,
} from "./manual-tool-dialog";
import ToolCard from "./tool-card";

export default function ToolComponent() {
  const params = useParams();
  const projectId = params.projectId as string | undefined;

  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch tools for the agent
  const {
    data: tools,
    refetch,
    isLoading: isLoadingTools,
  } = api.tool.getByAgentId.useQuery(
    { project_id: projectId! },
    { enabled: !!projectId },
  );

  const isLoading = isLoadingTools;

  // Fetch single tool for editing
  const { data: tool } = api.tool.getById.useQuery(
    { id: selectedToolId ?? "" },
    { enabled: !!selectedToolId },
  );

  // Mutations
  const createTool = api.tool.create.useMutation({
    onSuccess: () => {
      console.log("Tool created");
      refetch();
      setIsDialogOpen(false);
    },
  });

  const updateTool = api.tool.update.useMutation({
    onSuccess: () => {
      refetch();
      setIsDialogOpen(false);
      setSelectedToolId(null);
    },
  });

  const deleteTool = api.tool.delete.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedToolId(null);
    },
  });

  // Handlers
  const onSubmit = async (data: ManualToolFormValues) => {
    if (selectedToolId) {
      updateTool.mutate({
        id: selectedToolId,
        name: data.name,
        description: data.description,
        content: data.content,
      });
    } else {
      createTool.mutate({
        project_id: projectId!,
        name: data.name,
        description: data.description,
        content: data.content,
      });
    }
  };

  const onEdit = (id: string) => {
    setSelectedToolId(id);
    setIsDialogOpen(true);
  };

  const onDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this tool?")) {
      deleteTool.mutate({ id: id });
    }
  };

  return (
    <div className="rounded-lg border bg-gray-50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="flex items-center gap-1 text-lg font-semibold">
          Project tools{" "}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Project tools provide context for the AI writer
                  <br /> or to generate tools
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="h-8 w-8" disabled={isLoading}>
              <PlusIcon className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              onSelect={() => {
                setSelectedToolId(null);
                setIsDialogOpen(true);
              }}
            >
              Manual input
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ManualToolDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={onSubmit}
          selectedToolId={selectedToolId}
          tool={tool ?? null ?? undefined}
          isSubmitting={createTool.isPending || updateTool.isPending}
        />
      </div>

      {tools && tools.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onEdit={() => onEdit(tool.id as string)}
              onDelete={() => onDelete(tool.id as string)}
            />
          ))}
        </div>
      ) : (
        <div className="flex w-full flex-col items-center justify-center space-y-2 py-5">
          <HardDriveUpload className="text-muted-foreground" />
          <p className="text-muted-foreground text-sm">No tools found.</p>
        </div>
      )}
    </div>
  );
}
