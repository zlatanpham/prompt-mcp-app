/* eslint-disable @typescript-eslint/no-floating-promises */
"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  HardDriveUpload,
  Pencil as PencilIcon,
  Trash as TrashIcon,
} from "lucide-react";

import { api } from "@/trpc/react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"; // Import Switch component
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton component
import type { Argument } from "@/types/tool";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Highlight } from "@/components/highlight";
import ManualToolDialog, {
  type ManualToolFormValues,
} from "./manual-tool-dialog";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";

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
  } = api.tool.getByProjectId.useQuery(
    { project_id: projectId! },
    { enabled: !!projectId },
  );

  const isLoading = isLoadingTools;
  console.log("ToolComponent isLoading:", isLoading, "tools:", tools);

  // Fetch single tool for editing
  const { data: tool, isLoading: isLoadingSelectedTool } =
    api.tool.getById.useQuery(
      // Destructure isLoadingSelectedTool
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

  const toggleToolActive = api.tool.toggleActive.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Handlers
  const onSubmit = async (data: ManualToolFormValues) => {
    if (selectedToolId) {
      updateTool.mutate({
        id: selectedToolId,
        name: data.name,
        description: data.description,
        prompt: data.prompt,
        args: data.arguments, // Pass arguments to the mutation
      });
    } else {
      createTool.mutate({
        project_id: projectId!,
        name: data.name,
        description: data.description,
        prompt: data.prompt,
        args: data.arguments, // Pass arguments to the mutation
      });
    }
  };

  const onEdit = (id: string) => {
    setSelectedToolId(id);
    setIsDialogOpen(true);
  };

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [toolToDelete, setToolToDelete] = useState<string | null>(null);

  const onDelete = (id: string) => {
    setToolToDelete(id);
    setIsConfirmDialogOpen(true);
  };

  const confirmDelete = () => {
    if (toolToDelete) {
      deleteTool.mutate({ id: toolToDelete });
      setToolToDelete(null);
      setIsConfirmDialogOpen(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-md font-medium">Tools</h4>
        <Button
          variant="default"
          disabled={isLoading}
          onClick={() => {
            setSelectedToolId(null);
            setIsDialogOpen(true);
          }}
        >
          New Tool
        </Button>

        <ManualToolDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={onSubmit}
          selectedToolId={selectedToolId}
          tool={
            tool
              ? {
                  ...tool,
                  args: (tool.args as Argument[]) ?? null, // Ensure args is typed correctly
                }
              : null
          }
          isSubmitting={createTool.isPending || updateTool.isPending}
          isLoading={isLoadingSelectedTool} // Pass isLoadingSelectedTool
        />

        <ConfirmActionDialog
          isOpen={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
          onConfirm={confirmDelete}
          title="Are you absolutely sure?"
          description="This action cannot be undone. This will permanently delete your tool."
          confirmText="Continue"
          cancelText="Cancel"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tools && tools.length > 0 ? (
                tools.map((tool) => (
                  <TableRow key={tool.id}>
                    <TableCell className="font-medium">
                      <Highlight>{tool.name}</Highlight>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[500px] truncate">
                        {tool.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={tool.is_active}
                        onCheckedChange={(checked) =>
                          toggleToolActive.mutate({
                            id: tool.id,
                            is_active: checked,
                          })
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(tool.id)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(tool.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="flex w-full flex-col items-center justify-center space-y-2 py-5">
                      <HardDriveUpload className="text-muted-foreground" />
                      <p className="text-muted-foreground text-sm">
                        No tools found.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
