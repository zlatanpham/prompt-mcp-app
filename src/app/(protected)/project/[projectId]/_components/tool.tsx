/* eslint-disable @typescript-eslint/no-floating-promises */
"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  HardDriveUpload,
  Info as InfoIcon,
  Pencil as PencilIcon,
  Trash as TrashIcon,
} from "lucide-react";

import { api } from "@/trpc/react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch"; // Import Switch component
import type { Argument } from "@/types/tool";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import ManualToolDialog, {
  type ManualToolFormValues,
} from "./manual-tool-dialog";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
        <Button
          variant="default"
          disabled={isLoading}
          onClick={() => {
            setSelectedToolId(null);
            setIsDialogOpen(true);
          }}
        >
          Create tool
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
        />

        <AlertDialog
          open={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                tool.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {tools && tools.length > 0 ? (
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
            {tools.map((tool) => (
              <TableRow key={tool.id}>
                <TableCell className="font-medium">{tool.name}</TableCell>
                <TableCell>{tool.description}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex w-full flex-col items-center justify-center space-y-2 py-5">
          <HardDriveUpload className="text-muted-foreground" />
          <p className="text-muted-foreground text-sm">No tools found.</p>
        </div>
      )}
    </div>
  );
}
