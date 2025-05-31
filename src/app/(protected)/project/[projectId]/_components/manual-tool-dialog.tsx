/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toolNameSchema } from "@/lib/validators/tool";
import { argumentSchema, type Argument } from "@/types/tool";
import { ArgumentsFormArray } from "./arguments-form-array";

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
import type { Tool } from "@prisma/client";

const manualToolFormSchema = z.object({
  name: toolNameSchema,
  description: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  arguments: z.array(argumentSchema).optional(),
});

export type ManualToolFormValues = z.infer<typeof manualToolFormSchema>;

// Extend Prisma's Tool type to include the 'args' field as Argument[]
type ToolWithArguments = Tool & {
  args: Argument[] | null;
};

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: ManualToolFormValues) => void;
  selectedToolId: string | null;
  tool?: ToolWithArguments | null; // Use the extended type
  isSubmitting: boolean;
}

const ManualToolDialog = (props: Props) => {
  const {
    isOpen,
    onOpenChange,
    onSubmit: onSubmitProp,
    selectedToolId,
    tool,
    isSubmitting,
  } = props;

  const form = useForm<ManualToolFormValues>({
    resolver: zodResolver(manualToolFormSchema),
    defaultValues: {
      name: "",
      content: "",
      arguments: [], // Initialize arguments as an empty array
    },
  });

  // Reset form when tool changes
  useEffect(() => {
    if (tool) {
      form.reset({
        name: tool.name,
        description: tool.description ?? "",
        content: tool.content,
        arguments: (tool.args as Argument[]) ?? [], // Cast args to Argument[]
      });
    } else {
      form.reset({
        name: "",
        description: "",
        content: "",
        arguments: [],
      });
    }
  }, [tool, form]);

  function onSubmit(values: ManualToolFormValues) {
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
          <DialogTitle>{selectedToolId ? "Edit Tool" : "New Tool"}</DialogTitle>
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
                      placeholder="Briefly describe the tool..."
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

            <div className="space-y-2">
              <FormLabel>Arguments (Optional)</FormLabel>
              <ArgumentsFormArray name="arguments" />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="submit" variant="default" disabled={isSubmitting}>
                {selectedToolId ? "Update" : "Create"}
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

export default ManualToolDialog;
