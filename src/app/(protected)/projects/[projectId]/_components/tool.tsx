/* eslint-disable @typescript-eslint/no-floating-promises */
"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  HardDriveUpload,
  Pencil as PencilIcon,
  Trash as TrashIcon,
  MoreHorizontal,
  Wand2, // Import Wand2 icon
} from "lucide-react";

import { api } from "@/trpc/react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch"; // Import Switch component
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton component
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Highlight } from "@/components/highlight";
import ManualToolDialog from "./manual-tool-dialog";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";
import { GenerateToolDialog } from "./generate-tool-dialog"; // Import GenerateToolDialog

export default function ToolComponent() {
  const params = useParams();
  const projectId = params.projectId as string | undefined;

  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerateToolDialogOpen, setIsGenerateToolDialogOpen] =
    useState(false); // New state for AI dialog

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
        <div className="flex items-center gap-2">
          {" "}
          {/* Add a div to group buttons */}
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => {
              setSelectedToolId(null);
              setIsDialogOpen(true);
            }}
          >
            New Tool
          </Button>
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => setIsGenerateToolDialogOpen(true)} // Open new dialog
          >
            <Wand2 className="mr-2 h-4 w-4" /> {/* Magic wand icon */}
            Generate Tool
          </Button>
        </div>

        <ManualToolDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          selectedToolId={selectedToolId}
          projectId={projectId!} // Pass projectId
        />

        <GenerateToolDialog
          isOpen={isGenerateToolDialogOpen}
          onOpenChange={setIsGenerateToolDialogOpen}
          projectId={projectId!}
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
        <div className="overflow-hidden rounded-md border">
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(tool.id)}>
                            <PencilIcon className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600"
                            onClick={() => onDelete(tool.id)}
                          >
                            <TrashIcon className="h-4 w-4 text-inherit" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
