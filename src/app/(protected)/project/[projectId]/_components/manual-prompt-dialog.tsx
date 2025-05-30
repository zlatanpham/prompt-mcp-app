/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import type { Prompt } from "@prisma/client";

const manualPromptFormSchema = z.object({
  name: z.string().min(1, "Prompt name is required"),
  tool_name: z.string().min(1, "Tool name is required"),
  description: z.string().optional(),
  content: z.string().min(1, "Content is required"),
});

export type ManualPromptFormValues = z.infer<typeof manualPromptFormSchema>;

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: ManualPromptFormValues) => void;
  selectedPromptId: string | null;
  prompt?: Prompt | null;
  isSubmitting: boolean;
}

const ManualPromptDialog = (props: Props) => {
  const {
    isOpen,
    onOpenChange,
    onSubmit: onSubmitProp,
    selectedPromptId,
    prompt,
    isSubmitting,
  } = props;

  const form = useForm<ManualPromptFormValues>({
    resolver: zodResolver(manualPromptFormSchema),
    defaultValues: {
      name: "",
      content: "",
    },
  });

  // Reset form when prompt changes
  useEffect(() => {
    if (prompt) {
      form.reset({
        name: prompt.name,
        tool_name: prompt.tool_name,
        description: prompt.description ?? "",
        content: prompt.content,
      });
    } else {
      form.reset({
        name: "",
        tool_name: "",
        description: "",
        content: "",
      });
    }
  }, [prompt, form]);

  function onSubmit(values: ManualPromptFormValues) {
    onSubmitProp(values);
  }

  const onDialogClose = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onDialogClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {selectedPromptId ? "Edit Prompt" : "New Prompt"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Prompt name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tool_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tool name</FormLabel>
                  <FormControl>
                    <Input placeholder="Tool name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Briefly describe the prompt..."
                      className="min-h-20"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content (Markdown)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write markdown content here..."
                      className="max-h-[calc(100dvh-300px)] min-h-40"
                      rows={8}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button type="submit" variant="default" disabled={isSubmitting}>
                {selectedPromptId ? "Update" : "Create"}
              </Button>
              <Button type="button" variant="secondary" onClick={onDialogClose}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ManualPromptDialog;
