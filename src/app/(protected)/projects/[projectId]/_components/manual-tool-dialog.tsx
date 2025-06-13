import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form"; // Added useFieldArray
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
import { Skeleton } from "@/components/ui/skeleton"; // Added Skeleton import
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
  isLoading: boolean; // Added isLoading prop
}

const ManualToolDialog = (props: Props) => {
  const {
    isOpen,
    onOpenChange,
    onSubmit: onSubmitProp,
    selectedToolId,
    tool,
    isSubmitting,
    isLoading, // Destructure isLoading
  } = props;

  const form = useForm<ManualToolFormValues>({
    resolver: zodResolver(manualToolFormSchema),
    defaultValues: {
      name: "",
      prompt: "",
      arguments: [], // Initialize arguments as an empty array
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "arguments",
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
          <Form {...form}>
            <form
              id="manual-tool-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              {isLoading ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-40 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ) : (
                <>
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
                        <FormLabel>Prompt</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Write prompt here..."
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
                    <div className="flex items-center justify-between">
                      <FormLabel>Arguments</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          append({
                            name: "",
                            description: "",
                            type: "string",
                          } as Argument)
                        }
                      >
                        Add Argument
                      </Button>
                    </div>
                    <ArgumentsFormArray fields={fields} remove={remove} />
                  </div>
                </>
              )}
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ManualToolDialog;
