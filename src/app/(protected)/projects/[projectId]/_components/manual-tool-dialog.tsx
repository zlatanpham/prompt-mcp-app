import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Tool } from "@prisma/client";
import { api } from "@/trpc/react";
import { useQueryClient } from "@tanstack/react-query";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

import {
  ManualToolForm,
  manualToolFormSchema,
  type ManualToolFormValues,
} from "./manual-tool-form";
import { type Argument } from "@/types/tool";

// Extend Prisma's Tool type to include the 'args' field as Argument[]
export type ToolWithArguments = Tool & {
  args: Argument[] | null;
};

export type { ManualToolFormValues };

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedToolId: string | null;
  projectId: string;
}

const ManualToolDialog = (props: Props) => {
  const { isOpen, onOpenChange, selectedToolId, projectId } = props;

  const queryClient = useQueryClient();

  // Fetch single tool for editing
  const { data: tool, isLoading: isLoadingSelectedTool } =
    api.tool.getById.useQuery(
      { id: selectedToolId ?? "" },
      { enabled: !!selectedToolId },
    );

  const form = useForm<ManualToolFormValues>({
    resolver: zodResolver(manualToolFormSchema),
    defaultValues: {
      name: "",
      description: "",
      prompt: "",
      arguments: [],
    },
  });

  // Mutations
  const createTool = api.tool.create.useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [["tool", "getByProjectId"]],
      });
      onOpenChange(false);
      form.reset();
    },
  });

  const updateTool = api.tool.update.useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [["tool", "getByProjectId"]],
      });
      await queryClient.invalidateQueries({
        queryKey: [["tool", "getById", { id: selectedToolId }]],
      });
      onOpenChange(false);
    },
  });

  const isSubmitting = createTool.isPending || updateTool.isPending;
  const isLoading = isLoadingSelectedTool;

  // Reset form when tool changes
  useEffect(() => {
    if (tool && selectedToolId === tool.id) {
      form.reset({
        name: tool.name,
        description: tool.description ?? "",
        prompt: tool.prompt,
        arguments: (tool.args as Argument[]) ?? [],
      });
    } else if (!selectedToolId) {
      form.reset({
        name: "",
        description: "",
        prompt: "",
        arguments: [],
      });
    }
  }, [tool?.id, selectedToolId, form, tool]);

  const onSubmit = async (data: ManualToolFormValues) => {
    if (selectedToolId) {
      void updateTool.mutate({
        id: selectedToolId,
        name: data.name,
        description: data.description,
        prompt: data.prompt,
        args: data.arguments,
      });
    } else {
      void createTool.mutate({
        project_id: projectId,
        name: data.name,
        description: data.description,
        prompt: data.prompt,
        args: data.arguments,
      });
    }
  };

  const onDialogClose = () => {
    onOpenChange(false);
  };

  return (
    <Drawer open={isOpen} onOpenChange={onDialogClose} direction="right">
      <DrawerContent className="sm:max-w-lg">
        <DrawerHeader className="pt-2 pb-0">
          <div className="-mx-4 flex items-center justify-between border-b px-4 pb-2">
            <DrawerTitle className="!text-base">
              {selectedToolId ? "Edit Tool" : "New Tool"}
            </DrawerTitle>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-sm"
                onClick={onDialogClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={isSubmitting}
                size="lg"
                form="manual-tool-form"
              >
                {selectedToolId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DrawerHeader>
        <div className="overflow-y-auto p-4">
          <ManualToolForm
            form={form}
            onSubmit={onSubmit}
            isLoading={isLoading}
            isSubmitting={isSubmitting}
            submitButtonText={selectedToolId ? "Update" : "Create"}
            hideSubmitButton={true}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ManualToolDialog;
