import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { editApiKeySchema } from "@/lib/validators/api-key";
import { api } from "@/trpc/react";

interface EditApiKeyProjectsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  apiKeyToEditProjects: {
    id: string;
    name: string;
    currentProjectIds: string[];
  } | null;
  projectOptions: { value: string; label: string }[];
  onApiKeyUpdated: () => void;
}

export function EditApiKeyProjectsDialog({
  isOpen,
  onOpenChange,
  apiKeyToEditProjects,
  projectOptions,
  onApiKeyUpdated,
}: EditApiKeyProjectsDialogProps) {
  const form = useForm<z.infer<typeof editApiKeySchema>>({
    resolver: zodResolver(editApiKeySchema),
    defaultValues: {
      name: "",
      projectIds: [],
    },
  });

  useEffect(() => {
    if (apiKeyToEditProjects) {
      form.reset({
        name: apiKeyToEditProjects.name,
        projectIds: apiKeyToEditProjects.currentProjectIds,
      });
    }
  }, [apiKeyToEditProjects, form]);

  const updateApiKey = api.apiKey.updateApiKey.useMutation({
    onSuccess: () => {
      toast.success("API Key updated successfully!");
      onOpenChange(false);
      onApiKeyUpdated();
    },
    onError: (error) => {
      toast.error("Failed to update API Key", {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof editApiKeySchema>) => {
    if (!apiKeyToEditProjects) return;
    updateApiKey.mutate({ id: apiKeyToEditProjects.id, ...values });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit API Key</DialogTitle>
          <DialogDescription>
            Update the API key name and select projects it can access.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="api-key-name">Name</FormLabel>
                  <FormControl>
                    <Input
                      id="api-key-name"
                      className="col-span-3"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projectIds"
              render={() => (
                <FormItem>
                  <FormLabel htmlFor="edit-projects">Projects</FormLabel>
                  <div className="col-span-3 flex flex-col gap-2 rounded-md border p-3">
                    {projectOptions.map((project) => (
                      <FormField
                        key={project.value}
                        control={form.control}
                        name="projectIds"
                        render={({ field: projectField }) => {
                          return (
                            <FormItem
                              key={project.value}
                              className="flex flex-row items-start space-y-0 space-x-3"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={projectField.value?.includes(
                                    project.value,
                                  )}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? projectField.onChange([
                                          ...(projectField.value || []),
                                          project.value,
                                        ])
                                      : projectField.onChange(
                                          projectField.value?.filter(
                                            (value) => value !== project.value,
                                          ),
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="cursor-pointer font-normal">
                                {project.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                isLoading={updateApiKey.isPending}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
