import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toolNameSchema } from "@/lib/validators/tool";
import { argumentSchema, type Argument } from "@/types/tool";
import { ArgumentsFormArray } from "./arguments-form-array";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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

const manualToolFormSchema = z
  .object({
    name: toolNameSchema,
    description: z.string().min(1, "Description is required"),
    prompt: z.string().min(1, "Prompt is required"),
    arguments: z.array(argumentSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.arguments && data.arguments.length > 0) {
        for (const arg of data.arguments) {
          const placeholder = `{${arg.name}}`;
          if (!data.prompt.includes(placeholder)) {
            return false; // Validation fails
          }
        }
      }
      return true; // Validation passes
    },
    {
      message:
        "Prompt must contain placeholders for all arguments in the format {argumentName}.",
      path: ["prompt"], // Attach error to the prompt field
    },
  );

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
      prompt: "",
      arguments: [], // Initialize arguments as an empty array
    },
  });

  // Reset form when tool changes
  useEffect(() => {
    if (tool) {
      form.reset({
        name: tool.name,
        description: tool.description ?? "",
        prompt: tool.prompt,
        arguments: (tool.args as Argument[]) ?? [], // Cast args to Argument[]
      });
    } else {
      form.reset({
        name: "",
        description: "",
        prompt: "",
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
    <Drawer open={isOpen} onOpenChange={onDialogClose} direction="right">
      <DrawerContent className="sm:max-w-lg">
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <DrawerTitle>
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
                size="sm"
                form="manual-tool-form"
              >
                {selectedToolId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DrawerHeader>
        <div className="overflow-y-auto p-4">
          <Form {...form}>
            <form
              id="manual-tool-form"
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Briefly describe the tool..."
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
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt (Markdown)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write markdown prompt here..."
                        className="max-h-[400px] min-h-40"
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
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ManualToolDialog;
