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
import type { Prompt } from "@prisma/client";

import ManualPromptDialog, {
  type ManualPromptFormValues,
} from "./manual-prompt-dialog";
import PromptCard from "./prompt-card";

export default function Prompt() {
  const params = useParams();
  const projectId = params.projectId as string | undefined;

  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch prompts for the agent
  const {
    data: prompts,
    refetch,
    isLoading: isLoadingPrompts,
  } = api.prompt.getByAgentId.useQuery(
    { project_id: projectId! },
    { enabled: !!projectId },
  );

  const isLoading = isLoadingPrompts;

  // Fetch single prompt for editing
  const { data: prompt } = api.prompt.getById.useQuery(
    { id: selectedPromptId ?? "" },
    { enabled: !!selectedPromptId },
  );

  // Mutations
  const createPrompt = api.prompt.create.useMutation({
    onSuccess: () => {
      console.log("Prompt created");
      refetch();
      setIsDialogOpen(false);
    },
  });

  const updatePrompt = api.prompt.update.useMutation({
    onSuccess: () => {
      refetch();
      setIsDialogOpen(false);
      setSelectedPromptId(null);
    },
  });

  const deletePrompt = api.prompt.delete.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedPromptId(null);
    },
  });

  // Handlers
  const onSubmit = async (data: ManualPromptFormValues) => {
    if (selectedPromptId) {
      updatePrompt.mutate({
        id: selectedPromptId,
        tool_name: data.tool_name,
        name: data.name,
        description: data.description,
        content: data.content,
      });
    } else {
      createPrompt.mutate({
        project_id: projectId!,
        name: data.name,
        tool_name: data.tool_name,
        description: data.description,
        content: data.content,
      });
    }
  };

  const onEdit = (id: string) => {
    setSelectedPromptId(id);
    setIsDialogOpen(true);
  };

  const onDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this prompt?")) {
      deletePrompt.mutate({ id: id });
    }
  };

  return (
    <div className="rounded-lg border bg-gray-50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="flex items-center gap-1 text-lg font-semibold">
          Project prompts{" "}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Project prompts provide context for the AI writer
                  <br /> or to generate prompts
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
                setSelectedPromptId(null);
                setIsDialogOpen(true);
              }}
            >
              Manual input
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ManualPromptDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={onSubmit}
          selectedPromptId={selectedPromptId}
          prompt={prompt ?? null ?? undefined}
          isSubmitting={createPrompt.isPending || updatePrompt.isPending}
        />
      </div>

      {prompts && prompts.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onEdit={() => onEdit(prompt.id)}
              onDelete={() => onDelete(prompt.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex w-full flex-col items-center justify-center space-y-2 py-5">
          <HardDriveUpload className="text-muted-foreground" />
          <p className="text-muted-foreground text-sm">No prompts found.</p>
        </div>
      )}
    </div>
  );
}
