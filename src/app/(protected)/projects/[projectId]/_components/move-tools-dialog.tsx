"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { api } from "@/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area"; // Assuming ScrollArea is available or will be added

const formSchema = z.object({
  toolIds: z
    .array(z.string().uuid())
    .min(1, "Please select at least one tool."),
  targetProjectId: z
    .string()
    .uuid({ message: "Please select a target project." }),
});

type MoveToolsFormValues = z.infer<typeof formSchema>;

interface MoveToolsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentProjectId: string;
}

export function MoveToolsDialog({
  isOpen,
  onOpenChange,
  currentProjectId,
}: MoveToolsDialogProps) {
  const form = useForm<MoveToolsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      toolIds: [],
      targetProjectId: "",
    },
  });

  const queryClient = useQueryClient();

  const { data: tools, isLoading: isLoadingTools } =
    api.tool.getByProjectId.useQuery(
      { project_id: currentProjectId },
      { enabled: !!currentProjectId },
    );

  const { data: projects, isLoading: isLoadingProjects } =
    api.project.getAll.useQuery();

  const moveToolsMutation = api.tool.moveTools.useMutation({
    onSuccess: async (data) => {
      toast.success(`Successfully moved ${data.movedCount} tool(s).`);
      onOpenChange(false);
      form.reset(); // Reset form after successful submission
      // Invalidate queries to refetch tools for both projects
      void queryClient.invalidateQueries({
        queryKey: ["tool", "getByProjectId", { project_id: currentProjectId }],
      });
      void queryClient.invalidateQueries({
        queryKey: [
          "tool",
          "getByProjectId",
          { project_id: form.getValues("targetProjectId") },
        ],
      });
    },
    onError: (error) => {
      toast.error("Failed to move tools.", {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: MoveToolsFormValues) => {
    moveToolsMutation.mutate(values);
  };

  const availableProjects = projects?.filter((p) => p.id !== currentProjectId);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>Move Tools</DialogTitle>
          <DialogDescription>
            Select tools to move and choose a target project.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4">
              {/* Tool Selection */}
              <div>
                <FormLabel>Select Tools</FormLabel>
                {isLoadingTools ? (
                  <p>Loading tools...</p>
                ) : tools && tools.length > 0 ? (
                  <ScrollArea className="mt-2 h-[150px] rounded-md border">
                    <div className="space-y-2 p-4">
                      {tools.map((tool) => (
                        <FormField
                          key={tool.id}
                          control={form.control}
                          name="toolIds"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={tool.id}
                                className="flex flex-row items-center space-y-0 space-x-3"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(tool.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            tool.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== tool.id,
                                            ),
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="w-5/6 max-w-[400px] font-mono text-sm font-normal">
                                  <span className="truncate">{tool.name}</span>
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No tools available in this project to move.
                  </p>
                )}
                <FormMessage />
              </div>

              {/* Project Selection */}
              <div>
                <FormField
                  control={form.control}
                  name="targetProjectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Project</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={
                          isLoadingProjects ||
                          !availableProjects ||
                          availableProjects.length === 0
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableProjects?.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                size="lg"
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={moveToolsMutation.status === "pending"}
              >
                Cancel
              </Button>
              <Button
                size="lg"
                type="submit"
                disabled={
                  moveToolsMutation.status === "pending" ||
                  isLoadingTools ||
                  isLoadingProjects
                }
              >
                {moveToolsMutation.status === "pending"
                  ? "Moving..."
                  : "Move Tools"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
