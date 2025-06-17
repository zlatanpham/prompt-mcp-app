"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
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
  DialogTrigger,
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
import { createApiKeySchema } from "@/lib/validators/api-key";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface CreateApiKeyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectOptions: { value: string; label: string }[];
  onApiKeyCreated: () => void;
}

export function CreateApiKeyDialog({
  isOpen,
  onOpenChange,
  projectOptions,
  onApiKeyCreated,
}: CreateApiKeyDialogProps) {
  const form = useForm<z.infer<typeof createApiKeySchema>>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: {
      name: "",
      projectIds: [],
    },
  });

  const createApiKey = api.apiKey.create.useMutation({
    onSuccess: () => {
      toast.success("API Key created successfully!");
      form.reset();
      onOpenChange(false);
      onApiKeyCreated();
    },
    onError: (error) => {
      toast.error("Failed to create API Key", {
        description: error.message,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof createApiKeySchema>) => {
    createApiKey.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">New API Key</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New API Key</DialogTitle>
          <DialogDescription>
            Generate a new API key and select projects it can access.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <FormControl>
                    <Input id="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projectIds"
              render={({}) => (
                <FormItem>
                  <FormLabel htmlFor="projects">Projects</FormLabel>
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
                isLoading={createApiKey.isPending}
              >
                Create API Key
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
